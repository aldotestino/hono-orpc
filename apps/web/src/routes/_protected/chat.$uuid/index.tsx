import {
  experimental_streamedQuery,
  useQuery,
  useSuspenseQueries,
} from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, Settings } from 'lucide-react';
import LiveMessagesStatusIndicator from '@/components/live-messages-status-indicator';
import MessageBox from '@/components/message-box';
import MessageInput from '@/components/message-input';
import { Button } from '@/components/ui/button';
import { useAutoScroll } from '@/lib/hooks/use-autoscroll';
import { client, orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/_protected/chat/$uuid/')({
  loader: async ({ context: { queryClient }, params }) => {
    await Promise.all([
      queryClient.ensureQueryData(
        orpc.chat.getChannel.queryOptions({ input: { uuid: params.uuid } })
      ),
      queryClient.ensureQueryData(
        orpc.chat.getChannelMessages.queryOptions({
          input: { uuid: params.uuid },
        })
      ),
    ]);
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { uuid } = Route.useParams();

  const [{ data: channel }, { data: messages }] = useSuspenseQueries({
    queries: [
      orpc.chat.getChannel.queryOptions({ input: { uuid } }),
      orpc.chat.getChannelMessages.queryOptions({
        input: { uuid },
      }),
    ],
  });

  const {
    data: liveMessages,
    isError: isLiveMessagesError,
    fetchStatus: liveMessagesFetchStatus,
  } = useQuery({
    queryKey: orpc.chat.streamChannelMessages.queryKey({
      input: { uuid },
    }),
    // workaround for https://github.com/TanStack/query/releases/tag/v5.86.0 (queryFn -> streamFn)
    // when fixes, use the commented out code below
    queryFn: experimental_streamedQuery({
      streamFn: ({ signal }) =>
        client.chat.streamChannelMessages({ uuid }, { signal }),
    }),
  });

  // const {
  //   data: liveMessages,
  //   isError: isLiveMessagesError,
  //   fetchStatus: liveMessagesFetchStatus,
  // } = useQuery(
  //   orpc.chat.streamChannelMessages.experimental_streamedOptions({
  //     input: { uuid },
  //   })
  // );

  const { chatContainerRef, handleScroll } = useAutoScroll(
    messages.length + (liveMessages?.length ?? 0)
  );

  return (
    <div className="grid h-screen grid-rows-[1fr_auto] overflow-hidden">
      <div
        className="overflow-y-auto"
        onScroll={handleScroll}
        ref={chatContainerRef}
      >
        <header className="sticky top-0 z-10 grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 bg-background/20 px-4 backdrop-blur-md">
          <Button asChild size="icon" variant="ghost">
            <Link to="/chat">
              <ChevronLeft />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="font-semibold text-lg">#{channel.name}</h1>
            <p className="truncate text-muted-foreground text-sm">
              {channel.participants?.map((p) => p.user?.name).join(', ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <LiveMessagesStatusIndicator
              fetchStatus={liveMessagesFetchStatus}
              isError={isLiveMessagesError}
            />
            <Button asChild size="icon" variant="ghost">
              <Link params={{ uuid }} to="/chat/$uuid/details">
                <Settings />
              </Link>
            </Button>
          </div>
        </header>
        <div className="space-y-2 p-4">
          {messages.map((message) => (
            <MessageBox key={message.uuid} message={message} />
          ))}
          {liveMessages?.map((message) => (
            <MessageBox key={message.uuid} message={message} />
          ))}
        </div>
      </div>
      <div className="p-4">
        <MessageInput channelUuid={uuid} />
      </div>
    </div>
  );
}

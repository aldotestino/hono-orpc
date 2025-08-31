import { useQuery, useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import MessageBox from '@/components/message-box';
import MessageInput from '@/components/message-input';
import { Button } from '@/components/ui/button';
import { useAutoScroll } from '@/lib/hooks/use-autoscroll';
import { orpc } from '@/lib/orpc-client';

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

  const { data: liveMessages } = useQuery(
    orpc.chat.streamChannelMessages.experimental_streamedOptions({
      input: { uuid },
    })
  );

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
        <header className="sticky top-0 z-10 bg-background/20 backdrop-blur-md">
          <div className="mx-auto flex h-15 max-w-screen-md items-center gap-2 px-4">
            <Button asChild size="icon" variant="ghost">
              <Link to="/chat">
                <ChevronLeft />
              </Link>
            </Button>
            <div className="flex-1 cursor-pointer">
              <Link params={{ uuid }} to="/chat/$uuid/details">
                <h1 className="font-semibold text-xl">#{channel.name}</h1>
                <p className="text-muted-foreground text-sm">
                  {channel.participants?.map((p) => p.user?.name).join(', ')}
                </p>
              </Link>
            </div>
            <div className="size-10 rounded-full bg-red-200" />
          </div>
        </header>
        <div>
          <main className="mx-auto max-w-screen-md space-y-2 p-4">
            {messages.map((message) => (
              <MessageBox key={message.uuid} message={message} />
            ))}
            {liveMessages?.map((message) => (
              <MessageBox key={message.uuid} message={message} />
            ))}
          </main>
        </div>
      </div>
      <div>
        <div className="mx-auto flex max-w-screen-md p-4">
          <MessageInput channelUuid={uuid} />
        </div>
      </div>
    </div>
  );
}

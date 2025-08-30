import { useQuery, useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import MessageBox from '@/components/message-box';
import MessageInput from '@/components/message-input';
import { useAutoScroll } from '@/lib/hooks/use-autoscroll';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/_protected/chat/$uuid')({
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
          <div className="mx-auto max-w-screen-md space-y-4 p-4">
            <h1 className="font-semibold text-xl">#{channel.name}</h1>
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

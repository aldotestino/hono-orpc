import { messageInputSchema } from '@hono-orpc/db/schema';
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import Chat from '@/components/chat';
import ChatMessageInput from '@/components/chat-message-input';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/old/chat/$uuid')({
  component: ChatPage,
  validateSearch: messageInputSchema.pick({ sender: true }),
  loader: async ({ context, params: { uuid } }) =>
    context.queryClient.ensureQueryData(
      orpc.chat.messages.queryOptions({
        input: { uuid },
      })
    ),
  pendingComponent: () => (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <Loader className="size-10 animate-spin" />
      <p className="font-semibold text-lg text-muted-foreground">
        Loading messages...
      </p>
    </div>
  ),
});

function ChatPage() {
  const { uuid } = Route.useParams();
  const { sender } = Route.useSearch();

  const { data } = useSuspenseQuery(
    orpc.chat.messages.queryOptions({ input: { uuid } })
  );

  return (
    <div className="flex h-full flex-col">
      <Chat
        channel={data.channel}
        initialMessages={data.messages}
        sender={sender}
      />
      <ChatMessageInput channel={data.channel} sender={sender} />
    </div>
  );
}

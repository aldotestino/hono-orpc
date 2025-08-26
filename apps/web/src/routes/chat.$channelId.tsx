import { messagesInputSchema } from '@hono-orpc/db/schema';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import Chat from '@/components/chat';
import ChatMessageInput from '@/components/chat-message-input';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/chat/$channelId')({
  component: ChatPage,
  validateSearch: messagesInputSchema.pick({ sender: true }),
  loader: async ({ context, params: { channelId } }) =>
    context.queryClient.ensureQueryData(
      orpc.chat.messages.queryOptions({ input: { id: channelId } })
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
  const { channelId } = Route.useParams();
  const { sender } = Route.useSearch();

  return (
    <div className="flex h-full flex-col">
      <Chat channelId={channelId} sender={sender} />
      <ChatMessageInput channelId={channelId} sender={sender} />
    </div>
  );
}

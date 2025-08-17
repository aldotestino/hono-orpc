import { SigninSchema } from '@hono-orpc/schema';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import Chat from '@/components/chat';
import ChatHeader from '@/components/chat-header';
import ChatMessageInput from '@/components/chat-message-input';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/chat')({
  component: ChatPage,
  validateSearch: SigninSchema,
  loaderDeps: ({ search: { channelId } }) => ({ channelId }),
  loader: async ({ context, deps: { channelId } }) =>
    context.queryClient.ensureQueryData(
      orpc.chat.messages.queryOptions({ input: { channelId } })
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
  const { channelId, sender } = Route.useSearch();

  return (
    <div className="flex h-full flex-col">
      <ChatHeader channelId={channelId} sender={sender} />
      <div className="flex-1 overflow-hidden">
        <Chat channelId={channelId} sender={sender} />
      </div>
      <ChatMessageInput channelId={channelId} sender={sender} />
    </div>
  );
}

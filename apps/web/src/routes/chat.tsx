import { SigninSchema } from '@hono-orpc/schema';
import { createFileRoute } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import Chat from '@/components/chat';
import ChatMessageInput from '@/components/chat-message-input';
import ThemeSwitcher from '@/components/theme-switcher';
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
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/20 p-4 backdrop-blur-md">
          <div className="space-y-1">
            <h1 className="font-semibold text-xl">#{channelId}</h1>
            <p className="text-muted-foreground text-sm">
              You are sending messages as{' '}
              <span className="font-semibold text-foreground">{sender}</span>
            </p>
          </div>
          <ThemeSwitcher />
        </div>
        <Chat channelId={channelId} sender={sender} />
      </div>
      <ChatMessageInput channelId={channelId} sender={sender} />
    </div>
  );
}

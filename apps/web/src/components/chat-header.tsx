import type { Signin } from '@hono-orpc/schema';
import ThemeSwitcher from '@/components/theme-switcher';

function ChatHeader({ channelId, sender }: Signin) {
  return (
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
  );
}

export default ChatHeader;

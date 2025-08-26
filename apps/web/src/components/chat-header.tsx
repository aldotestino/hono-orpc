import type { Channel } from '@hono-orpc/db/schema';
import { Copy } from 'lucide-react';
import ThemeSwitcher from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';

function ChatHeader({ channel, sender }: { channel: Channel; sender: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/20 p-4 backdrop-blur-md">
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">#{channel.name}</h1>
        <p className="text-muted-foreground text-sm">
          You are sending messages as{' '}
          <span className="font-semibold text-foreground">{sender}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            navigator.clipboard.writeText(channel.uuid);
          }}
          variant="outline"
        >
          Copy Channel UUID
          <Copy className="size-3" />
        </Button>
        <ThemeSwitcher />
      </div>
    </div>
  );
}

export default ChatHeader;

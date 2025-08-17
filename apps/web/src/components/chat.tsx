import type { Signin } from '@hono-orpc/schema';
import { useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { orpc } from '@/lib/orpc-client';

const avatarBgColor = (sender: string) => {
  const colors = ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'];
  const hash = sender.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return colors[hash % colors.length];
};

function chat({ channelId }: Signin) {
  const { data } = useSuspenseQuery(
    orpc.chat.messages.queryOptions({ input: { channelId } })
  );

  return (
    <div className="space-y-2 p-4">
      {data.map((message) => (
        <div className="flex gap-3" key={message.id}>
          <Avatar>
            <AvatarImage
              alt={message.sender}
              src={`https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${message.sender}&backgroundColor=${avatarBgColor(message.sender)}`}
            />
            <AvatarFallback>
              {message.sender
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-medium text-foreground text-sm">
                {message.sender}
              </span>
              <span className="text-muted-foreground text-xs">
                {format(new Date(message.createdAt), 'MMM d, HH:mm')}
              </span>
            </div>
            <p className="break-words text-foreground text-sm leading-relaxed">
              {message.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default chat;

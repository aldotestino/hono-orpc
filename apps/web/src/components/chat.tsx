import type { Signin } from '@hono-orpc/schema';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import ChatMessage from '@/components/chat-message';
import { orpc } from '@/lib/orpc-client';

function chat({ channelId, sender }: Signin) {
  const { data: initialMessages } = useSuspenseQuery(
    orpc.chat.messages.queryOptions({ input: { channelId } })
  );

  const { data: liveMessages } = useQuery(
    orpc.chat.streamMessages.experimental_streamedOptions({
      input: { channelId },
      retry: true,
    })
  );

  return (
    <div className="space-y-2 p-4">
      {initialMessages.map((message) => (
        <ChatMessage key={message.id} message={message} sender={sender} />
      ))}
      {liveMessages?.map((message) => (
        <ChatMessage key={message.id} message={message} sender={sender} />
      ))}
    </div>
  );
}

export default chat;

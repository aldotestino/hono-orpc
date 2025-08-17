import type { Signin } from '@hono-orpc/schema';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import ChatMessage from '@/components/chat-message';
import { useAutoScroll } from '@/lib/hooks/use-autoscroll';
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

  const totalMessages = initialMessages.length + (liveMessages?.length ?? 0);
  const { chatContainerRef, handleScroll } = useAutoScroll(totalMessages);

  return (
    <div
      className="h-full space-y-2 overflow-y-auto p-4"
      onScroll={handleScroll}
      ref={chatContainerRef}
    >
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

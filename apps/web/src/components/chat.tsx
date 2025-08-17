import type { Signin } from '@hono-orpc/schema';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import ChatHeader from '@/components/chat-header';
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
      className="h-full flex-1 overflow-hidden overflow-y-auto"
      onScroll={handleScroll}
      ref={chatContainerRef}
    >
      <ChatHeader channelId={channelId} sender={sender} />
      <div className="space-y-2 p-4">
        {initialMessages.map((message) => (
          <ChatMessage key={message.id} message={message} sender={sender} />
        ))}
        {liveMessages?.map((message) => (
          <ChatMessage key={message.id} message={message} sender={sender} />
        ))}
      </div>
    </div>
  );
}

export default chat;

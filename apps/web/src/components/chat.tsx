import type { Channel, Message } from '@hono-orpc/db/schema';
import { useQuery } from '@tanstack/react-query';
import ChatHeader from '@/components/chat-header';
import ChatMessage from '@/components/chat-message';
import { useAutoScroll } from '@/lib/hooks/use-autoscroll';
import { orpc } from '@/lib/orpc-client';

function Chat({
  initialMessages,
  channel,
  sender,
}: {
  initialMessages: Message[];
  channel: Channel;
  sender: string;
}) {
  const { data: liveMessages } = useQuery(
    orpc.chat.streamMessages.experimental_streamedOptions({
      input: { uuid: channel.uuid },
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
      <ChatHeader channel={channel} sender={sender} />
      <div className="space-y-2 p-4">
        {initialMessages.map((message) => (
          <ChatMessage key={message.uuid} message={message} sender={sender} />
        ))}
        {liveMessages?.map((message) => (
          <ChatMessage key={message.uuid} message={message} sender={sender} />
        ))}
      </div>
    </div>
  );
}

export default Chat;

import type { Message, User } from "@hono-orpc/db/schema";
import { format } from "date-fns";

function MessageBox({
  message,
}: {
  message: Message & {
    sender: User | null;
  };
}) {
  return (
    <div className="space-y-1" key={message.uuid}>
      <div className="flex items-center justify-between gap-2 text-muted-foreground text-sm">
        <p>{message.sender?.name}</p>
        <p>{format(message.createdAt, "MMM d, yyyy HH:mm")}</p>
      </div>
      <p className="text-lg">{message.content}</p>
    </div>
  );
}

export default MessageBox;

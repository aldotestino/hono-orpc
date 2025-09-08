import type { User } from "@hono-orpc/db/schema";
import type { ComponentProps } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function UserAvatar<T extends Partial<User> | null | undefined>({
  user,
  className,
  ...props
}: { user: T } & ComponentProps<typeof Avatar>) {
  return (
    <Avatar className={cn("size-10", className)} {...props}>
      <AvatarImage alt={user?.name} src={user?.image || undefined} />
      <AvatarFallback className="uppercase">
        {user?.name?.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  );
}

export default UserAvatar;

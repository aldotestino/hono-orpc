import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { SimpleUser } from '@/lib/types';

function UserListItem({
  user,
  orientation = 'horizontal',
}: {
  user: SimpleUser;
  orientation?: 'horizontal' | 'vertical';
}) {
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-1">
        <Avatar className="size-10">
          <AvatarImage alt={user?.name} src={user?.image || undefined} />
          <AvatarFallback className="uppercase">
            {user?.name?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <p className="min-w-0 max-w-16 truncate font-semibold">{user?.name}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-10">
        <AvatarImage alt={user?.name} src={user?.image || undefined} />
        <AvatarFallback className="uppercase">
          {user?.name?.slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{user?.name}</p>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>
    </div>
  );
}

export default UserListItem;

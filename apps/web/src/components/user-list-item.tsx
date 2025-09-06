import type { User } from '@hono-orpc/db/schema';
import UserAvatar from '@/components/user-avatar';

function UserListItem({
  user,
  orientation = 'horizontal',
}: {
  user: User | null;
  orientation?: 'horizontal' | 'vertical';
}) {
  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-1">
        <UserAvatar user={user} />
        <p className="min-w-0 max-w-16 truncate font-semibold">{user?.name}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <UserAvatar user={user} />
      <div>
        <p className="font-semibold">{user?.name}</p>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>
    </div>
  );
}

export default UserListItem;

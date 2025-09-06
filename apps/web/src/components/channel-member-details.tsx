import type { ChannelParticipant, User } from '@hono-orpc/db/schema';
import { format } from 'date-fns';
import { ChevronRight, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import UserAvatar from '@/components/user-avatar';
import UserListItem from '@/components/user-list-item';
import { authClient } from '@/lib/auth';

function ChannelMemberDetails({
  channelOwnerId,
  member,
}: {
  member: ChannelParticipant & { user: User | null };
  channelOwnerId: string;
  isOwner: boolean;
}) {
  const { data } = authClient.useSession();

  return (
    <div className="flex items-center justify-between">
      <UserListItem user={member.user} />
      <div className="flex items-center gap-2">
        {channelOwnerId === member.userId && (
          <Badge variant="outline">Owner</Badge>
        )}
        {member.userId !== data?.user.id && (
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="icon" variant="ghost">
                <ChevronRight />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <div className="flex items-center gap-2">
                  <UserAvatar user={member.user} />
                  <div className="text-start">
                    <DrawerTitle>{member.user?.name}</DrawerTitle>
                    <DrawerDescription>{member.user?.email}</DrawerDescription>
                  </div>
                </div>
              </DrawerHeader>

              <div className="grid grid-cols-[1fr_auto] gap-2 p-4">
                <span className="text-muted-foreground">Joined at</span>
                <span>{format(member.createdAt, 'MMM d, yyyy HH:mm')}</span>
                <span className="text-muted-foreground">Role</span>
                <span>
                  <Badge className="capitalize" variant="outline">
                    {member.role as 'owner' | 'member'}
                  </Badge>
                </span>
              </div>

              <DrawerFooter>
                <Button variant="destructive">
                  <Trash2 />
                  Remove From Channel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}

export default ChannelMemberDetails;

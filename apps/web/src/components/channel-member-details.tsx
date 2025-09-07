import type { ChannelParticipant, User } from '@hono-orpc/db/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronRight, Trash2 } from 'lucide-react';
import ConfirmAction from '@/components/confirm-action';
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
import { orpc } from '@/lib/orpc-client';

function ChannelMemberDetails({
  channelOwnerId,
  member,
  isOwner,
}: {
  member: ChannelParticipant & { user: User | null };
  channelOwnerId: string;
  isOwner: boolean;
}) {
  const { data } = authClient.useSession();

  const queryClient = useQueryClient();

  const { mutateAsync: removeMemberFromChannel } = useMutation(
    orpc.chat.channel.removeMemberFromChannel.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: orpc.chat.channel.getChannel.queryKey({
            input: { uuid: member.channelUuid },
          }),
        });
      },
    })
  );

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

              {isOwner && (
                <DrawerFooter>
                  <ConfirmAction
                    action={() =>
                      removeMemberFromChannel({
                        uuid: member.channelUuid,
                        memberId: member.userId,
                      })
                    }
                    description="Are you sure you want to remove this member from the channel?"
                    title={`Remove "${member.user?.name}" From Channel`}
                  >
                    <Button variant="destructive">
                      <Trash2 />
                      Remove From Channel
                    </Button>
                  </ConfirmAction>
                </DrawerFooter>
              )}
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}

export default ChannelMemberDetails;

import type { ChannelParticipant, User } from '@hono-orpc/db/schema';
import { useSuspenseQuery } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import AddMembersToChannel from '@/components/add-members-to-channel';
import ChannelMemberDetails from '@/components/channel-member-details';
import ConfirmAction from '@/components/confirm-action';
import { Button } from '@/components/ui/button';
import { orpc } from '@/lib/orpc-client';

function ChannelMembers({
  channelUuid,
  isOwner,
  onLeaveChannel,
}: {
  channelUuid: string;
  isOwner: boolean;
  onLeaveChannel: () => void;
}) {
  const { data: channel } = useSuspenseQuery(
    orpc.chat.getChannel.queryOptions({ input: { uuid: channelUuid } })
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">
          {channel.participants?.length} Members
        </h2>
      </div>
      {channel.participants?.map((p) => (
        <ChannelMemberDetails
          channelOwnerId={channel.ownerId}
          isOwner={isOwner}
          key={p.userId}
          member={p as ChannelParticipant & { user: User | null }}
        />
      ))}
      {isOwner ? (
        <AddMembersToChannel channel={channel} />
      ) : (
        <ConfirmAction
          action={onLeaveChannel}
          description="Are you sure you want to leave this channel?"
          title="Leave Channel"
        >
          <Button className="w-full" variant="destructive">
            <LogOut />
            Leave Channel
          </Button>
        </ConfirmAction>
      )}
    </div>
  );
}

export default ChannelMembers;

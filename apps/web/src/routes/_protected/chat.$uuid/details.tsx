import type { ChannelParticipant, User } from '@hono-orpc/db/schema';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, LogOut, Plus, Trash2 } from 'lucide-react';
import ChannelMemberDetails from '@/components/channel-member-details';
import ConfirmAction from '@/components/confirm-action';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/_protected/chat/$uuid/details')({
  component: RouteComponent,
  loader: async ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(
      orpc.chat.getChannel.queryOptions({ input: { uuid: params.uuid } })
    ),
});

function RouteComponent() {
  const { uuid } = Route.useParams();

  const { data } = authClient.useSession();

  const { data: channel } = useSuspenseQuery(
    orpc.chat.getChannel.queryOptions({ input: { uuid } })
  );

  const isOwner = data?.user.id === channel.ownerId;

  const navigate = useNavigate();

  const { mutateAsync: leavChannel } = useMutation(
    orpc.chat.leaveChannel.mutationOptions({
      onSuccess: () => {
        navigate({ to: '/chat' });
      },
    })
  );

  const { mutateAsync: deleteChannel } = useMutation(
    orpc.chat.deleteChannel.mutationOptions({
      onSuccess: () => {
        navigate({ to: '/chat' });
      },
    })
  );

  return (
    <div className="grid h-screen grid-rows-[1fr_auto] overflow-hidden">
      <div className="overflow-y-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-2 bg-background/20 px-4 backdrop-blur-md">
          <Button asChild size="icon" variant="ghost">
            <Link params={{ uuid }} to="/chat/$uuid">
              <ChevronLeft />
            </Link>
          </Button>
          <h1 className="min-w-0 truncate font-semibold text-lg">
            #{channel.name}
          </h1>
        </header>
        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">Members</h2>
            {isOwner && (
              <Button size="icon" variant="ghost">
                <Plus />
              </Button>
            )}
          </div>
          {channel.participants?.map((p) => (
            <ChannelMemberDetails
              channelOwnerId={channel.ownerId}
              isOwner={isOwner}
              key={p.userId}
              member={p as ChannelParticipant & { user: User | null }}
            />
          ))}
        </div>
      </div>
      <div className="p-4">
        {isOwner ? (
          <ConfirmAction
            action={() => deleteChannel({ uuid })}
            description="Are you sure you want to delete this channel?"
            title="Delete Channel"
          >
            <Button className="w-full" variant="destructive">
              <Trash2 />
              Delete Channel
            </Button>
          </ConfirmAction>
        ) : (
          <ConfirmAction
            action={() => leavChannel({ uuid })}
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
    </div>
  );
}

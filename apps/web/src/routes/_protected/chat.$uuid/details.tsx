import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import ChannelMembers from '@/components/channel-members';
import ChannelSettings from '@/components/channel-settings';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

  const queryClient = useQueryClient();

  function cleanupQueries() {
    return Promise.all([
      queryClient.removeQueries({
        queryKey: orpc.chat.getChannel.queryKey({
          input: { uuid },
        }),
      }),
      queryClient.removeQueries({
        queryKey: orpc.chat.getChannelMessages.queryKey({
          input: { uuid },
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: orpc.chat.getChannels.queryKey(),
      }),
    ]);
  }

  const { mutateAsync: leaveChannel } = useMutation(
    orpc.chat.leaveChannel.mutationOptions({
      onSuccess: async () => {
        await cleanupQueries();
        navigate({ to: '/chat' });
      },
    })
  );

  const { mutateAsync: deleteChannel } = useMutation(
    orpc.chat.deleteChannel.mutationOptions({
      onSuccess: async () => {
        await cleanupQueries();
        navigate({ to: '/chat' });
      },
    })
  );

  return (
    <div>
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

      <div className="p-4">
        <Tabs defaultValue="members">
          <TabsList className="w-full">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            {isOwner && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="members">
            <ChannelMembers
              channelUuid={uuid}
              isOwner={isOwner}
              onLeaveChannel={() => leaveChannel({ uuid })}
            />
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-4">
              <h2 className="font-semibold text-lg">Stats</h2>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <ChannelSettings
              channelUuid={uuid}
              onDeleteChannel={() => deleteChannel({ uuid })}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

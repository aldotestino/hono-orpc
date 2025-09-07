import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/_protected/_bottom-navigation/chat')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(orpc.chat.channel.getChannels.queryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(
    orpc.chat.channel.getChannels.queryOptions()
  );

  return (
    <main>
      {data.map((channel) => (
        <Link
          key={channel.uuid}
          params={{ uuid: channel.uuid }}
          to="/chat/$uuid"
        >
          <div className="cursor-pointer p-4 text-lg hover:bg-accent/20">
            #{channel.name}
          </div>
        </Link>
      ))}
      {data.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No channels found
        </div>
      )}
    </main>
  );
}

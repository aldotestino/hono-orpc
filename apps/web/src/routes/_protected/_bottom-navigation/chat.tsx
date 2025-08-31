import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/_protected/_bottom-navigation/chat')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(orpc.chat.getChannels.queryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(orpc.chat.getChannels.queryOptions());

  return (
    <main>
      {data.map((channel) => (
        <div
          className="cursor-pointer p-4 text-lg hover:bg-accent/20"
          key={channel.uuid}
        >
          <Link params={{ uuid: channel.uuid }} to="/chat/$uuid">
            #{channel.name}
          </Link>
        </div>
      ))}
      {data.length === 0 && (
        <div className="p-4 text-center text-muted-foreground">
          No channels found
        </div>
      )}
    </main>
  );
}

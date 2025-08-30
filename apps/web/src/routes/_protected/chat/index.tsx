import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/_protected/chat/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(orpc.chat.getChannels.queryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(orpc.chat.getChannels.queryOptions());

  return (
    <div>
      {data.map((channel) => (
        <div key={channel.uuid}>{channel.name}</div>
      ))}
    </div>
  );
}

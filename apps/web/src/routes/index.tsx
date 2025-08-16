import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const { data } = useQuery(orpc.greetings.random.queryOptions());

  return <div>{data?.message}</div>;
}

import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import ThemeSwitcher from '@/components/theme-switcher';
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
      <header className="sticky top-0 z-10 bg-background/20 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-screen-md items-center justify-between gap-2 px-4">
          <h1 className="font-semibold text-xl">Channels</h1>
          <ThemeSwitcher />
        </div>
      </header>
      <div>
        <main className="mx-auto max-w-screen-md divide-y">
          {data.map((channel) => (
            <div
              className="rounded p-4 text-lg hover:bg-accent"
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
      </div>
    </div>
  );
}

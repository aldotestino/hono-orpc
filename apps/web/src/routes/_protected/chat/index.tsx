import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import ThemeSwitcher from '@/components/theme-switcher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { orpc } from '@/lib/orpc-client';

export const Route = createFileRoute('/_protected/chat/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(orpc.chat.getChannels.queryOptions()),
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useSuspenseQuery(orpc.chat.getChannels.queryOptions());
  const [search, setSearch] = useState('');

  const filteredChannels = useMemo(
    () =>
      data.filter((channel) =>
        channel.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, data]
  );

  return (
    <div>
      <header className="sticky top-0 z-10 bg-background/20 backdrop-blur-md">
        <div className="mx-auto max-w-screen-md space-y-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="font-semibold text-xl">Channels</h1>
            <ThemeSwitcher />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                className="peer ps-9"
                id="search"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="#channel"
                value={search}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search aria-hidden="true" size={16} />
              </div>
            </div>
            <Button>
              <Plus />
              Channel
            </Button>
          </div>
        </div>
      </header>
      <div>
        <main className="mx-auto max-w-screen-md divide-y p-4">
          {filteredChannels.map((channel) => (
            <div className="rounded p-4 hover:bg-accent" key={channel.uuid}>
              <Link params={{ uuid: channel.uuid }} to="/chat/$uuid">
                #{channel.name}
              </Link>
            </div>
          ))}
          {filteredChannels.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              No channels found
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

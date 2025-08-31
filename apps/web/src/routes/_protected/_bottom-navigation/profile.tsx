import { createFileRoute } from '@tanstack/react-router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth';

export const Route = createFileRoute('/_protected/_bottom-navigation/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = authClient.useSession();

  return (
    <main className="space-y-4 px-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <Avatar className="size-24">
          <AvatarImage
            alt={data?.user?.name}
            src={data?.user?.image || undefined}
          />
          <AvatarFallback className="text-3xl uppercase">
            {data?.user?.name?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="font-semibold text-2xl">{data?.user.name}</p>
          <p className="text-muted-foreground">{data?.user.email}</p>
        </div>
      </div>
    </main>
  );
}

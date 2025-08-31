import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth';

export const Route = createFileRoute('/_protected/_bottom-navigation/profile')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const { data } = authClient.useSession();

  async function handleSignOut() {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: '/', reloadDocument: true });
  }

  return (
    <main className="space-y-8 p-4">
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
      <Button className="w-full" onClick={handleSignOut}>
        <LogOut />
        Sign out
      </Button>
    </main>
  );
}

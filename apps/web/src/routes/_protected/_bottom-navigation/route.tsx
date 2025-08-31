import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from '@tanstack/react-router';
import { MessageCircle, User } from 'lucide-react';
import NewChannel from '@/components/new-channel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_protected/_bottom-navigation')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();

  return (
    <div className="grid h-screen grid-rows-[1fr_auto] overflow-hidden">
      <div className="overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between bg-background/20 px-4 backdrop-blur-md">
          <h1 className="font-semibold text-xl">
            {pathname === '/chat' ? 'Chat' : 'Profile'}
          </h1>
          {pathname === '/chat' && <NewChannel />}
        </header>
        <Outlet />
      </div>
      <footer className="flex items-center justify-center gap-10 p-4">
        <Button
          asChild
          className={cn(pathname === '/chat' && 'text-primary')}
          size="lg"
          variant="ghost"
        >
          <Link to="/chat">
            <MessageCircle className="size-6" />
            Chat
          </Link>
        </Button>
        <Button
          asChild
          className={cn(pathname === '/profile' && 'text-primary')}
          size="lg"
          variant="ghost"
        >
          <Link to="/profile">
            <User className="size-6" />
            Profile
          </Link>
        </Button>
      </footer>
    </div>
  );
}

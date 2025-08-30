import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { authClient } from '@/lib/auth';

export const Route = createFileRoute('/_protected')({
  beforeLoad: async () => {
    const session = await authClient.getSession();

    if (!session.data) {
      throw redirect({ to: '/' });
    }
  },
  component: Outlet,
});

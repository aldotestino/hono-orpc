import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  beforeLoad: ({ context: { auth } }) => {
    if (!auth.data) {
      throw redirect({ to: '/' });
    }
  },
  component: Outlet,
});

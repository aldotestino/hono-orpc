import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: ({ context: { auth } }) => {
    if (auth.data) {
      throw redirect({ to: "/chat" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full items-center justify-center">
      <Outlet />
    </div>
  );
}

import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Toaster } from "@/components/ui/sonner";
import type { authClient } from "@/lib/auth";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

type MyRouterContext = {
  queryClient: QueryClient;
  auth: ReturnType<typeof authClient.useSession>;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <div className="h-screen">
        <Outlet />
      </div>
      <Toaster />
      {import.meta.env.DEV && (
        <TanStackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
      )}
    </>
  ),
});

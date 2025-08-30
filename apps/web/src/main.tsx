import { createRouter, RouterProvider } from '@tanstack/react-router';
import { Loader } from 'lucide-react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Provider as TanStackQueryProvider,
  getContext as tanstackQueryContext,
} from './integrations/tanstack-query/root-provider.tsx';

// Import the generated route tree
import { routeTree } from './routeTree.gen';

import './styles.css';
import { authClient } from '@/lib/auth.ts';
import { ThemeProvider } from '@/providers/theme-provider.tsx';
import reportWebVitals from './reportWebVitals.ts';

// Create a new router instance

const TanStackQueryProviderContext = tanstackQueryContext();
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
    auth: {
      isAuthenticated: false,
    },
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: necessary interface
  interface Register {
    router: typeof router;
  }
}

function RouterProviderWithAuth() {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="grid h-screen place-items-center">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <RouterProvider
      context={{ auth: { isAuthenticated: data !== null } }}
      router={router}
    />
  );
}

// Render the app
const rootElement = document.getElementById('app');
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider {...TanStackQueryProviderContext}>
        <ThemeProvider>
          <RouterProviderWithAuth />
        </ThemeProvider>
      </TanStackQueryProvider>
    </StrictMode>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

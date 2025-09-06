import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const QUERY_STALE_TIME = 300_000; // 5 minutes

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: (query) => {
          // always refetch messages
          const flatQueryKeys = query.queryKey.flat();
          if (
            flatQueryKeys.includes('streamChannelMessages') ||
            flatQueryKeys.includes('getChannelMessages')
          ) {
            return 0;
          }
          return QUERY_STALE_TIME;
        },
      },
    },
  });

  return {
    queryClient,
  };
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

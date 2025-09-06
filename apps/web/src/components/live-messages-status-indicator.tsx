/** biome-ignore-all lint/style/noNestedTernary: use ternary to determine status */
import type { FetchStatus } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function LiveMessagesStatusIndicator({
  isError,
  fetchStatus,
}: {
  isError: boolean;
  fetchStatus: FetchStatus;
}) {
  const status = isError
    ? 'error'
    : fetchStatus === 'idle'
      ? 'connecting'
      : 'connected';
  const animated = status !== 'error';

  return (
    <Badge className="flex items-center gap-1.5 capitalize" variant="outline">
      <span className="relative flex size-2">
        {animated && (
          <span
            className={cn(
              'absolute inline-flex size-2 animate-ping rounded-full',
              {
                'bg-yellow-500': status === 'connecting',
                'bg-green-500': status === 'connected',
              }
            )}
          />
        )}
        <span
          className={cn('relative inline-flex size-2 rounded-full', {
            'bg-red-500': status === 'error',
            'bg-yellow-500': status === 'connecting',
            'bg-green-500': status === 'connected',
          })}
        />
      </span>
      {status}
    </Badge>
  );
}

export default LiveMessagesStatusIndicator;

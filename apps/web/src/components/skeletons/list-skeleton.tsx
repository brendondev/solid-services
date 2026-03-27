import { Skeleton } from '@/components/ui/skeleton';

interface ListSkeletonProps {
  items?: number;
  variant?: 'default' | 'detailed' | 'compact';
}

/**
 * Skeleton para listas genéricas
 */
export function ListSkeleton({
  items = 5,
  variant = 'default',
}: ListSkeletonProps) {
  if (variant === 'detailed') {
    return <DetailedListSkeleton items={items} />;
  }

  if (variant === 'compact') {
    return <CompactListSkeleton items={items} />;
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-4 flex items-center gap-4"
        >
          <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Lista detalhada com mais informações
 */
function DetailedListSkeleton({ items }: { items: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-14 w-14 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Skeleton className="h-4 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Lista compacta para sidebars ou espaços pequenos
 */
function CompactListSkeleton({ items }: { items: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-6 w-6 rounded" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para lista de notificações
 */
export function NotificationListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-2 w-2 rounded-full flex-shrink-0 mt-2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para timeline/feed
 */
export function TimelineSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline dot and line */}
          <div className="flex flex-col items-center">
            <Skeleton className="h-3 w-3 rounded-full" />
            {index < items - 1 && (
              <div className="w-px h-full bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-6">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListSkeleton;

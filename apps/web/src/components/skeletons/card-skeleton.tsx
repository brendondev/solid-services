import { Skeleton } from '@/components/ui/skeleton';

interface CardSkeletonProps {
  count?: number;
  layout?: 'grid' | 'list';
  showImage?: boolean;
}

/**
 * Skeleton para cards genéricos
 */
export function CardSkeleton({
  count = 3,
  layout = 'grid',
  showImage = false,
}: CardSkeletonProps) {
  const containerClass = layout === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'space-y-4';

  return (
    <div className={containerClass}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-4 sm:p-6"
        >
          {showImage && (
            <Skeleton className="h-48 w-full rounded-lg mb-4" />
          )}
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para card de estatística/métrica (dashboard KPI)
 */
export function StatCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-card rounded-lg border border-border p-4 sm:p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-20 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para card detalhado (ex: detalhes do cliente)
 */
export function DetailCardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      {/* Content sections */}
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <div key={sectionIndex}>
            <Skeleton className="h-5 w-32 mb-3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, fieldIndex) => (
                <div key={fieldIndex} className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export default CardSkeleton;

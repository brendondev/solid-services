import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  showActions?: boolean;
}

/**
 * Skeleton para tabelas
 * Usado durante carregamento de listas (customers, orders, etc.)
 */
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
  showActions = true,
}: TableSkeletonProps) {
  return (
    <div className="w-full">
      {/* Header */}
      {showHeader && (
        <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${columns + (showActions ? 1 : 0)}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-8 w-full" />
          ))}
          {showActions && <Skeleton className="h-8 w-20 ml-auto" />}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4 p-4 bg-white rounded-lg border border-border"
            style={{ gridTemplateColumns: `repeat(${columns + (showActions ? 1 : 0)}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`col-${colIndex}`}
                className="h-5"
                style={{ width: `${60 + Math.random() * 40}%` }}
              />
            ))}
            {showActions && (
              <div className="flex gap-2 justify-end">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para tabela responsiva (mobile)
 */
export function MobileTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default TableSkeleton;

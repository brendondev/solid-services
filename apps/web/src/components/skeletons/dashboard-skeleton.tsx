import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton completo para a página de dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-20 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-36" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para seção de gráficos
 */
export function ChartSkeleton({ title }: { title?: string }) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          {title && <Skeleton className="h-3 w-32" />}
        </div>
      </div>
      <Skeleton className="h-80 w-full rounded-lg" />
      <div className="flex gap-4 justify-center mt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton para widget de performance
 */
export function PerformanceWidgetSkeleton() {
  return (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-lg border-2 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card/50 p-4 rounded-lg">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-6 w-16 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardSkeleton;

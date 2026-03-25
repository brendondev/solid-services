import { Skeleton } from '@/components/ui/skeleton';

interface FormSkeletonProps {
  fields?: number;
  columns?: 1 | 2;
  showActions?: boolean;
}

/**
 * Skeleton para formulários
 */
export function FormSkeleton({
  fields = 6,
  columns = 2,
  showActions = true,
}: FormSkeletonProps) {
  const gridClass = columns === 2
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
    : 'space-y-4';

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      {/* Form title */}
      <div className="mb-6 pb-4 border-b">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Form fields */}
      <div className={gridClass}>
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-3 mt-6 pt-6 border-t">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton para campo de formulário individual
 */
export function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/**
 * Skeleton para formulário com seções
 */
export function SectionedFormSkeleton({ sections = 3 }: { sections?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: sections }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="bg-white rounded-lg border border-border p-6"
        >
          {/* Section header */}
          <div className="mb-4 pb-3 border-b">
            <Skeleton className="h-6 w-40 mb-1" />
            <Skeleton className="h-3 w-64" />
          </div>

          {/* Section fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, fieldIndex) => (
              <FieldSkeleton key={fieldIndex} />
            ))}
          </div>
        </div>
      ))}

      {/* Global actions */}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  );
}

export default FormSkeleton;

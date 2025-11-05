import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state for customers page
 * Shows skeleton for search, filters, and table
 */
export default function CustomersLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Info Bar */}
      <Skeleton className="h-5 w-48" />

      {/* Table Skeleton */}
      <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-neutral-200 bg-neutral-50">
          <div className="grid grid-cols-5 gap-4 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-5 w-24" />
            ))}
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-neutral-200">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4">
              {[1, 2, 3, 4, 5].map((j) => (
                <Skeleton key={j} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}



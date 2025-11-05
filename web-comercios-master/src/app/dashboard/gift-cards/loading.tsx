import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state for gift cards page
 */
export default function GiftCardsLoading() {
  return (
    <div className="container mx-auto space-y-6 p-4 pb-16 md:p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-6">
            <Skeleton className="h-5 w-32 mb-3" />
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Validation Card */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>

      {/* Tabs */}
      <div>
        <Skeleton className="h-10 w-96 mb-6" />

        {/* Table */}
        <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
          <div className="border-b border-neutral-200 bg-neutral-50 p-4">
            <div className="grid grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          </div>

          <div className="divide-y divide-neutral-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-6 gap-4 p-4">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <Skeleton key={j} className="h-5 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

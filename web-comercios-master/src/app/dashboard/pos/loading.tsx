import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state for POS page
 */
export default function PosLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Skeleton className="h-9 w-64 mb-2" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer Search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Search Card */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Customer Info Card (when selected) */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-5 w-2/3" />
            </div>
          </div>

          {/* Transaction Form */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Points Calculator */}
          <div className="rounded-lg border border-neutral-200 bg-white p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>

          {/* Action Button */}
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}



import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/layout/container';

/**
 * Loading state for analytics page
 * Shows skeleton for metrics, charts, and insights
 */
export default function AnalyticsLoading() {
  return (
    <Container>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Period Selector */}
      <div className="mb-8">
        <Skeleton className="h-10 w-full max-w-md" />
      </div>

      {/* Metrics Grid - 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <Skeleton className="h-10 w-24 mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="mb-12">
        <Skeleton className="h-8 w-48 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>

        <Skeleton className="h-80 rounded-lg" />
      </div>

      {/* Insights Section */}
      <div className="mb-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    </Container>
  );
}



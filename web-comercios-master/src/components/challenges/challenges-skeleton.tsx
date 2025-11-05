'use client';

import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export interface ChallengesSkeletonProps {
  count?: number;
}

const ChallengeCardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <Card ref={ref} className={className} {...props}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <Skeleton shape="circle" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton height={24} width="60%" />
            <div className="flex gap-2">
              <Skeleton height={20} width={80} />
              <Skeleton height={20} width={60} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 space-y-2">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" />
        </div>

        {/* Metrics */}
        <div className="mb-4 rounded-lg bg-neutral-50 p-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton height={12} width={40} />
              <Skeleton height={32} width={60} />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton height={12} width={40} />
              <Skeleton height={24} width={50} />
            </div>
          </div>
        </div>

        {/* Completion stats */}
        <div className="mb-4">
          <Skeleton height={16} width="50%" />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Skeleton height={36} width={80} />
          <Skeleton height={36} width={80} />
          <Skeleton height={36} width={100} />
        </div>
      </div>
    </Card>
  );
});

ChallengeCardSkeleton.displayName = 'ChallengeCardSkeleton';

export const ChallengesSkeleton = React.forwardRef<
  HTMLDivElement,
  ChallengesSkeletonProps
>(({ count = 3 }, ref) => {
  return (
    <div ref={ref} className="space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton height={32} width={200} />
        <Skeleton height={44} width={140} />
      </div>

      {/* Active Challenges Section */}
      <div className="space-y-4">
        <Skeleton height={24} width={180} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <ChallengeCardSkeleton key={`active-${i}`} />
          ))}
        </div>
      </div>

      {/* Paused Challenges Section */}
      <div className="space-y-4">
        <Skeleton height={24} width={180} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ChallengeCardSkeleton />
        </div>
      </div>
    </div>
  );
});

ChallengesSkeleton.displayName = 'ChallengesSkeleton';

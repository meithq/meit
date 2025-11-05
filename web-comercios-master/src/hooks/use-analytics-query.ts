'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth-store';
import { format, subDays } from 'date-fns';
import { DATE_FORMATS } from '@/lib/constants';
import { queryKeys } from '@/lib/react-query';
import {
  fetchDashboardMetrics,
  fetchFullAnalytics,
  type AnalyticsMetrics,
  type ChartDataPoint,
  type TopChallenge,
  type InsightData,
  type FullAnalyticsData,
} from '@/lib/api/analytics';

// Re-export types for convenience
export type {
  AnalyticsMetrics,
  ChartDataPoint,
  TopChallenge,
  InsightData,
  FullAnalyticsData,
};

/**
 * Hook to fetch dashboard metrics with optimistic UI
 * Real-time updates with 1 second staleTime like Finaena
 */
export function useDashboardMetrics() {
  const merchantId = useAuthStore((state) => state.merchantId);

  return useQuery({
    queryKey: queryKeys.analytics.metrics(merchantId || ''),
    queryFn: () => fetchDashboardMetrics(merchantId!),
    enabled: !!merchantId,
    staleTime: 1000, // 1 second - real-time metrics like Finaena
    placeholderData: keepPreviousData, // Show previous data while loading new data
  });
}

/**
 * Hook to fetch full analytics with date range and optimistic UI
 * Uses global staleTime (5 seconds) for consistent caching
 */
export function useFullAnalytics(dateRange?: { from: Date; to: Date }) {
  const merchantId = useAuthStore((state) => state.merchantId);
  const fromDate = dateRange?.from || subDays(new Date(), 30);
  const toDate = dateRange?.to || new Date();

  const fromStr = format(fromDate, DATE_FORMATS.API);
  const toStr = format(toDate, DATE_FORMATS.API);

  return useQuery({
    queryKey: queryKeys.analytics.fullAnalytics(merchantId || '', fromStr, toStr),
    queryFn: () => fetchFullAnalytics(merchantId!, fromDate, toDate),
    enabled: !!merchantId,
    // Uses global staleTime: 5s for fresher data
    placeholderData: keepPreviousData, // Show previous data while loading new data
  });
}


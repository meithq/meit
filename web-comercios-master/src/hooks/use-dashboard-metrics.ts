'use client';

import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';

export interface DashboardMetrics {
  today_visits: number;
  today_points: number;
  active_customers: number;
  active_challenges: number;
  total_customers: number;
  total_points_distributed: number;
}

/**
 * Hook for fetching dashboard metrics from API route
 * Uses cached endpoint with ISR (60s revalidation)
 */
export function useDashboardMetrics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const merchantId = useAuthStore((state) => state.merchantId);

  const fetchMetrics = useCallback(async () => {
    if (!merchantId) {
      setError('No merchant ID found');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/metrics?merchantId=${merchantId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch metrics');
      }

      setMetrics(result.data);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  return {
    metrics,
    loading,
    error,
    fetchMetrics,
  };
}

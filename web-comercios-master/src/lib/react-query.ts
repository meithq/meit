import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * React Query configuration
 *
 * Optimized for performance with aggressive caching and stale-while-revalidate strategy
 */

const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: 5 seconds - aggressive caching like Finaena for instant navigation
    // Data is considered fresh for this duration, then refetches in background
    staleTime: 5 * 1000,

    // Cache time: 10 minutes - unused data stays in cache for this duration
    gcTime: 10 * 60 * 1000,

    // Retry failed queries once with faster backoff for better UX
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch on window focus for data freshness
    refetchOnWindowFocus: true,

    // Don't refetch on mount if data is still fresh
    refetchOnMount: false,

    // Refetch on reconnect for data consistency
    refetchOnReconnect: true,

    // Enable network mode for better offline support
    networkMode: 'online',
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
    networkMode: 'online',
  },
};

/**
 * Create a new QueryClient instance
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

/**
 * Query keys factory for consistent cache keys
 * This prevents typos and makes invalidation easier
 */
export const queryKeys = {
  // Analytics queries
  analytics: {
    all: ['analytics'] as const,
    metrics: (merchantId: string) => [...queryKeys.analytics.all, 'metrics', merchantId] as const,
    trends: (merchantId: string, metric: string) =>
      [...queryKeys.analytics.all, 'trends', merchantId, metric] as const,
    fullAnalytics: (merchantId: string, from: string, to: string) =>
      [...queryKeys.analytics.all, 'full', merchantId, from, to] as const,
  },

  // Customers queries
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (merchantId: string, filters?: string) =>
      [...queryKeys.customers.lists(), merchantId, filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (merchantId: string, customerId: string) =>
      [...queryKeys.customers.details(), merchantId, customerId] as const,
    search: (merchantId: string, phone: string) =>
      [...queryKeys.customers.all, 'search', merchantId, phone] as const,
  },

  // Branches queries
  branches: {
    all: ['branches'] as const,
    lists: () => [...queryKeys.branches.all, 'list'] as const,
    list: (merchantId: string) => [...queryKeys.branches.lists(), merchantId] as const,
    details: () => [...queryKeys.branches.all, 'detail'] as const,
    detail: (merchantId: string, branchId: string) =>
      [...queryKeys.branches.details(), merchantId, branchId] as const,
  },

  // Challenges queries
  challenges: {
    all: ['challenges'] as const,
    lists: () => [...queryKeys.challenges.all, 'list'] as const,
    list: (merchantId: string) => [...queryKeys.challenges.lists(), merchantId] as const,
    details: () => [...queryKeys.challenges.all, 'detail'] as const,
    detail: (merchantId: string, challengeId: string) =>
      [...queryKeys.challenges.details(), merchantId, challengeId] as const,
  },

  // Gift cards queries
  giftCards: {
    all: ['gift-cards'] as const,
    lists: () => [...queryKeys.giftCards.all, 'list'] as const,
    list: (merchantId: string, status?: string) =>
      [...queryKeys.giftCards.lists(), merchantId, status] as const,
    stats: (merchantId: string) => [...queryKeys.giftCards.all, 'stats', merchantId] as const,
  },

  // POS queries
  pos: {
    all: ['pos'] as const,
    calculator: (merchantId: string) => [...queryKeys.pos.all, 'calculator', merchantId] as const,
  },

  // Settings queries
  settings: {
    all: ['settings'] as const,
    business: (merchantId: string) => [...queryKeys.settings.all, 'business', merchantId] as const,
    points: (merchantId: string) => [...queryKeys.settings.all, 'points', merchantId] as const,
  },
};

/**
 * Helper to invalidate multiple related queries
 */
export const invalidateQueries = {
  // Invalidate all analytics data
  analytics: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
  },

  // Invalidate all customers data
  customers: (queryClient: QueryClient) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
  },

  // Invalidate specific customer
  customer: (queryClient: QueryClient, merchantId: string, customerId: string) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys.customers.detail(merchantId, customerId),
    });
  },

  // Invalidate all after POS transaction (affects multiple entities)
  afterTransaction: (queryClient: QueryClient) => {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.giftCards.all }),
    ]);
  },
};









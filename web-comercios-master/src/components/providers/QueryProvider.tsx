'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { createQueryClient } from '@/lib/react-query';

/**
 * React Query Provider
 *
 * Wraps the app with QueryClientProvider for data fetching and caching
 * Includes devtools in development for debugging
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance once per component mount
  // This ensures server and client have separate instances
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools in development only */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          position="bottom"
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}



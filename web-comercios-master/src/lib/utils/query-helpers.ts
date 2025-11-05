/**
 * Query Helper Utilities
 *
 * Utilities for handling async operations with timeouts and retries
 */

/**
 * Wraps a promise with a timeout
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that rejects if timeout is reached
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Retry a promise with exponential backoff
 * @param fn - Function that returns a promise
 * @param maxRetries - Maximum number of retries
 * @param baseDelay - Base delay in milliseconds
 * @returns Promise with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Safe result type for Promise.allSettled results
 */
export type SafeResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Converts Promise.allSettled result to safe result
 */
export function toSafeResult<T>(
  result: PromiseSettledResult<T>
): SafeResult<T> {
  if (result.status === 'fulfilled') {
    return { success: true, data: result.value };
  }
  return {
    success: false,
    error: result.reason instanceof Error ? result.reason.message : 'Unknown error',
  };
}

/**
 * Extracts data from safe result with fallback
 */
export function extractData<T>(
  result: SafeResult<T>,
  fallback: T
): T {
  return result.success && result.data !== undefined ? result.data : fallback;
}

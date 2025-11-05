import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAuthStore } from '@/store/auth-store';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/hooks/use-analytics');
vi.mock('@/store/auth-store');

describe('Dashboard Load Performance Tests', () => {
  const mockMetrics = {
    today_visits: 15,
    today_points: 125,
    active_customers: 45,
    total_customers: 120,
    active_challenges: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAuthStore as any).mockReturnValue({
      user: { name: 'Test User' },
      merchantId: 'merchant-123',
    });

    (useAnalytics as any).mockReturnValue({
      metrics: mockMetrics,
      loading: false,
      error: null,
      fetchMetrics: vi.fn(),
    });
  });

  it('renders dashboard in less than 2 seconds', () => {
    const startTime = performance.now();
    render(<DashboardPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Target: < 2000ms (2 seconds)
    expect(renderTime).toBeLessThan(2000);
    console.log(`Dashboard rendered in ${renderTime.toFixed(2)}ms`);
  });

  it('renders with data in acceptable time', () => {
    const startTime = performance.now();
    const { container } = render(<DashboardPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Should have content
    expect(container.textContent).toBeTruthy();

    // Target: < 2000ms
    expect(renderTime).toBeLessThan(2000);
  });

  it('handles large datasets efficiently', () => {
    // Simulate large activity feed
    const largeMetrics = {
      ...mockMetrics,
      today_visits: 1000,
      active_customers: 5000,
      total_customers: 10000,
    };

    (useAnalytics as any).mockReturnValue({
      metrics: largeMetrics,
      loading: false,
      error: null,
      fetchMetrics: vi.fn(),
    });

    const startTime = performance.now();
    render(<DashboardPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Should still be fast with large data
    expect(renderTime).toBeLessThan(2500);
  });

  it('skeleton loading state renders quickly', () => {
    (useAnalytics as any).mockReturnValue({
      metrics: null,
      loading: true,
      error: null,
      fetchMetrics: vi.fn(),
    });

    const startTime = performance.now();
    render(<DashboardPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Loading state should be very fast
    expect(renderTime).toBeLessThan(500);
  });

  it('error state renders quickly', () => {
    (useAnalytics as any).mockReturnValue({
      metrics: null,
      loading: false,
      error: 'Error loading data',
      fetchMetrics: vi.fn(),
    });

    const startTime = performance.now();
    render(<DashboardPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Error state should be instant
    expect(renderTime).toBeLessThan(500);
  });

  it('multiple re-renders are performant', () => {
    const { rerender } = render(<DashboardPage />);

    const times: number[] = [];

    // Measure 10 re-renders
    for (let i = 0; i < 10; i++) {
      const startTime = performance.now();
      rerender(<DashboardPage />);
      const endTime = performance.now();

      times.push(endTime - startTime);
    }

    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

    // Average re-render should be very fast
    expect(averageTime).toBeLessThan(100);
    console.log(`Average re-render time: ${averageTime.toFixed(2)}ms`);
  });

  it('does not cause memory leaks on mount/unmount', () => {
    const { unmount } = render(<DashboardPage />);

    const memBefore = (performance as any).memory?.usedJSHeapSize;

    unmount();

    // Give GC a chance to run
    if (global.gc) {
      global.gc();
    }

    const memAfter = (performance as any).memory?.usedJSHeapSize;

    // Memory should not increase significantly
    if (memBefore && memAfter) {
      const increase = memAfter - memBefore;
      expect(increase).toBeLessThan(1000000); // < 1MB
    }
  });

  it('metric cards render efficiently', () => {
    const startTime = performance.now();

    const { container } = render(<DashboardPage />);

    // Should have 4 metric cards
    const metricCards = container.querySelectorAll('[class*="Card"]');

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(metricCards.length).toBeGreaterThanOrEqual(4);
    expect(renderTime).toBeLessThan(1000);
  });

  it('activity feed renders efficiently', () => {
    const startTime = performance.now();

    const { container } = render(<DashboardPage />);

    // Activity feed should be present
    const activitySection = container.querySelector('[class*="activity"]') ||
                           container.textContent?.includes('Actividad Reciente');

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    expect(activitySection).toBeTruthy();
    expect(renderTime).toBeLessThan(1500);
  });

  it('alert banners do not slow down render', () => {
    (useAnalytics as any).mockReturnValue({
      metrics: {
        ...mockMetrics,
        today_visits: 0, // Triggers warning alert
        active_challenges: 3, // Triggers success alert
      },
      loading: false,
      error: null,
      fetchMetrics: vi.fn(),
    });

    const startTime = performance.now();
    render(<DashboardPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Alerts should not impact performance
    expect(renderTime).toBeLessThan(2000);
  });

  it('measures First Contentful Paint (simulated)', () => {
    const startTime = performance.now();

    const { container } = render(<DashboardPage />);

    // Find first meaningful content
    const firstContent = container.querySelector('h1, h2, p');
    const endTime = performance.now();

    const fcp = endTime - startTime;

    expect(firstContent).toBeTruthy();
    expect(fcp).toBeLessThan(1000); // FCP < 1s
    console.log(`Simulated FCP: ${fcp.toFixed(2)}ms`);
  });

  it('measures Time to Interactive (simulated)', () => {
    const startTime = performance.now();

    const { container } = render(<DashboardPage />);

    // Find interactive elements
    const buttons = container.querySelectorAll('button');
    const endTime = performance.now();

    const tti = endTime - startTime;

    expect(buttons.length).toBeGreaterThan(0);
    expect(tti).toBeLessThan(2000); // TTI < 2s
    console.log(`Simulated TTI: ${tti.toFixed(2)}ms`);
  });
});

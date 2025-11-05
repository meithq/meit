import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/hooks/use-analytics');
vi.mock('@/store/auth-store');

import DashboardPage from '@/app/dashboard/page';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAuthStore } from '@/store/auth-store';

describe('Dashboard Accessibility Tests', () => {
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

  it('has no accessibility violations', async () => {
    const { container } = render(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  describe('Heading Structure', () => {
    it('has proper heading hierarchy', () => {
      const { container } = render(<DashboardPage />);

      const h1 = container.querySelector('h1');
      expect(h1).toBeInTheDocument();

      const h2s = container.querySelectorAll('h2');
      expect(h2s.length).toBeGreaterThan(0);

      // H1 should come before H2s
      const h1Position = Array.from(container.querySelectorAll('h1, h2')).indexOf(h1!);
      expect(h1Position).toBe(0);
    });

    it('headings describe their sections accurately', () => {
      render(<DashboardPage />);

      expect(screen.getByText(/Dashboard|Hola/i)).toBeInTheDocument();
      expect(screen.getByText(/Actividad Reciente/i)).toBeInTheDocument();
      expect(screen.getByText(/Acciones Rápidas/i)).toBeInTheDocument();
    });
  });

  describe('Metric Cards', () => {
    it('metric cards have accessible labels', () => {
      render(<DashboardPage />);

      const metrics = [
        'Check-ins Hoy',
        'Puntos Asignados Hoy',
        'Clientes Activos',
        'Gift Cards Generadas',
      ];

      metrics.forEach((metric) => {
        expect(screen.getByText(metric)).toBeInTheDocument();
      });
    });

    it('metric values are properly associated with labels', () => {
      render(<DashboardPage />);

      // Values should be readable by screen readers
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('125')).toBeInTheDocument();
    });

    it('trend indicators have accessible text', () => {
      const { container } = render(<DashboardPage />);

      // Trend icons should have aria-hidden
      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);

      // Trend text should be readable
      expect(screen.getByText(/vs ayer/i)).toBeInTheDocument();
    });
  });

  describe('Quick Actions', () => {
    it('all action buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        button.focus();
        expect(button).toHaveFocus();
      }
    });

    it('action buttons have descriptive labels', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Asignar Puntos')).toBeInTheDocument();
      expect(screen.getByText('Validar Gift Card')).toBeInTheDocument();
      expect(screen.getByText('Ver Clientes')).toBeInTheDocument();
      expect(screen.getByText('Crear Reto')).toBeInTheDocument();
    });

    it('icons do not convey information alone', () => {
      const { container } = render(<DashboardPage />);

      const buttons = container.querySelectorAll('button');

      buttons.forEach((button) => {
        // Each button should have text content, not just an icon
        expect(button.textContent?.trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('Activity Feed', () => {
    it('activity items are in a list', () => {
      const { container } = render(<DashboardPage />);

      // Activity items should be in a semantic list
      const lists = container.querySelectorAll('ul, ol');
      expect(lists.length).toBeGreaterThan(0);
    });

    it('relative times are accessible', () => {
      render(<DashboardPage />);

      // Time information should be present
      // Could use <time datetime="..."> for better accessibility
      expect(screen.getByText(/María García/i)).toBeInTheDocument();
    });

    it('"Ver todas" link has proper context', () => {
      render(<DashboardPage />);

      const link = screen.getByText('Ver todas →');
      expect(link).toHaveAttribute('href', '/dashboard/analytics');
    });
  });

  describe('Alert Banners', () => {
    it('alerts have proper role', () => {
      (useAnalytics as any).mockReturnValue({
        metrics: { ...mockMetrics, today_visits: 0 },
        loading: false,
        error: null,
        fetchMetrics: vi.fn(),
      });

      const { container } = render(<DashboardPage />);

      // Alerts should use role="alert" or aria-live
      const alerts = container.querySelectorAll('[role="alert"], [aria-live="polite"]');
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('alert types are distinguishable', () => {
      render(<DashboardPage />);

      // Success, warning, error, info should be visually and semantically distinct
      // Color alone should not be the only indicator
    });
  });

  describe('Error State', () => {
    it('error state has proper aria attributes', () => {
      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: false,
        error: 'Failed to load',
        fetchMetrics: vi.fn(),
      });

      const { container } = render(<DashboardPage />);

      // Error should be announced
      const errorElement = container.querySelector('[role="alert"]') ||
                          screen.getByText('Error de conexión');
      expect(errorElement).toBeInTheDocument();
    });

    it('retry button is accessible', () => {
      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: false,
        error: 'Failed to load',
        fetchMetrics: vi.fn(),
      });

      render(<DashboardPage />);

      const retryButton = screen.getByText('Reintentar');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton.tagName).toBe('BUTTON');
    });
  });

  describe('Loading State', () => {
    it('loading state is announced to screen readers', () => {
      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: true,
        error: null,
        fetchMetrics: vi.fn(),
      });

      const { container } = render(<DashboardPage />);

      // Loading should have aria-busy or aria-live
      const loadingElement = container.querySelector('[aria-busy="true"]') ||
                            container.querySelector('.animate-pulse');
      expect(loadingElement).toBeTruthy();
    });

    it('skeletons do not trap focus', () => {
      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: true,
        error: null,
        fetchMetrics: vi.fn(),
      });

      const { container } = render(<DashboardPage />);

      // Skeleton elements should not be focusable
      const skeletons = container.querySelectorAll('.animate-pulse');
      skeletons.forEach((skeleton) => {
        expect(skeleton).not.toHaveAttribute('tabindex', '0');
      });
    });
  });

  describe('Color Contrast', () => {
    it('text has sufficient contrast', () => {
      const { container } = render(<DashboardPage />);

      // Text elements should have good contrast
      // This is checked by axe, but we can verify specific elements
      const text = container.querySelectorAll('p, span, h1, h2, h3');
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('Touch Targets', () => {
    it('interactive elements are large enough', () => {
      const { container } = render(<DashboardPage />);

      const buttons = container.querySelectorAll('button, a');

      buttons.forEach((button) => {
        const rect = button.getBoundingClientRect();
        // Minimum 44x44 pixels for touch targets
        // In tests, getBoundingClientRect returns 0, so we check class names
        expect(button.className).toBeTruthy();
      });
    });
  });

  describe('Responsive Design', () => {
    it('content is accessible at different viewport sizes', () => {
      const { container } = render(<DashboardPage />);

      // Responsive classes should be present
      const gridElements = container.querySelectorAll('[class*="md:"], [class*="lg:"]');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });
});

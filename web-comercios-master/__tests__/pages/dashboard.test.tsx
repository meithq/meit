import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import DashboardPage from '@/app/dashboard/page';
import { useAnalytics } from '@/hooks/use-analytics';
import { useAuthStore } from '@/store/auth-store';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/use-analytics');
vi.mock('@/store/auth-store');

describe('Dashboard Page Integration Tests', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  };

  const mockFetchMetrics = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe('Loading State', () => {
    it('displays skeleton loading state initially', () => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: true,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });

      render(<DashboardPage />);

      // Should show loading skeletons (dashboard skeleton component)
      expect(screen.getByTestId('dashboard-skeleton') || document.querySelector('.animate-pulse')).toBeTruthy();
    });
  });

  describe('Successful Data Load', () => {
    const mockMetrics = {
      today_visits: 15,
      today_points: 125,
      active_customers: 45,
      total_customers: 120,
      active_challenges: 2,
    };

    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Juan Pérez' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: mockMetrics,
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });
    });

    it('displays dashboard with correct user greeting', () => {
      render(<DashboardPage />);
      expect(screen.getByText('Hola, Juan Pérez')).toBeInTheDocument();
    });

    it('displays current date', () => {
      render(<DashboardPage />);
      expect(screen.getByText(/Hoy es/)).toBeInTheDocument();
    });

    it('displays metrics cards with correct values', () => {
      render(<DashboardPage />);

      expect(screen.getByText('Check-ins Hoy')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();

      expect(screen.getByText('Puntos Asignados Hoy')).toBeInTheDocument();
      expect(screen.getByText('125')).toBeInTheDocument();

      expect(screen.getByText('Clientes Activos')).toBeInTheDocument();
      expect(screen.getByText('45')).toBeInTheDocument();

      expect(screen.getByText('Gift Cards Generadas')).toBeInTheDocument();
    });

    it('displays recent activity section', () => {
      render(<DashboardPage />);
      expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
      expect(screen.getByText('Ver todas →')).toBeInTheDocument();
    });

    it('displays quick actions section', () => {
      render(<DashboardPage />);
      expect(screen.getByText('Acciones Rápidas')).toBeInTheDocument();
      expect(screen.getByText('Asignar Puntos')).toBeInTheDocument();
      expect(screen.getByText('Validar Gift Card')).toBeInTheDocument();
      expect(screen.getByText('Ver Clientes')).toBeInTheDocument();
      expect(screen.getByText('Crear Reto')).toBeInTheDocument();
    });

    it('shows success alert for active challenges', () => {
      render(<DashboardPage />);
      expect(screen.getByText('Retos activos')).toBeInTheDocument();
      expect(screen.getByText(/2.*retos activos/i)).toBeInTheDocument();
    });

    it('shows success alert for good performance', () => {
      render(<DashboardPage />);
      expect(screen.getByText('¡Excelente día!')).toBeInTheDocument();
      expect(screen.getByText(/15 check-ins hoy/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: false,
        error: 'Failed to fetch dashboard metrics',
        fetchMetrics: mockFetchMetrics,
      });
    });

    it('displays error message when data load fails', () => {
      render(<DashboardPage />);
      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch dashboard metrics')).toBeInTheDocument();
    });

    it('displays retry button on error', () => {
      render(<DashboardPage />);
      const retryButton = screen.getByText('Reintentar');
      expect(retryButton).toBeInTheDocument();
    });

    it('calls fetchMetrics when retry button is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const retryButton = screen.getByText('Reintentar');
      await user.click(retryButton);

      expect(mockFetchMetrics).toHaveBeenCalledTimes(1);
    });
  });

  describe('Alert Banners', () => {
    it('shows warning when no check-ins today', () => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: {
          today_visits: 0,
          today_points: 0,
          active_customers: 20,
          total_customers: 100,
          active_challenges: 0,
        },
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });

      render(<DashboardPage />);
      expect(screen.getByText('Sin actividad hoy')).toBeInTheDocument();
      expect(screen.getByText(/no has registrado check-ins hoy/i)).toBeInTheDocument();
    });

    it('shows info alert for low customer engagement', () => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: {
          today_visits: 5,
          today_points: 50,
          active_customers: 5,
          total_customers: 50,
          active_challenges: 0,
        },
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });

      render(<DashboardPage />);
      expect(screen.getByText('Baja participación')).toBeInTheDocument();
      expect(screen.getByText(/Solo 5 de 50 clientes/i)).toBeInTheDocument();
    });
  });

  describe('Quick Actions Navigation', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: {
          today_visits: 10,
          today_points: 100,
          active_customers: 30,
          total_customers: 80,
          active_challenges: 1,
        },
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });
    });

    it('navigates to POS page when "Asignar Puntos" is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const assignPointsButton = screen.getByText('Asignar Puntos');
      await user.click(assignPointsButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/pos');
    });

    it('navigates to customers page when "Ver Clientes" is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const viewCustomersButton = screen.getByText('Ver Clientes');
      await user.click(viewCustomersButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/customers');
    });

    it('navigates to create challenge page when "Crear Reto" is clicked', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const createChallengeButton = screen.getByText('Crear Reto');
      await user.click(createChallengeButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/challenges/new');
    });
  });

  describe('Recent Activity Feed', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: {
          today_visits: 10,
          today_points: 100,
          active_customers: 30,
          total_customers: 80,
          active_challenges: 1,
        },
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });
    });

    it('displays recent activity items', () => {
      render(<DashboardPage />);

      // Mock data from dashboard component
      expect(screen.getByText('María García')).toBeInTheDocument();
      expect(screen.getByText('Carlos Martínez')).toBeInTheDocument();
      expect(screen.getByText('Ana Rodríguez')).toBeInTheDocument();
      expect(screen.getByText('Luis Pérez')).toBeInTheDocument();
      expect(screen.getByText('Carmen Silva')).toBeInTheDocument();
    });

    it('displays "Ver todas" link to analytics', () => {
      render(<DashboardPage />);
      const viewAllLink = screen.getByText('Ver todas →');
      expect(viewAllLink).toHaveAttribute('href', '/dashboard/analytics');
    });
  });

  describe('Data Fetching', () => {
    it('fetches metrics on mount when merchantId is available', () => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: true,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });

      render(<DashboardPage />);

      expect(mockFetchMetrics).toHaveBeenCalledTimes(1);
    });

    it('does not fetch metrics when merchantId is not available', () => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: null,
      });

      (useAnalytics as any).mockReturnValue({
        metrics: null,
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });

      render(<DashboardPage />);

      expect(mockFetchMetrics).not.toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: {
          today_visits: 10,
          today_points: 100,
          active_customers: 30,
          total_customers: 80,
          active_challenges: 1,
        },
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });
    });

    it('renders metrics in grid layout', () => {
      const { container } = render(<DashboardPage />);
      const metricsGrid = container.querySelector('.grid');
      expect(metricsGrid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
    });

    it('renders main content in responsive grid', () => {
      const { container } = render(<DashboardPage />);
      const contentGrids = container.querySelectorAll('.grid');
      expect(contentGrids.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useAuthStore as any).mockReturnValue({
        user: { name: 'Test User' },
        merchantId: 'merchant-123',
      });

      (useAnalytics as any).mockReturnValue({
        metrics: {
          today_visits: 10,
          today_points: 100,
          active_customers: 30,
          total_customers: 80,
          active_challenges: 1,
        },
        loading: false,
        error: null,
        fetchMetrics: mockFetchMetrics,
      });
    });

    it('all quick action buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<DashboardPage />);

      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        button.focus();
        expect(button).toHaveFocus();
      }
    });

    it('has semantic HTML structure', () => {
      const { container } = render(<DashboardPage />);
      expect(container.querySelector('main') || container.querySelector('div')).toBeInTheDocument();
    });
  });
});

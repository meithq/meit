import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import PosPage from '@/app/pos/page';
import { useCustomerLookup } from '@/hooks/use-customer-lookup';
import { usePointsCalculator } from '@/hooks/use-points-calculator';
import { usePosTransaction } from '@/hooks/use-pos-transaction';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/use-customer-lookup');
vi.mock('@/hooks/use-points-calculator');
vi.mock('@/hooks/use-pos-transaction');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('POS Page Integration Tests', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  };

  const mockSearchCustomer = vi.fn();
  const mockClearCustomer = vi.fn();
  const mockSetPhone = vi.fn();
  const mockAssignPoints = vi.fn();

  const mockCustomer = {
    id: 'customer-123',
    name: 'Juan Pérez',
    phone: '+584121234567',
    email: 'juan@example.com',
    total_points: 75,
    points_balance: 75,
    total_checkins: 45,
    created_at: '2024-01-15T10:00:00Z',
    last_visit: '2024-10-12T16:30:00Z',
  };

  const mockCalculation = {
    basePoints: 50,
    challengePoints: 25,
    totalPoints: 75,
    completedChallenges: [
      {
        id: 'challenge-1',
        name: 'Visit 5 times this week',
        reward_points: 25,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    localStorageMock.setItem('merchantId', 'merchant-123');

    (useRouter as any).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    beforeEach(() => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '',
        setPhone: mockSetPhone,
        customer: null,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: null,
        loading: false,
      });

      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });
    });

    it('displays page header', () => {
      render(<PosPage />);
      expect(screen.getByText('Punto de Venta')).toBeInTheDocument();
      expect(screen.getByText('Asignación rápida de puntos')).toBeInTheDocument();
    });

    it('displays back button to dashboard', () => {
      render(<PosPage />);
      const backButton = screen.getByLabelText('Volver al dashboard');
      expect(backButton).toBeInTheDocument();
    });

    it('displays instructions card when no customer', () => {
      render(<PosPage />);
      expect(screen.getByText('Instrucciones de uso')).toBeInTheDocument();
      expect(screen.getByText(/Ingrese el número de teléfono del cliente/i)).toBeInTheDocument();
    });

    it('displays keyboard shortcuts hint', () => {
      render(<PosPage />);
      expect(screen.getByText(/Ctrl\+Enter/i)).toBeInTheDocument();
      expect(screen.getByText(/Esc/i)).toBeInTheDocument();
    });
  });

  describe('Customer Lookup Flow', () => {
    beforeEach(() => {
      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: null,
        loading: false,
      });
    });

    it('displays phone input field', () => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '',
        setPhone: mockSetPhone,
        customer: null,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      render(<PosPage />);
      const phoneInput = screen.getByRole('textbox', { name: /teléfono/i }) ||
                         document.querySelector('input[type="tel"]');
      expect(phoneInput).toBeInTheDocument();
    });

    it('shows loading state during customer search', () => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '+584121234567',
        setPhone: mockSetPhone,
        customer: null,
        loading: true,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      render(<PosPage />);
      expect(screen.getByText(/buscando/i) || document.querySelector('.animate-spin')).toBeTruthy();
    });

    it('displays customer information after successful lookup', () => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '+584121234567',
        setPhone: mockSetPhone,
        customer: mockCustomer,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: mockCalculation,
        loading: false,
      });

      render(<PosPage />);
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText(/75.*pts/i) || screen.getByText('75')).toBeInTheDocument();
    });

    it('displays error message on failed lookup', () => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '+584121234567',
        setPhone: mockSetPhone,
        customer: null,
        loading: false,
        error: 'Customer not found',
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      render(<PosPage />);
      expect(screen.getByText('Customer not found')).toBeInTheDocument();
    });
  });

  describe('Points Calculation', () => {
    beforeEach(() => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '+584121234567',
        setPhone: mockSetPhone,
        customer: mockCustomer,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });
    });

    it('displays points calculator with breakdown', () => {
      (usePointsCalculator as any).mockReturnValue({
        calculation: mockCalculation,
        loading: false,
      });

      render(<PosPage />);

      expect(screen.getByText(/75.*pts/i) || screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText(/50/)).toBeInTheDocument(); // Base points
      expect(screen.getByText(/25/)).toBeInTheDocument(); // Challenge points
    });

    it('shows loading state during calculation', () => {
      (usePointsCalculator as any).mockReturnValue({
        calculation: null,
        loading: true,
      });

      render(<PosPage />);
      expect(document.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('displays completed challenges', () => {
      (usePointsCalculator as any).mockReturnValue({
        calculation: mockCalculation,
        loading: false,
      });

      render(<PosPage />);
      expect(screen.getByText('Visit 5 times this week')).toBeInTheDocument();
    });
  });

  describe('Gift Card Alerts', () => {
    beforeEach(() => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '+584121234567',
        setPhone: mockSetPhone,
        customer: mockCustomer,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });
    });

    it('shows gift card generation alert when threshold will be reached', () => {
      (usePointsCalculator as any).mockReturnValue({
        calculation: mockCalculation,
        loading: false,
      });

      render(<PosPage />);

      // Customer has 75 points, will get 75 more = 150 total, which is >= 100
      expect(screen.getByText(/gift card/i) || screen.getByText(/tarjeta de regalo/i)).toBeInTheDocument();
    });

    it('shows progress indicator when close to threshold', () => {
      const customerNearThreshold = { ...mockCustomer, total_points: 50 };

      (useCustomerLookup as any).mockReturnValue({
        phone: '+584121234567',
        setPhone: mockSetPhone,
        customer: customerNearThreshold,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      const smallCalculation = {
        basePoints: 10,
        challengePoints: 0,
        totalPoints: 10,
        completedChallenges: [],
      };

      (usePointsCalculator as any).mockReturnValue({
        calculation: smallCalculation,
        loading: false,
      });

      render(<PosPage />);

      // Should show progress (50 + 10 = 60/100)
      expect(screen.getByText(/60.*100/i) || screen.getByText('60')).toBeTruthy();
    });
  });

  describe('Point Assignment', () => {
    beforeEach(() => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '+584121234567',
        setPhone: mockSetPhone,
        customer: mockCustomer,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: mockCalculation,
        loading: false,
      });

      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });
    });

    it('assign button is disabled when no customer selected', () => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '',
        setPhone: mockSetPhone,
        customer: null,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: null,
        loading: false,
      });

      render(<PosPage />);
      const assignButton = screen.getByText(/asignar/i);
      expect(assignButton).toBeDisabled();
    });

    it('assign button is disabled when no amount entered', () => {
      render(<PosPage />);

      // Amount is empty by default
      const assignButton = screen.getByText(/asignar/i);
      expect(assignButton).toBeDisabled();
    });

    it('assign button is enabled when customer and amount are valid', async () => {
      const user = userEvent.setup();
      render(<PosPage />);

      // Enter amount
      const amountInput = screen.getByLabelText(/monto/i) ||
                         screen.getByPlaceholderText(/monto/i) ||
                         document.querySelector('input[type="number"]');

      if (amountInput) {
        await user.type(amountInput as HTMLElement, '500');

        await waitFor(() => {
          const assignButton = screen.getByText(/asignar/i);
          expect(assignButton).not.toBeDisabled();
        });
      }
    });

    it('calls assignPoints with correct parameters', async () => {
      const user = userEvent.setup();
      mockAssignPoints.mockResolvedValue({ success: true });

      render(<PosPage />);

      // Enter amount
      const amountInput = screen.getByLabelText(/monto/i) ||
                         screen.getByPlaceholderText(/monto/i) ||
                         document.querySelector('input[type="number"]');

      if (amountInput) {
        await user.type(amountInput as HTMLElement, '500');

        // Click assign button
        const assignButton = screen.getByText(/asignar/i);
        await user.click(assignButton);

        await waitFor(() => {
          expect(mockAssignPoints).toHaveBeenCalledWith({
            customerId: 'customer-123',
            merchantId: 'merchant-123',
            branchId: null,
            amount: 500,
            points: 75,
            challengeIds: ['challenge-1'],
          });
        });
      }
    });

    it('shows loading state during submission', () => {
      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: true,
      });

      render(<PosPage />);

      const assignButton = screen.getByText(/asignando/i) || screen.getByText(/asignar/i);
      expect(assignButton).toBeDisabled();
    });

    it('resets form after successful assignment', async () => {
      const user = userEvent.setup();
      mockAssignPoints.mockResolvedValue({ success: true });

      render(<PosPage />);

      const amountInput = screen.getByLabelText(/monto/i) ||
                         document.querySelector('input[type="number"]');

      if (amountInput) {
        await user.type(amountInput as HTMLElement, '500');

        const assignButton = screen.getByText(/asignar/i);
        await user.click(assignButton);

        await waitFor(() => {
          expect(mockClearCustomer).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '',
        setPhone: mockSetPhone,
        customer: null,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: null,
        loading: false,
      });

      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });
    });

    it('navigates to dashboard when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<PosPage />);

      const backButton = screen.getByLabelText('Volver al dashboard');
      await user.click(backButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Performance Target', () => {
    it('renders quickly for POS operations', () => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '',
        setPhone: mockSetPhone,
        customer: null,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: null,
        loading: false,
      });

      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });

      const startTime = performance.now();
      render(<PosPage />);
      const endTime = performance.now();

      // Should render in less than 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useCustomerLookup as any).mockReturnValue({
        phone: '',
        setPhone: mockSetPhone,
        customer: null,
        loading: false,
        error: null,
        searchCustomer: mockSearchCustomer,
        clearCustomer: mockClearCustomer,
      });

      (usePointsCalculator as any).mockReturnValue({
        calculation: null,
        loading: false,
      });

      (usePosTransaction as any).mockReturnValue({
        assignPoints: mockAssignPoints,
        submitting: false,
      });
    });

    it('back button has accessible label', () => {
      render(<PosPage />);
      expect(screen.getByLabelText('Volver al dashboard')).toBeInTheDocument();
    });

    it('main content is in a main element', () => {
      const { container } = render(<PosPage />);
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('icons have aria-hidden attribute', () => {
      const { container } = render(<PosPage />);
      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});

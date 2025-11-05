import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PosPage from '@/app/pos/page';
import { useCustomerLookup } from '@/hooks/use-customer-lookup';
import { usePointsCalculator } from '@/hooks/use-points-calculator';
import { usePosTransaction } from '@/hooks/use-pos-transaction';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('@/hooks/use-customer-lookup');
vi.mock('@/hooks/use-points-calculator');
vi.mock('@/hooks/use-pos-transaction');

describe('POS Operations Performance Tests', () => {
  const mockCustomer = {
    id: '1',
    name: 'Juan Pérez',
    phone: '+584121234567',
    total_points: 75,
    points_balance: 75,
    total_checkins: 45,
  };

  const mockCalculation = {
    basePoints: 50,
    challengePoints: 25,
    totalPoints: 75,
    completedChallenges: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useCustomerLookup as any).mockReturnValue({
      phone: '',
      setPhone: vi.fn(),
      customer: null,
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: vi.fn(),
    });

    (usePointsCalculator as any).mockReturnValue({
      calculation: null,
      loading: false,
    });

    (usePosTransaction as any).mockReturnValue({
      assignPoints: vi.fn(),
      submitting: false,
    });
  });

  it('POS page renders in less than 10 seconds', () => {
    const startTime = performance.now();
    render(<PosPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Critical: POS operations must be < 10s
    expect(renderTime).toBeLessThan(10000);
    console.log(`POS page rendered in ${renderTime.toFixed(2)}ms`);
  });

  it('initial render is under 1 second', () => {
    const startTime = performance.now();
    render(<PosPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Initial render should be very fast
    expect(renderTime).toBeLessThan(1000);
  });

  it('customer lookup UI updates quickly', () => {
    const mockSearchCustomer = vi.fn();

    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: null,
      loading: true,
      error: null,
      searchCustomer: mockSearchCustomer,
      clearCustomer: vi.fn(),
    });

    const startTime = performance.now();
    render(<PosPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Loading state should render instantly
    expect(renderTime).toBeLessThan(500);
  });

  it('customer data appears quickly after search', () => {
    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: mockCustomer,
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: vi.fn(),
    });

    (usePointsCalculator as any).mockReturnValue({
      calculation: mockCalculation,
      loading: false,
    });

    const startTime = performance.now();
    const { rerender } = render(<PosPage />);
    rerender(<PosPage />);
    const endTime = performance.now();

    const updateTime = endTime - startTime;

    // Customer data update should be instant
    expect(updateTime).toBeLessThan(100);
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
  });

  it('points calculation updates in real-time', () => {
    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: mockCustomer,
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: vi.fn(),
    });

    const { rerender } = render(<PosPage />);

    const startTime = performance.now();

    (usePointsCalculator as any).mockReturnValue({
      calculation: mockCalculation,
      loading: false,
    });

    rerender(<PosPage />);
    const endTime = performance.now();

    const calculationTime = endTime - startTime;

    // Calculation display should be instant
    expect(calculationTime).toBeLessThan(100);
  });

  it('form input is responsive', async () => {
    const user = userEvent.setup();
    render(<PosPage />);

    const amountInput = document.querySelector('input[type="number"]');

    if (amountInput) {
      const startTime = performance.now();
      await user.type(amountInput as HTMLElement, '500');
      const endTime = performance.now();

      const inputTime = endTime - startTime;

      // Input should feel instant (< 100ms per character)
      expect(inputTime / 3).toBeLessThan(100);
    }
  });

  it('complete POS flow from search to assignment', async () => {
    const mockAssignPoints = vi.fn().mockResolvedValue({ success: true });

    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: mockCustomer,
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: vi.fn(),
    });

    (usePointsCalculator as any).mockReturnValue({
      calculation: mockCalculation,
      loading: false,
    });

    (usePosTransaction as any).mockReturnValue({
      assignPoints: mockAssignPoints,
      submitting: false,
    });

    const user = userEvent.setup();
    const startTime = performance.now();

    render(<PosPage />);

    // Type amount
    const amountInput = document.querySelector('input[type="number"]');
    if (amountInput) {
      await user.type(amountInput as HTMLElement, '500');
    }

    // Click assign
    const assignButton = screen.getByText(/asignar/i);
    await user.click(assignButton);

    const endTime = performance.now();
    const totalTime = endTime - startTime;

    // Total flow should be < 10 seconds
    expect(totalTime).toBeLessThan(10000);
    console.log(`Complete POS flow: ${totalTime.toFixed(2)}ms`);
  });

  it('gift card alert renders without delay', () => {
    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: { ...mockCustomer, total_points: 95 },
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: vi.fn(),
    });

    (usePointsCalculator as any).mockReturnValue({
      calculation: mockCalculation,
      loading: false,
    });

    const startTime = performance.now();
    render(<PosPage />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;

    // Alert should not slow down render
    expect(renderTime).toBeLessThan(1000);
  });

  it('form reset is instant', async () => {
    const mockClearCustomer = vi.fn();

    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: mockCustomer,
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: mockClearCustomer,
    });

    const user = userEvent.setup();
    render(<PosPage />);

    const cancelButton = screen.getByText(/cancelar/i);

    const startTime = performance.now();
    await user.click(cancelButton);
    const endTime = performance.now();

    const resetTime = endTime - startTime;

    expect(mockClearCustomer).toHaveBeenCalled();
    expect(resetTime).toBeLessThan(100);
  });

  it('handles rapid consecutive operations', async () => {
    const mockAssignPoints = vi.fn().mockResolvedValue({ success: true });

    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: mockCustomer,
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: vi.fn(),
    });

    (usePointsCalculator as any).mockReturnValue({
      calculation: mockCalculation,
      loading: false,
    });

    (usePosTransaction as any).mockReturnValue({
      assignPoints: mockAssignPoints,
      submitting: false,
    });

    const user = userEvent.setup();
    const { rerender } = render(<PosPage />);

    const times: number[] = [];

    // Simulate 5 rapid transactions
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();

      const amountInput = document.querySelector('input[type="number"]');
      if (amountInput) {
        await user.clear(amountInput as HTMLElement);
        await user.type(amountInput as HTMLElement, '500');
      }

      const assignButton = screen.getByText(/asignar/i);
      await user.click(assignButton);

      rerender(<PosPage />);

      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

    // Average should be under 5 seconds
    expect(averageTime).toBeLessThan(5000);
    console.log(`Average transaction time: ${averageTime.toFixed(2)}ms`);
  });

  it('keyboard shortcuts execute instantly', async () => {
    const mockAssignPoints = vi.fn().mockResolvedValue({ success: true });

    (useCustomerLookup as any).mockReturnValue({
      phone: '+584121234567',
      setPhone: vi.fn(),
      customer: mockCustomer,
      loading: false,
      error: null,
      searchCustomer: vi.fn(),
      clearCustomer: vi.fn(),
    });

    (usePointsCalculator as any).mockReturnValue({
      calculation: mockCalculation,
      loading: false,
    });

    (usePosTransaction as any).mockReturnValue({
      assignPoints: mockAssignPoints,
      submitting: false,
    });

    const user = userEvent.setup();
    render(<PosPage />);

    const amountInput = document.querySelector('input[type="number"]');
    if (amountInput) {
      await user.type(amountInput as HTMLElement, '500');
    }

    const startTime = performance.now();
    await user.keyboard('{Control>}{Enter}{/Control}');
    const endTime = performance.now();

    const shortcutTime = endTime - startTime;

    // Keyboard shortcut should be instant
    expect(shortcutTime).toBeLessThan(100);
  });
});

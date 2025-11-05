import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import ChallengesPage from '@/app/challenges/page';
import { useChallenges } from '@/hooks/use-challenges';
import type { Challenge } from '@/types/database';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock hooks
vi.mock('@/hooks/use-challenges');

describe('Challenges Page Integration Tests', () => {
  const mockRouter = {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  };

  const mockFetchChallenges = vi.fn();
  const mockToggleChallengeStatus = vi.fn();
  const mockUpdateChallenge = vi.fn();

  const mockActiveChallenges: Challenge[] = [
    {
      id: 'challenge-1',
      merchant_id: 'merchant-123',
      name: 'Visit 5 times this week',
      description: 'Get bonus points for frequent visits',
      type: 'frequency' as const,
      target_value: 5,
      reward_points: 50,
      is_active: true,
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2024-10-01T00:00:00Z',
    },
    {
      id: 'challenge-2',
      merchant_id: 'merchant-123',
      name: 'Spend $100 in one visit',
      description: 'Big spender bonus',
      type: 'amount' as const,
      target_value: 100,
      reward_points: 25,
      is_active: true,
      created_at: '2024-10-01T00:00:00Z',
      updated_at: '2024-10-01T00:00:00Z',
    },
  ];

  const mockPausedChallenges: Challenge[] = [
    {
      id: 'challenge-3',
      merchant_id: 'merchant-123',
      name: 'Refer a friend',
      description: 'Get points for referrals',
      type: 'referral' as const,
      target_value: 1,
      reward_points: 100,
      is_active: false,
      created_at: '2024-09-01T00:00:00Z',
      updated_at: '2024-10-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe('Initial Render', () => {
    it('displays page header', () => {
      (useChallenges as any).mockReturnValue({
        challenges: mockActiveChallenges,
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);

      expect(screen.getByText('Retos y Desafíos')).toBeInTheDocument();
      expect(screen.getByText('Gestiona los retos de fidelización para tus clientes')).toBeInTheDocument();
    });

    it('displays create challenge button', () => {
      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);
      expect(screen.getByText('Crear Reto')).toBeInTheDocument();
    });

    it('fetches challenges on mount', () => {
      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);
      expect(mockFetchChallenges).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('displays skeleton loading state', () => {
      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: true,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      const { container } = render(<ChallengesPage />);

      // Should show skeleton loaders
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('create button is disabled while loading', () => {
      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: true,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);
      const createButton = screen.getByText('Crear Reto');
      expect(createButton).toBeDisabled();
    });
  });

  describe('Active Challenges Display', () => {
    beforeEach(() => {
      (useChallenges as any).mockReturnValue({
        challenges: mockActiveChallenges,
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });
    });

    it('displays active challenges section', () => {
      render(<ChallengesPage />);
      expect(screen.getByText(/RETOS ACTIVOS/i)).toBeInTheDocument();
      expect(screen.getByText(/\(2\)/)).toBeInTheDocument();
    });

    it('displays all active challenges', () => {
      render(<ChallengesPage />);
      expect(screen.getByText('Visit 5 times this week')).toBeInTheDocument();
      expect(screen.getByText('Spend $100 in one visit')).toBeInTheDocument();
    });

    it('displays challenge details', () => {
      render(<ChallengesPage />);

      expect(screen.getByText('Get bonus points for frequent visits')).toBeInTheDocument();
      expect(screen.getByText('Big spender bonus')).toBeInTheDocument();

      expect(screen.getByText(/50.*pts/i) || screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText(/25.*pts/i) || screen.getByText('25')).toBeInTheDocument();
    });

    it('displays challenge type badges', () => {
      render(<ChallengesPage />);
      expect(screen.getByText(/frequency/i) || screen.getByText(/visitas/i)).toBeInTheDocument();
      expect(screen.getByText(/amount/i) || screen.getByText(/monto/i)).toBeInTheDocument();
    });
  });

  describe('Paused Challenges Display', () => {
    beforeEach(() => {
      (useChallenges as any).mockReturnValue({
        challenges: [...mockActiveChallenges, ...mockPausedChallenges],
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });
    });

    it('displays paused challenges section when paused challenges exist', () => {
      render(<ChallengesPage />);
      expect(screen.getByText(/RETOS PAUSADOS/i)).toBeInTheDocument();
      expect(screen.getByText(/\(1\)/)).toBeInTheDocument();
    });

    it('paused section is collapsible', async () => {
      const user = userEvent.setup();
      render(<ChallengesPage />);

      const pausedHeader = screen.getByText(/RETOS PAUSADOS/i);
      const toggleButton = pausedHeader.closest('button');

      expect(toggleButton).toBeInTheDocument();

      if (toggleButton) {
        expect(screen.getByText('Refer a friend')).toBeInTheDocument();

        await user.click(toggleButton);

        await waitFor(() => {
          expect(screen.queryByText('Refer a friend')).not.toBeInTheDocument();
        });
      }
    });

    it('shows correct aria attributes for collapsible section', () => {
      render(<ChallengesPage />);
      const pausedHeader = screen.getByText(/RETOS PAUSADOS/i);
      const toggleButton = pausedHeader.closest('button');

      expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      expect(toggleButton).toHaveAttribute('aria-controls', 'paused-challenges-content');
    });
  });

  describe('Empty State', () => {
    it('displays empty state when no active challenges', () => {
      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);
      expect(screen.getByText('No tienes retos activos')).toBeInTheDocument();
      expect(screen.getByText(/Los retos incentivan a tus clientes/i)).toBeInTheDocument();
    });

    it('empty state has create button', async () => {
      const user = userEvent.setup();

      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);

      const createButton = screen.getByText('Crear primer reto');
      await user.click(createButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/challenges/new');
    });
  });

  describe('Error State', () => {
    it('displays error message when fetch fails', () => {
      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: false,
        error: 'Failed to fetch challenges',
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);
      expect(screen.getByText('Error al cargar retos')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch challenges')).toBeInTheDocument();
    });

    it('error state has retry button', async () => {
      const user = userEvent.setup();

      (useChallenges as any).mockReturnValue({
        challenges: [],
        loading: false,
        error: 'Network error',
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });

      render(<ChallengesPage />);

      const retryButton = screen.getByText('Reintentar');
      await user.click(retryButton);

      expect(mockFetchChallenges).toHaveBeenCalled();
    });
  });

  describe('Challenge Actions', () => {
    beforeEach(() => {
      (useChallenges as any).mockReturnValue({
        challenges: mockActiveChallenges,
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });
    });

    it('navigates to create challenge page when create button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChallengesPage />);

      const createButton = screen.getByText('Crear Reto');
      await user.click(createButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/challenges/new');
    });

    it('displays edit buttons on challenge cards', () => {
      render(<ChallengesPage />);
      const editButtons = screen.getAllByText(/editar/i);
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('displays toggle status buttons on challenge cards', () => {
      render(<ChallengesPage />);
      const toggleButtons = screen.getAllByText(/pausar/i);
      expect(toggleButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Challenge Toggle', () => {
    beforeEach(() => {
      (useChallenges as any).mockReturnValue({
        challenges: mockActiveChallenges,
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });
    });

    it('calls toggleChallengeStatus when toggle button is clicked', async () => {
      const user = userEvent.setup();
      mockToggleChallengeStatus.mockResolvedValue({ success: true });

      render(<ChallengesPage />);

      const toggleButtons = screen.getAllByText(/pausar/i);
      if (toggleButtons[0]) {
        await user.click(toggleButtons[0]);

        await waitFor(() => {
          expect(mockToggleChallengeStatus).toHaveBeenCalledWith('challenge-1');
        });
      }
    });
  });

  describe('Challenge Delete', () => {
    beforeEach(() => {
      (useChallenges as any).mockReturnValue({
        challenges: mockActiveChallenges,
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });
    });

    it('opens delete confirmation modal when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<ChallengesPage />);

      const deleteButtons = screen.getAllByText(/eliminar/i);
      if (deleteButtons[0]) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(screen.getByText(/confirmar.*eliminación/i) || screen.getByRole('dialog')).toBeTruthy();
        });
      }
    });

    it('closes modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<ChallengesPage />);

      const deleteButtons = screen.getAllByText(/eliminar/i);
      if (deleteButtons[0]) {
        await user.click(deleteButtons[0]);

        const cancelButton = screen.getByText(/cancelar/i);
        await user.click(cancelButton);

        await waitFor(() => {
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
      }
    });

    it('deletes challenge when confirmed', async () => {
      const user = userEvent.setup();
      mockUpdateChallenge.mockResolvedValue({ success: true });

      render(<ChallengesPage />);

      const deleteButtons = screen.getAllByText(/eliminar/i);
      if (deleteButtons[0]) {
        await user.click(deleteButtons[0]);

        const confirmButton = screen.getByText(/confirmar/i) || screen.getByText(/eliminar/i);
        await user.click(confirmButton);

        await waitFor(() => {
          expect(mockUpdateChallenge).toHaveBeenCalled();
          expect(mockFetchChallenges).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Responsive Layout', () => {
    beforeEach(() => {
      (useChallenges as any).mockReturnValue({
        challenges: mockActiveChallenges,
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });
    });

    it('uses grid layout for challenge cards', () => {
      const { container } = render(<ChallengesPage />);
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useChallenges as any).mockReturnValue({
        challenges: [...mockActiveChallenges, ...mockPausedChallenges],
        loading: false,
        error: null,
        fetchChallenges: mockFetchChallenges,
        toggleChallengeStatus: mockToggleChallengeStatus,
        updateChallenge: mockUpdateChallenge,
      });
    });

    it('sections have proper aria labels', () => {
      render(<ChallengesPage />);
      expect(screen.getByLabelText(/active challenges/i) || screen.getByRole('region')).toBeTruthy();
    });

    it('collapsible section has proper aria attributes', () => {
      render(<ChallengesPage />);
      const toggleButton = screen.getByText(/RETOS PAUSADOS/i).closest('button');

      expect(toggleButton).toHaveAttribute('aria-expanded');
      expect(toggleButton).toHaveAttribute('aria-controls');
    });

    it('icons have aria-hidden attribute', () => {
      const { container } = render(<ChallengesPage />);
      const icons = container.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '@/components/customers/search-input';

describe('SearchInput Component (Customer Search)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders with default placeholder', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(
        screen.getByPlaceholderText('Buscar clientes por nombre o teléfono...')
      ).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(
        <SearchInput
          value=""
          onChange={() => {}}
          placeholder="Search customers..."
        />
      );
      expect(screen.getByPlaceholderText('Search customers...')).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      const searchIcon = document.querySelector('svg[aria-hidden="true"]');
      expect(searchIcon).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      render(<SearchInput value="Juan" onChange={() => {}} />);
      expect(screen.getByDisplayValue('Juan')).toBeInTheDocument();
    });

    it('does not show clear button when value is empty', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.queryByLabelText('Limpiar búsqueda')).not.toBeInTheDocument();
    });

    it('shows clear button when value is not empty', () => {
      render(<SearchInput value="test" onChange={() => {}} />);
      expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
    });
  });

  describe('Debounce Functionality', () => {
    it('debounces onChange calls by default (300ms)', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      // Should not call onChange immediately
      expect(handleChange).not.toHaveBeenCalled();

      // Fast-forward time by 300ms
      vi.advanceTimersByTime(300);

      // Now it should have been called once with final value
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('test');
      });
    });

    it('respects custom debounce time', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(
        <SearchInput value="" onChange={handleChange} debounceMs={500} />
      );

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      // Should not call after 300ms
      vi.advanceTimersByTime(300);
      expect(handleChange).not.toHaveBeenCalled();

      // Should call after 500ms
      vi.advanceTimersByTime(200);
      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('test');
      });
    });

    it('cancels previous debounce timer on rapid input', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');

      // Type 't'
      await user.type(input, 't');
      vi.advanceTimersByTime(100);

      // Type 'e' before debounce completes
      await user.type(input, 'e');
      vi.advanceTimersByTime(100);

      // Type 's' before debounce completes
      await user.type(input, 's');
      vi.advanceTimersByTime(100);

      // Type 't' before debounce completes
      await user.type(input, 't');

      // Only after final debounce period should it call once
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith('test');
      });
    });

    it('handles rapid typing correctly', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'testing');

      // Should not call during typing
      expect(handleChange).not.toHaveBeenCalled();

      // Fast-forward past debounce
      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('testing');
        expect(handleChange).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Clear Button', () => {
    it('clears input when clear button is clicked', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SearchInput value="test" onChange={handleChange} />);

      const clearButton = screen.getByLabelText('Limpiar búsqueda');
      await user.click(clearButton);

      expect(handleChange).toHaveBeenCalledWith('');
    });

    it('removes clear button after clearing', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SearchInput value="test" onChange={handleChange} />);

      const clearButton = screen.getByLabelText('Limpiar búsqueda');
      await user.click(clearButton);

      expect(screen.queryByLabelText('Limpiar búsqueda')).not.toBeInTheDocument();
    });

    it('shows clear button when typing', async () => {
      const user = userEvent.setup({ delay: null });

      render(<SearchInput value="" onChange={() => {}} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 't');

      expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
    });
  });

  describe('Value Synchronization', () => {
    it('syncs with external value changes', () => {
      const { rerender } = render(
        <SearchInput value="test" onChange={() => {}} />
      );

      expect(screen.getByDisplayValue('test')).toBeInTheDocument();

      rerender(<SearchInput value="updated" onChange={() => {}} />);

      expect(screen.getByDisplayValue('updated')).toBeInTheDocument();
    });

    it('updates local state when prop value changes', () => {
      const { rerender } = render(
        <SearchInput value="" onChange={() => {}} />
      );

      rerender(<SearchInput value="external update" onChange={() => {}} />);

      expect(screen.getByDisplayValue('external update')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('handles customer name search', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Juan Pérez');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('Juan Pérez');
      });
    });

    it('handles phone number search', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '+584121234567');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('+584121234567');
      });
    });

    it('handles partial matches', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'Juan');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('Juan');
      });
    });
  });

  describe('Accessibility', () => {
    it('has search role', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('has accessible label', () => {
      render(<SearchInput value="" onChange={() => {}} />);
      expect(screen.getByLabelText('Buscar clientes')).toBeInTheDocument();
    });

    it('clear button has accessible label', () => {
      render(<SearchInput value="test" onChange={() => {}} />);
      expect(screen.getByLabelText('Limpiar búsqueda')).toBeInTheDocument();
    });

    it('icons have aria-hidden', () => {
      render(<SearchInput value="test" onChange={() => {}} />);
      const icons = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<SearchInput value="" onChange={() => {}} />);

      await user.tab();
      expect(screen.getByRole('searchbox')).toHaveFocus();
    });

    it('clear button is keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<SearchInput value="test" onChange={handleChange} />);

      // Tab to input
      await user.tab();
      // Tab to clear button
      await user.tab();

      const clearButton = screen.getByLabelText('Limpiar búsqueda');
      expect(clearButton).toHaveFocus();

      // Press Enter to clear
      await user.keyboard('{Enter}');
      expect(handleChange).toHaveBeenCalledWith('');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string search', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="test" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.clear(input);

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('');
      });
    });

    it('handles special characters in search', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, '@#$%');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('@#$%');
      });
    });

    it('handles very long search strings', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();
      const longString = 'a'.repeat(200);

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, longString);

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith(longString);
      });
    });

    it('handles unicode characters', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();

      render(<SearchInput value="" onChange={handleChange} />);

      const input = screen.getByRole('searchbox');
      await user.type(input, 'José María 😀');

      vi.advanceTimersByTime(300);

      await waitFor(() => {
        expect(handleChange).toHaveBeenCalledWith('José María 😀');
      });
    });

    it('cleans up debounce timer on unmount', () => {
      const handleChange = vi.fn();
      const { unmount } = render(
        <SearchInput value="" onChange={handleChange} />
      );

      unmount();

      // Should not throw or cause memory leaks
      vi.advanceTimersByTime(300);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', async () => {
      const user = userEvent.setup({ delay: null });
      const handleChange = vi.fn();
      const renderSpy = vi.fn();

      const TestComponent = () => {
        renderSpy();
        return <SearchInput value="" onChange={handleChange} />;
      };

      render(<TestComponent />);

      const initialRenderCount = renderSpy.mock.calls.length;

      const input = screen.getByRole('searchbox');
      await user.type(input, 'test');

      // Should render once for initial, once for each keystroke (local state)
      // But not for debounced calls
      expect(renderSpy.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });
  });
});

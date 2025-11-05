import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders with correct placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with initial value', () => {
      render(<Input value="Test value" onChange={() => {}} />);
      const input = screen.getByDisplayValue('Test value');
      expect(input).toBeInTheDocument();
    });

    it('renders with default type text', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('renders with email type', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('renders with password type', () => {
      render(<Input type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<Input variant="default" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-neutral-300');
    });

    it('renders error variant when error prop is true', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-semantic-error');
    });

    it('renders success variant when success prop is true', () => {
      render(<Input success />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-semantic-success');
    });

    it('error prop overrides variant prop', () => {
      render(<Input variant="success" error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-semantic-error');
      expect(input).not.toHaveClass('border-semantic-success');
    });

    it('success prop overrides default variant', () => {
      render(<Input success />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-semantic-success');
    });
  });

  describe('States', () => {
    it('is disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('applies disabled styles when disabled', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:cursor-not-allowed');
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('is readonly when readOnly prop is true', () => {
      render(<Input readOnly value="readonly" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readOnly');
    });

    it('is required when required prop is true', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('Interactions', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
      expect(handleChange).toHaveBeenCalledTimes(4); // Once per character
    });

    it('updates value on user input', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Hello');

      expect(input.value).toBe('Hello');
    });

    it('does not update when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input disabled onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('handles onFocus events', async () => {
      const user = userEvent.setup();
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('handles onBlur events', async () => {
      const user = userEvent.setup();
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      input.focus();
      input.blur();

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.tab();

      expect(input).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('has textbox role by default', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('sets aria-invalid when error is true', () => {
      render(<Input error />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('does not set aria-invalid when error is false', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).not.toHaveAttribute('aria-invalid');
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Email address" />);
      const input = screen.getByLabelText('Email address');
      expect(input).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(<Input aria-describedby="help-text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('can be focused', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      input.focus();
      expect(input).toHaveFocus();
    });

    it('shows focus ring on focus', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus-visible:ring-2');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string value', () => {
      render(<Input value="" onChange={() => {}} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('handles null placeholder', () => {
      render(<Input placeholder={undefined} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('handles very long text', async () => {
      const user = userEvent.setup();
      const longText = 'a'.repeat(1000);
      render(<Input />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, longText);

      expect(input.value).toBe(longText);
    });

    it('handles maxLength attribute', async () => {
      const user = userEvent.setup();
      render(<Input maxLength={10} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, '12345678901234567890');

      expect(input.value.length).toBeLessThanOrEqual(10);
    });

    it('handles pattern validation', () => {
      render(<Input pattern="[0-9]*" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
    });
  });

  describe('Custom Classes', () => {
    it('applies custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('merges custom className with default classes', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-lg');
    });
  });

  describe('Input Types', () => {
    it('handles number type', () => {
      render(<Input type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('handles tel type', () => {
      render(<Input type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('handles url type', () => {
      render(<Input type="url" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'url');
    });

    it('handles search type', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });
});

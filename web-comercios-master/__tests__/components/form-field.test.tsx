import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormField } from '@/components/forms/form-field';

describe('FormField Component', () => {
  describe('Rendering', () => {
    it('renders with label', () => {
      render(<FormField label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<FormField placeholder="Enter value" />);
      expect(screen.getByPlaceholderText('Enter value')).toBeInTheDocument();
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('renders with hint text', () => {
      render(<FormField label="Password" hint="Must be at least 8 characters" />);
      expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
    });

    it('renders with error message', () => {
      render(<FormField label="Email" error="Email is required" />);
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });

    it('does not render hint when error is present', () => {
      render(
        <FormField
          label="Email"
          hint="Enter your email"
          error="Email is required"
        />
      );
      expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });

  describe('Required Field', () => {
    it('displays required indicator when required is true', () => {
      render(<FormField label="Name" required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('passes required prop to input', () => {
      render(<FormField label="Email" required />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Error State', () => {
    it('applies error styling to input when error is present', () => {
      render(<FormField label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-semantic-error');
    });

    it('sets aria-invalid when error is present', () => {
      render(<FormField label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('links error message to input with aria-describedby', () => {
      render(<FormField label="Email" error="Invalid email" />);
      const input = screen.getByRole('textbox');
      const errorId = input.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(screen.getByText('Invalid email')).toHaveAttribute('id', errorId!);
    });

    it('error message has role="alert"', () => {
      render(<FormField label="Email" error="Invalid email" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Invalid email');
    });

    it('error message has aria-live="polite"', () => {
      render(<FormField label="Email" error="Invalid email" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Hint Text', () => {
    it('displays hint text when no error', () => {
      render(<FormField label="Password" hint="8+ characters" />);
      expect(screen.getByText('8+ characters')).toBeInTheDocument();
    });

    it('links hint text to input with aria-describedby', () => {
      render(<FormField label="Password" hint="8+ characters" />);
      const input = screen.getByRole('textbox');
      const hintId = input.getAttribute('aria-describedby');
      expect(hintId).toBeTruthy();
      expect(screen.getByText('8+ characters')).toHaveAttribute('id', hintId!);
    });

    it('applies correct styling to hint text', () => {
      render(<FormField label="Password" hint="8+ characters" />);
      const hint = screen.getByText('8+ characters');
      expect(hint).toHaveClass('text-xs', 'text-neutral-600');
    });
  });

  describe('Label Association', () => {
    it('associates label with input using htmlFor', () => {
      render(<FormField label="Email" id="email-field" />);
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-field');
    });

    it('generates unique ID when not provided', () => {
      const { container } = render(<FormField label="Email" />);
      const input = screen.getByRole('textbox');
      const id = input.getAttribute('id');
      expect(id).toBeTruthy();
      expect(id).toMatch(/^field-/);
    });

    it('clicking label focuses input', async () => {
      const user = userEvent.setup();
      render(<FormField label="Email" />);

      const label = screen.getByText('Email');
      await user.click(label);

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  describe('Input Interactions', () => {
    it('handles onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FormField label="Name" onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'John');

      expect(handleChange).toHaveBeenCalled();
    });

    it('updates value on user input', async () => {
      const user = userEvent.setup();
      render(<FormField label="Name" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'John Doe');

      expect(input.value).toBe('John Doe');
    });

    it('handles disabled state', () => {
      render(<FormField label="Name" disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('does not trigger onChange when disabled', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<FormField label="Name" disabled onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <FormField label="First Name" />
          <FormField label="Last Name" />
        </div>
      );

      await user.tab();
      expect(screen.getByLabelText('First Name')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Last Name')).toHaveFocus();
    });

    it('maintains focus order with label, input, and error', async () => {
      const user = userEvent.setup();
      render(<FormField label="Email" error="Required" />);

      await user.tab();
      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });

    it('error message is announced to screen readers', () => {
      render(<FormField label="Email" error="Invalid email format" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className to input', () => {
      render(<FormField label="Name" className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
    });

    it('applies custom className to container', () => {
      const { container } = render(
        <FormField label="Name" containerClassName="custom-container" />
      );
      const formFieldContainer = container.firstChild;
      expect(formFieldContainer).toHaveClass('custom-container');
    });
  });

  describe('Different Input Types', () => {
    it('works with type="email"', () => {
      render(<FormField label="Email" type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('works with type="password"', () => {
      render(<FormField label="Password" type="password" />);
      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('works with type="number"', () => {
      render(<FormField label="Age" type="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('works with type="tel"', () => {
      render(<FormField label="Phone" type="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });
  });

  describe('Placeholder', () => {
    it('displays placeholder text', () => {
      render(<FormField label="Name" placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });
  });

  describe('Default Value', () => {
    it('renders with default value', () => {
      render(<FormField label="Name" defaultValue="John Doe" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('John Doe');
    });
  });

  describe('Controlled vs Uncontrolled', () => {
    it('works as controlled component', async () => {
      const user = userEvent.setup();
      const ControlledFormField = () => {
        const [value, setValue] = React.useState('');
        return (
          <FormField
            label="Name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      render(<ControlledFormField />);
      const input = screen.getByRole('textbox') as HTMLInputElement;

      await user.type(input, 'Test');
      expect(input.value).toBe('Test');
    });

    it('works as uncontrolled component', async () => {
      const user = userEvent.setup();
      render(<FormField label="Name" />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      await user.type(input, 'Test');

      expect(input.value).toBe('Test');
    });
  });

  describe('Multiple FormFields', () => {
    it('generates unique IDs for multiple fields', () => {
      render(
        <div>
          <FormField label="First Name" />
          <FormField label="Last Name" />
          <FormField label="Email" />
        </div>
      );

      const inputs = screen.getAllByRole('textbox');
      const ids = inputs.map((input) => input.getAttribute('id'));

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});

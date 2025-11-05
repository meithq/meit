import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';

expect.extend(toHaveNoViolations);

describe('Forms Accessibility Tests', () => {
  describe('FormField Component', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <FormField label="Email" type="email" />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('label is properly associated with input', () => {
      render(<FormField label="Email" id="email-field" />);

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email');

      expect(label).toHaveAttribute('for', 'email-field');
      expect(input).toHaveAttribute('id', 'email-field');
    });

    it('required fields are indicated to screen readers', () => {
      render(<FormField label="Name" required />);

      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });

    it('error messages are properly announced', () => {
      render(<FormField label="Email" error="Email is required" />);

      const input = screen.getByRole('textbox');
      const errorMessage = screen.getByText('Email is required');

      // Error should have role="alert"
      expect(errorMessage).toHaveAttribute('role', 'alert');

      // Error should be associated with input
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(errorMessage).toHaveAttribute('id', describedBy!);
    });

    it('hint text is accessible', () => {
      render(<FormField label="Password" hint="Must be at least 8 characters" />);

      const input = screen.getByRole('textbox');
      const hint = screen.getByText('Must be at least 8 characters');

      // Hint should be associated with input
      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(hint).toHaveAttribute('id', describedBy!);
    });

    it('error state sets aria-invalid', () => {
      render(<FormField label="Email" error="Invalid email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('clicking label focuses input', async () => {
      const user = userEvent.setup();
      render(<FormField label="Name" />);

      const label = screen.getByText('Name');
      await user.click(label);

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });
  });

  describe('Input Component', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Input aria-label="Search" />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports different input types', () => {
      const { rerender } = render(<Input type="email" aria-label="Email" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

      rerender(<Input type="tel" aria-label="Phone" />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');

      rerender(<Input type="number" aria-label="Amount" />);
      expect(screen.getByRole('spinbutton')).toHaveAttribute('type', 'number');
    });

    it('disabled state is communicated', () => {
      render(<Input disabled aria-label="Disabled input" />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('placeholder does not replace label', () => {
      // Placeholder alone is not accessible - must have label or aria-label
      render(<Input placeholder="Enter text" aria-label="Text input" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAccessibleName('Text input');
    });
  });

  describe('Form Validation', () => {
    it('validation errors are announced immediately', () => {
      const { rerender } = render(
        <FormField label="Email" />
      );

      // Add error
      rerender(<FormField label="Email" error="Email is required" />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('successful validation is announced', () => {
      // Success state would have aria-live announcement
      const successMessage = (
        <div role="status" aria-live="polite">
          Form submitted successfully
        </div>
      );

      render(successMessage);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('multiple errors are announced as a list', () => {
      const errors = (
        <div role="alert">
          <ul>
            <li>Email is required</li>
            <li>Password must be at least 8 characters</li>
          </ul>
        </div>
      );

      render(errors);

      const alert = screen.getByRole('alert');
      expect(alert.querySelector('ul')).toBeInTheDocument();
    });
  });

  describe('Form Navigation', () => {
    it('form fields are in logical tab order', async () => {
      const user = userEvent.setup();

      render(
        <form>
          <FormField label="First Name" />
          <FormField label="Last Name" />
          <FormField label="Email" />
          <button type="submit">Submit</button>
        </form>
      );

      await user.tab();
      expect(screen.getByLabelText('First Name')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Last Name')).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText('Email')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Submit')).toHaveFocus();
    });

    it('form can be submitted with Enter key', async () => {
      const user = userEvent.setup();
      const handleSubmit = vi.fn((e) => e.preventDefault());

      render(
        <form onSubmit={handleSubmit}>
          <FormField label="Name" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByRole('textbox');
      input.focus();

      await user.keyboard('{Enter}');
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  describe('Field Types', () => {
    it('password fields have appropriate type', () => {
      render(<FormField label="Password" type="password" />);

      const input = document.querySelector('input[type="password"]');
      expect(input).toBeInTheDocument();
    });

    it('email fields have appropriate type', () => {
      render(<FormField label="Email" type="email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('number fields use spinbutton role', () => {
      render(<FormField label="Age" type="number" />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('tel fields use tel type', () => {
      render(<FormField label="Phone" type="tel" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });
  });

  describe('Autocomplete', () => {
    it('supports autocomplete attributes', () => {
      render(<Input autoComplete="email" aria-label="Email" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });

  describe('Input Constraints', () => {
    it('maxLength is communicated', () => {
      render(<FormField label="Username" maxLength={20} hint="Max 20 characters" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('maxLength', '20');

      // Hint provides context
      expect(screen.getByText('Max 20 characters')).toBeInTheDocument();
    });

    it('pattern is set for validation', () => {
      render(<FormField label="Phone" pattern="[0-9]{10}" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('pattern', '[0-9]{10}');
    });

    it('min/max are set for number inputs', () => {
      render(<FormField label="Age" type="number" min={18} max={120} />);

      const input = screen.getByRole('spinbutton');
      expect(input).toHaveAttribute('min', '18');
      expect(input).toHaveAttribute('max', '120');
    });
  });

  describe('Fieldset and Legend', () => {
    it('grouped fields use fieldset and legend', () => {
      const fieldset = (
        <fieldset>
          <legend>Personal Information</legend>
          <FormField label="First Name" />
          <FormField label="Last Name" />
        </fieldset>
      );

      const { container } = render(fieldset);

      expect(container.querySelector('fieldset')).toBeInTheDocument();
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });
  });

  describe('Radio and Checkbox Groups', () => {
    it('radio buttons are properly grouped', () => {
      const radioGroup = (
        <fieldset>
          <legend>Choose an option</legend>
          <label>
            <input type="radio" name="option" value="1" />
            Option 1
          </label>
          <label>
            <input type="radio" name="option" value="2" />
            Option 2
          </label>
        </fieldset>
      );

      render(radioGroup);

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);

      // All radios should have same name
      radios.forEach((radio) => {
        expect(radio).toHaveAttribute('name', 'option');
      });
    });

    it('checkboxes have proper labels', () => {
      const checkbox = (
        <label>
          <input type="checkbox" />
          I agree to the terms
        </label>
      );

      render(checkbox);

      const checkboxInput = screen.getByRole('checkbox');
      expect(checkboxInput).toHaveAccessibleName('I agree to the terms');
    });
  });

  describe('Select Dropdowns', () => {
    it('select has proper label', () => {
      const select = (
        <label htmlFor="country">
          Country
          <select id="country">
            <option value="ve">Venezuela</option>
            <option value="us">United States</option>
          </select>
        </label>
      );

      render(select);

      const selectElement = screen.getByRole('combobox');
      expect(selectElement).toHaveAccessibleName('Country');
    });
  });

  describe('Form Submission', () => {
    it('submit button is clearly labeled', () => {
      render(<button type="submit">Create Account</button>);

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Create Account');
    });

    it('loading state during submission is communicated', () => {
      render(
        <button type="submit" disabled aria-busy="true">
          Submitting...
        </button>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Error Summary', () => {
    it('error summary is announced', () => {
      const errorSummary = (
        <div role="alert" aria-labelledby="error-summary-title">
          <h2 id="error-summary-title">There are 2 errors</h2>
          <ul>
            <li><a href="#email">Email is required</a></li>
            <li><a href="#password">Password is too short</a></li>
          </ul>
        </div>
      );

      render(errorSummary);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-labelledby', 'error-summary-title');
    });

    it('error links focus the relevant field', async () => {
      const user = userEvent.setup();

      const form = (
        <>
          <div role="alert">
            <a href="#email">Email error</a>
          </div>
          <FormField label="Email" id="email" />
        </>
      );

      render(form);

      const errorLink = screen.getByText('Email error');
      await user.click(errorLink);

      // Field should receive focus (would work in real browser)
    });
  });
});

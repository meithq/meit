import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const selectVariants = cva(
  'flex h-11 w-full appearance-none rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
  {
    variants: {
      variant: {
        default: 'border-neutral-300 hover:border-neutral-400',
        error: 'border-semantic-error focus-visible:ring-semantic-error',
        success: 'border-semantic-success focus-visible:ring-semantic-success',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  hint?: string;
  label?: string;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      variant,
      options,
      placeholder,
      error,
      hint,
      label,
      required,
      id,
      containerClassName,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const generatedId = React.useId();
    const fieldId = id || `select-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    // Determine variant based on error prop
    const computedVariant = error ? 'error' : variant || 'default';

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <Label htmlFor={fieldId} required={required} error={!!error}>
            {label}
          </Label>
        )}

        {/* Select Container */}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(
              selectVariants({ variant: computedVariant, className })
            )}
            required={required}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
            aria-hidden="true"
          />
        </div>

        {/* Hint */}
        {hint && !error && (
          <p id={hintId} className="text-xs text-neutral-600">
            {hint}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p
            id={errorId}
            className="text-xs text-semantic-error"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants };

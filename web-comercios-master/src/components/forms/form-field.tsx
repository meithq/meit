import * as React from 'react';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input, type InputProps } from '@/components/ui/input';

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  containerClassName?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      hint,
      required,
      id,
      className,
      containerClassName,
      ...props
    },
    ref
  ) => {
    // Generate ID if not provided
    const generatedId = React.useId();
    const fieldId = id || `field-${generatedId}`;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <Label htmlFor={fieldId} required={required} error={!!error}>
            {label}
          </Label>
        )}

        {/* Input */}
        <Input
          ref={ref}
          id={fieldId}
          className={className}
          error={!!error}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
          {...props}
        />

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

FormField.displayName = 'FormField';

export { FormField };

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
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

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  success?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, type = 'text', error, success, ...props }, ref) => {
    // Determine variant based on error/success props
    const computedVariant = error
      ? 'error'
      : success
        ? 'success'
        : variant || 'default';

    return (
      <input
        type={type}
        className={cn(inputVariants({ variant: computedVariant, className }))}
        ref={ref}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };

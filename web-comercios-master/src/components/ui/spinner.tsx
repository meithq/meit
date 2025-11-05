import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    color: {
      primary: 'text-primary-600',
      secondary: 'text-secondary-500',
      neutral: 'text-neutral-600',
      white: 'text-white',
      current: 'text-current',
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, color, label = 'Loading...', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={label}
        className={cn('inline-flex items-center justify-center', className)}
        {...props}
      >
        <Loader2
          className={cn(spinnerVariants({ size, color }))}
          aria-hidden="true"
        />
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

// Fullscreen spinner overlay
const SpinnerOverlay = React.forwardRef<
  HTMLDivElement,
  Omit<SpinnerProps, 'color'> & { message?: string }
>(({ className, size = 'xl', message, label, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <Spinner size={size} color="primary" label={label} />
      {message && (
        <p className="mt-4 text-sm text-neutral-600" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
});

SpinnerOverlay.displayName = 'SpinnerOverlay';

export { Spinner, SpinnerOverlay, spinnerVariants };

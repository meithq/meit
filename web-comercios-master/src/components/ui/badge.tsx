import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-neutral-100 text-neutral-900 border border-neutral-200',
        primary:
          'bg-primary-100 text-primary-800 border border-primary-200',
        secondary:
          'bg-secondary-100 text-secondary-800 border border-secondary-200',
        success:
          'bg-green-100 text-green-800 border border-green-200',
        warning:
          'bg-accent-yellow-100 text-accent-yellow-800 border border-accent-yellow-200',
        error:
          'bg-red-100 text-red-800 border border-red-200',
        info:
          'bg-blue-100 text-blue-800 border border-blue-200',
        outline:
          'border border-neutral-300 text-neutral-700 bg-white',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-0.5',
        lg: 'text-sm px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span
            className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };

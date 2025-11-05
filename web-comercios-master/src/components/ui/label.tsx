import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium text-neutral-900 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      error: {
        true: 'text-semantic-error',
      },
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, error, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(labelVariants({ error, className }))}
        {...props}
      >
        {children}
        {required && (
          <span className="ml-1 text-semantic-error" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label, labelVariants };

import * as React from 'react';
import { LucideIcon, Inbox, Target, AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from './button';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon | 'challenge' | 'error';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    container: 'py-8',
    icon: 'h-12 w-12',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'h-16 w-16',
    title: 'text-lg',
    description: 'text-base',
  },
  lg: {
    container: 'py-16',
    icon: 'h-20 w-20',
    title: 'text-xl',
    description: 'text-lg',
  },
};

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon = Inbox,
      title,
      description,
      action,
      secondaryAction,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const sizes = sizeClasses[size];

    // Resolve icon component
    const IconComponent = React.useMemo(() => {
      if (typeof icon === 'string') {
        switch (icon) {
          case 'challenge':
            return Target;
          case 'error':
            return AlertTriangle;
          default:
            return Inbox;
        }
      }
      return icon;
    }, [icon]);

    // Icon background color based on type
    const iconBgClass = React.useMemo(() => {
      if (icon === 'error') {
        return 'bg-error-100 text-error-600';
      }
      return 'bg-neutral-100 text-neutral-400';
    }, [icon]);

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center',
          sizes.container,
          className
        )}
        role="status"
        aria-live="polite"
        {...props}
      >
        {/* Icon */}
        <div
          className={cn(
            'mb-4 rounded-full p-4',
            iconBgClass,
            sizes.icon
          )}
          aria-hidden="true"
        >
          <IconComponent className="h-full w-full" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3
          className={cn(
            'font-semibold text-neutral-900',
            sizes.title
          )}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p
            className={cn(
              'mt-2 max-w-md text-neutral-600',
              sizes.description
            )}
          >
            {description}
          </p>
        )}

        {/* Actions */}
        {(action || secondaryAction) && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                variant="outline"
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  };
  actions?: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      title,
      subtitle,
      badge,
      actions,
      onBack,
      backLabel = 'Back',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4 border-b border-neutral-200 pb-6', className)}
        {...props}
      >
        {/* Back Button */}
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Button>
        )}

        {/* Header Content */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Title Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || 'default'}>
                  {badge.label}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-neutral-600 sm:text-base">
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export { PageHeader };

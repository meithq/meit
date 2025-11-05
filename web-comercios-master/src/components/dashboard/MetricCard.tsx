import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'primary' | 'teal' | 'yellow' | 'green';
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary-600 text-white',
  teal: 'bg-accent-teal text-white',
  yellow: 'bg-accent-yellow text-neutral-900',
  green: 'bg-accent-green text-neutral-900',
};

const iconOpacityClasses = {
  primary: 'opacity-75',
  teal: 'opacity-75',
  yellow: 'opacity-60',
  green: 'opacity-60',
};

const trendOpacityClasses = {
  primary: 'opacity-90',
  teal: 'opacity-90',
  yellow: 'opacity-75',
  green: 'opacity-75',
};

export function MetricCard({
  title,
  value,
  trend,
  trendDirection = 'neutral',
  icon: Icon,
  color,
  className,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (trendDirection === 'up') {
      return (
        <svg
          className="h-4 w-4 mr-1 inline"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      );
    }
    if (trendDirection === 'down') {
      return (
        <svg
          className="h-4 w-4 mr-1 inline"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        colorClasses[color],
        'border-0 hover:shadow-lg transition-all duration-200 hover:-translate-y-1',
        className
      )}
    >
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <p className={cn('text-sm font-medium', trendOpacityClasses[color])}>
            {title}
          </p>
          <Icon className={cn('h-5 w-5', iconOpacityClasses[color])} />
        </div>
        <div className="space-y-2">
          <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
          {trend && (
            <p
              className={cn(
                'text-sm flex items-center',
                trendOpacityClasses[color]
              )}
            >
              {getTrendIcon()}
              {trend}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

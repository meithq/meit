import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertBannerProps {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  className?: string;
}

const alertConfig = {
  error: {
    icon: AlertCircle,
    borderColor: 'border-error-500',
    bgColor: 'bg-error-50',
    titleColor: 'text-error-900',
    messageColor: 'text-error-700',
    iconColor: 'text-error-600',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'border-accent-yellow',
    bgColor: 'bg-accent-yellow/10',
    titleColor: 'text-neutral-900',
    messageColor: 'text-neutral-700',
    iconColor: 'text-accent-yellow',
  },
  info: {
    icon: Info,
    borderColor: 'border-accent-teal',
    bgColor: 'bg-accent-teal/10',
    titleColor: 'text-neutral-900',
    messageColor: 'text-neutral-700',
    iconColor: 'text-accent-teal',
  },
  success: {
    icon: CheckCircle,
    borderColor: 'border-accent-green',
    bgColor: 'bg-accent-green/10',
    titleColor: 'text-neutral-900',
    messageColor: 'text-neutral-700',
    iconColor: 'text-accent-green',
  },
};

export function AlertBanner({ type, title, message, className }: AlertBannerProps) {
  const config = alertConfig[type];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        'border-l-4 p-4 rounded-r-lg',
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      <div className="flex items-start">
        <IconComponent className={cn('h-5 w-5 mr-3 mt-0.5 flex-shrink-0', config.iconColor)} />
        <div className="flex-1">
          <h4 className={cn('font-semibold text-sm mb-1', config.titleColor)}>
            {title}
          </h4>
          <p className={cn('text-sm', config.messageColor)}>{message}</p>
        </div>
      </div>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatPoints } from '@/lib/formatters';
import { Gift, CreditCard, Users, CheckCircle } from 'lucide-react';

interface ActivityItemProps {
  type: 'checkin' | 'points' | 'gift_card' | 'redemption';
  customerName: string;
  amount?: number;
  timestamp: string;
  className?: string;
}

const activityConfig = {
  checkin: {
    icon: Users,
    label: 'Check-in',
    bgColor: 'bg-primary-100',
    iconColor: 'text-primary-600',
    badgeVariant: 'default' as const,
  },
  points: {
    icon: Gift,
    label: 'Puntos asignados',
    bgColor: 'bg-accent-teal/20',
    iconColor: 'text-accent-teal',
    badgeVariant: 'success' as const,
  },
  gift_card: {
    icon: CreditCard,
    label: 'Gift card generada',
    bgColor: 'bg-accent-yellow/20',
    iconColor: 'text-accent-yellow',
    badgeVariant: 'warning' as const,
  },
  redemption: {
    icon: CheckCircle,
    label: 'Gift card redimida',
    bgColor: 'bg-accent-green/20',
    iconColor: 'text-accent-green',
    badgeVariant: 'success' as const,
  },
};

export function ActivityItem({
  type,
  customerName,
  amount,
  timestamp,
  className,
}: ActivityItemProps) {
  const config = activityConfig[type];
  const IconComponent = config.icon;

  return (
    <div className={`flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors ${className || ''}`}>
      <div className={`flex-shrink-0 w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center`}>
        <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {customerName}
            </p>
            <p className="text-sm text-neutral-600">
              {config.label}
              {amount !== undefined && type === 'points' && (
                <span className="ml-1 font-semibold text-primary-600">
                  +{formatPoints(amount)}
                </span>
              )}
            </p>
          </div>
          <Badge variant={config.badgeVariant} className="flex-shrink-0 text-xs">
            {formatRelativeTime(timestamp)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

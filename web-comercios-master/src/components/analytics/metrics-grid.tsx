'use client'

import { Users, UserPlus, TrendingUp, Gift, CreditCard, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsMetrics } from '@/hooks/use-analytics'

interface MetricsGridProps {
  metrics: AnalyticsMetrics | null
  loading: boolean
}

interface MetricCardProps {
  title: string
  value: number | string
  icon: React.ElementType
  iconColor: string
  iconBgColor: string
  trend?: string
  trendColor?: string
}

function MetricCard({ title, value, icon: Icon, iconColor, iconBgColor, trend, trendColor }: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-neutral-900" aria-label={`${title}: ${value}`}>
              {value}
            </p>
            {trend && (
              <p className={`text-sm mt-2 ${trendColor || 'text-neutral-500'}`} aria-label={`Tendencia: ${trend}`}>
                {trend}
              </p>
            )}
          </div>
          <div className={`${iconBgColor} rounded-lg p-3`} aria-hidden="true">
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsGrid({ metrics, loading }: MetricsGridProps) {
  if (loading && !metrics) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricSkeleton key={i} />
        ))}
      </div>
    )
  }

  const formatTrend = (value: number, isPercentage = false) => {
    const sign = value > 0 ? '+' : ''
    const suffix = isPercentage ? '%' : ''
    return `${sign}${value}${suffix} vs período anterior`
  }

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-neutral-500'
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard
        title="Total Check-ins"
        value={metrics?.today_visits || 0}
        icon={Activity}
        iconColor="text-primary-600"
        iconBgColor="bg-primary-50"
        trend={formatTrend(metrics?.growth_percentage || 0, true)}
        trendColor={getTrendColor(metrics?.growth_percentage || 0)}
      />

      <MetricCard
        title="Nuevos Clientes"
        value={metrics?.new_customers || 0}
        icon={UserPlus}
        iconColor="text-accent-teal"
        iconBgColor="bg-accent-teal/10"
        trend={`${metrics?.total_customers || 0} clientes totales`}
        trendColor="text-neutral-500"
      />

      <MetricCard
        title="Tasa de Retención"
        value={`${metrics?.retention_rate || 0}%`}
        icon={TrendingUp}
        iconColor="text-accent-yellow"
        iconBgColor="bg-accent-yellow/10"
        trend={`${metrics?.active_customers || 0} clientes activos`}
        trendColor="text-neutral-500"
      />

      <MetricCard
        title="Gift Cards Generadas"
        value={metrics?.gift_cards_generated || 0}
        icon={Gift}
        iconColor="text-accent-green"
        iconBgColor="bg-accent-green/10"
        trend={`${metrics?.total_points_distributed || 0} puntos canjeados`}
        trendColor="text-neutral-500"
      />

      <MetricCard
        title="Gift Cards Redimidas"
        value={metrics?.gift_cards_redeemed || 0}
        icon={CreditCard}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-50"
        trend={metrics?.gift_cards_generated ? `${Math.round((metrics.gift_cards_redeemed / metrics.gift_cards_generated) * 100)}% tasa de redención` : 'Sin datos'}
        trendColor="text-neutral-500"
      />

      <MetricCard
        title="Crecimiento"
        value={`${metrics?.growth_percentage || 0}%`}
        icon={Users}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-50"
        trend={formatTrend(metrics?.growth_percentage || 0, true)}
        trendColor={getTrendColor(metrics?.growth_percentage || 0)}
      />
    </div>
  )
}

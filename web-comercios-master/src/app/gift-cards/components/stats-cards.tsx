'use client'

import { Gift, CheckCircle, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export interface StatsCardsProps {
  activeCount: number
  redeemedThisMonth: number
  totalValue: number
  redemptionRate: number
}

export function StatsCards({
  activeCount,
  redeemedThisMonth,
  totalValue,
  redemptionRate,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Gift Cards Activas',
      value: activeCount,
      icon: Gift,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Redimidas Este Mes',
      value: redeemedThisMonth,
      icon: CheckCircle,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Valor en Circulación',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Tasa de Redención',
      value: `${redemptionRate}%`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-600">
                    {stat.title}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-neutral-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} aria-hidden="true" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

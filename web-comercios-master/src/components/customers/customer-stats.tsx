import { Trophy, TrendingUp, DollarSign, Gift } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatPoints, formatCurrency, formatNumber } from '@/lib/formatters'
import type { CustomerDetailStats } from '@/types/customer'

interface CustomerStatsProps {
  stats: CustomerDetailStats
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  colorClass: string
  iconBgClass: string
}

function StatCard({ icon, label, value, colorClass, iconBgClass }: StatCardProps) {
  return (
    <Card padding="sm" variant="elevated" className="transition-transform hover:scale-105">
      <div className="flex items-start gap-3">
        <div className={`rounded-lg p-2.5 ${iconBgClass}`}>
          <div className={colorClass}>{icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-neutral-900 truncate">{value}</p>
        </div>
      </div>
    </Card>
  )
}

/**
 * Customer Stats Component
 *
 * Displays 4 key statistics about a customer in a responsive grid
 * - Total points
 * - Total visits
 * - Total spent
 * - Gift cards generated
 */
export function CustomerStats({ stats }: CustomerStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Trophy className="w-5 h-5" />}
        label="Total puntos"
        value={formatPoints(stats.totalPoints)}
        colorClass="text-primary-600"
        iconBgClass="bg-primary-50"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Total visitas"
        value={formatNumber(stats.totalVisits)}
        colorClass="text-accent-teal"
        iconBgClass="bg-teal-50"
      />
      <StatCard
        icon={<DollarSign className="w-5 h-5" />}
        label="Total gastado"
        value={formatCurrency(stats.totalSpent)}
        colorClass="text-accent-yellow"
        iconBgClass="bg-yellow-50"
      />
      <StatCard
        icon={<Gift className="w-5 h-5" />}
        label="Gift cards"
        value={formatNumber(stats.giftCardsGenerated)}
        colorClass="text-accent-green"
        iconBgClass="bg-green-50"
      />
    </div>
  )
}

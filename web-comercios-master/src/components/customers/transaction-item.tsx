import { Flame, Gift, CheckCircle, Settings } from 'lucide-react'
import { formatTransactionDate, formatCurrency, formatPoints } from '@/lib/formatters'
import type { Transaction } from '@/types/customer'

interface TransactionItemProps {
  transaction: Transaction
  isLast?: boolean
}

const TRANSACTION_CONFIG = {
  purchase: {
    icon: Flame,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    label: 'Compra',
  },
  gift_card_generated: {
    icon: Gift,
    iconColor: 'text-primary-600',
    iconBg: 'bg-primary-50',
    label: 'Gift card generada',
  },
  gift_card_redeemed: {
    icon: CheckCircle,
    iconColor: 'text-accent-green',
    iconBg: 'bg-green-50',
    label: 'Gift card redimida',
  },
  points_adjustment: {
    icon: Settings,
    iconColor: 'text-neutral-500',
    iconBg: 'bg-neutral-50',
    label: 'Ajuste de puntos',
  },
} as const

/**
 * Transaction Item Component
 *
 * Displays a single transaction in the timeline with icon, date, description, and points
 */
export function TransactionItem({ transaction, isLast = false }: TransactionItemProps) {
  const config = TRANSACTION_CONFIG[transaction.type]
  const Icon = config.icon

  const getDescription = () => {
    switch (transaction.type) {
      case 'purchase':
        return transaction.amount
          ? `Compra ${formatCurrency(transaction.amount)}`
          : transaction.description || 'Compra'
      case 'gift_card_generated':
        return transaction.amount
          ? `Gift card de ${formatCurrency(transaction.amount)}`
          : 'Gift card generada'
      case 'gift_card_redeemed':
        return transaction.amount
          ? `${formatCurrency(transaction.amount)} aplicados`
          : 'Gift card redimida'
      case 'points_adjustment':
        return transaction.description || 'Ajuste manual'
    }
  }

  const getPointsLabel = () => {
    const pointsValue = transaction.points
    const prefix = pointsValue > 0 ? '+' : ''
    return `${prefix}${formatPoints(Math.abs(pointsValue))}`
  }

  const getPointsColor = () => {
    return transaction.points > 0 ? 'text-accent-green' : 'text-red-600'
  }

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-neutral-200" aria-hidden="true" />
      )}

      {/* Icon */}
      <div className={`relative flex-shrink-0 w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center ring-4 ring-white`}>
        <Icon className={`w-5 h-5 ${config.iconColor}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <time className="text-sm font-medium text-neutral-900">
            {formatTransactionDate(transaction.createdAt)}
          </time>
          <span className={`text-sm font-semibold ${getPointsColor()}`}>
            {getPointsLabel()}
          </span>
        </div>
        <p className="text-sm text-neutral-700">{getDescription()}</p>
      </div>
    </div>
  )
}

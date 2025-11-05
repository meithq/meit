import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { TransactionItem } from './transaction-item'
import type { Transaction } from '@/types/customer'
import { History } from 'lucide-react'

interface TransactionTimelineProps {
  transactions: Transaction[]
}

/**
 * Transaction Timeline Component
 *
 * Displays a timeline of customer transactions (last 10)
 * Shows empty state when no transactions exist
 */
export function TransactionTimeline({ transactions }: TransactionTimelineProps) {
  if (transactions.length === 0) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={History}
          title="Sin transacciones"
          description="Este cliente aún no tiene transacciones registradas."
        />
      </Card>
    )
  }

  return (
    <Card padding="md">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">
        Historial reciente
      </h3>
      <div className="space-y-0">
        {transactions.map((transaction, index) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            isLast={index === transactions.length - 1}
          />
        ))}
      </div>
    </Card>
  )
}

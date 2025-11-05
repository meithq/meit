'use client'

import { useRouter } from 'next/navigation'
import { Trophy, Calendar, Phone } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Customer } from '@/types/customer'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'

interface CustomerCardProps {
  customer: Customer
}

/**
 * Customer card component for mobile view
 *
 * Features:
 * - Tap to navigate
 * - Shows key customer info
 * - Responsive design
 */
export function CustomerCard({ customer }: CustomerCardProps) {
  const router = useRouter()

  const formatLastVisit = (lastVisit: string | null) => {
    if (!lastVisit) {
      return 'Nunca'
    }

    try {
      return formatDistanceToNow(new Date(lastVisit), {
        addSuffix: true,
        locale: es,
      })
    } catch {
      return '-'
    }
  }

  return (
    <Card
      onClick={() => router.push(ROUTES.CUSTOMER_DETAIL(customer.id))}
      className="p-4 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(ROUTES.CUSTOMER_DETAIL(customer.id))
        }
      }}
      aria-label={`Ver detalles de ${customer.name}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-neutral-900 truncate">
            {customer.name}
          </h3>
          <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {customer.phone}
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-full">
          <Trophy className="h-4 w-4 text-accent-yellow" aria-hidden="true" />
          <span className="text-sm font-semibold text-primary-600">
            {customer.total_points}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-600">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{customer.visit_count} visitas</span>
        </div>
        <div>
          <span className="text-neutral-500">Última: </span>
          {formatLastVisit(customer.last_visit)}
        </div>
      </div>
    </Card>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { Trophy, ArrowUp, ArrowDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Customer, CustomerSort } from '@/types/customer'
import { ROUTES } from '@/lib/constants'

interface CustomerTableProps {
  customers: Customer[]
  sort: CustomerSort
  onSortChange: (sort: CustomerSort) => void
}

/**
 * Customer table component for desktop view
 *
 * Features:
 * - Sortable columns
 * - Row click navigation
 * - Hover effects
 * - Relative time formatting
 */
export function CustomerTable({ customers, sort, onSortChange }: CustomerTableProps) {
  const router = useRouter()

  const handleSort = (field: CustomerSort['field']) => {
    if (sort.field === field) {
      // Toggle order
      onSortChange({
        field,
        order: sort.order === 'asc' ? 'desc' : 'asc',
      })
    } else {
      // New field, default to descending
      onSortChange({
        field,
        order: 'desc',
      })
    }
  }

  const SortIcon = ({ field }: { field: CustomerSort['field'] }) => {
    if (sort.field !== field) {
      return null
    }
    return sort.order === 'asc' ? (
      <ArrowUp className="h-4 w-4" aria-label="Orden ascendente" />
    ) : (
      <ArrowDown className="h-4 w-4" aria-label="Orden descendente" />
    )
  }

  const formatLastVisit = (lastVisit: string | null) => {
    if (!lastVisit) {
      return <span className="text-neutral-500">Nunca</span>
    }

    try {
      const distance = formatDistanceToNow(new Date(lastVisit), {
        addSuffix: true,
        locale: es,
      })
      return <span className="text-neutral-700">{distance}</span>
    } catch {
      return <span className="text-neutral-500">-</span>
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full">
        <thead className="bg-neutral-50 border-b border-neutral-200">
          <tr>
            <th
              onClick={() => handleSort('name')}
              className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors select-none"
              role="columnheader"
              aria-sort={sort.field === 'name' ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center gap-2">
                Nombre
                <SortIcon field="name" />
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-700" role="columnheader">
              Teléfono
            </th>
            <th
              onClick={() => handleSort('total_points')}
              className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors select-none"
              role="columnheader"
              aria-sort={sort.field === 'total_points' ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent-yellow" aria-hidden="true" />
                Puntos
                <SortIcon field="total_points" />
              </div>
            </th>
            <th
              onClick={() => handleSort('visit_count')}
              className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors select-none"
              role="columnheader"
              aria-sort={sort.field === 'visit_count' ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center gap-2">
                Visitas
                <SortIcon field="visit_count" />
              </div>
            </th>
            <th
              onClick={() => handleSort('last_visit')}
              className="px-4 py-3 text-left text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-100 transition-colors select-none"
              role="columnheader"
              aria-sort={sort.field === 'last_visit' ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}
            >
              <div className="flex items-center gap-2">
                Última Visita
                <SortIcon field="last_visit" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              onClick={() => router.push(ROUTES.CUSTOMER_DETAIL(customer.id))}
              className="cursor-pointer hover:bg-neutral-50 transition-colors"
              role="row"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  router.push(ROUTES.CUSTOMER_DETAIL(customer.id))
                }
              }}
            >
              <td className="px-4 py-3 text-sm font-medium text-neutral-900">
                {customer.name}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-600">
                {customer.phone}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-primary-600">
                {customer.total_points}
              </td>
              <td className="px-4 py-3 text-sm text-neutral-700">
                {customer.visit_count}
              </td>
              <td className="px-4 py-3 text-sm">
                {formatLastVisit(customer.last_visit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

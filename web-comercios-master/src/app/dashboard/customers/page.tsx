'use client'

import { useState, useMemo } from 'react'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchInput } from '@/components/customers/search-input'
import { FiltersPanel } from '@/components/customers/filters-panel'
import { CustomerTable } from '@/components/customers/customer-table'
import { CustomerCard } from '@/components/customers/customer-card'
import { CustomerEmptyState } from '@/components/customers/customer-empty-state'
import { useCustomers } from '@/hooks/use-customers-query'
import { exportCustomersToCSV } from '@/lib/export-csv'
import type { CustomerFilters, CustomerSort } from '@/types/customer'
import { PAGINATION } from '@/lib/constants'

/**
 * Customers list page with React Query optimization
 *
 * Features:
 * - Search by name/phone (debounced 300ms)
 * - Filter by points range, date range
 * - Sort by name, points, visits, last visit
 * - Pagination (20 items per page)
 * - CSV export
 * - Responsive (table on desktop, cards on mobile)
 * - Empty states
 * - Automatic caching and background refetching
 */
export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<CustomerFilters>({
    search: '',
    minPoints: null,
    maxPoints: null,
    dateFrom: null,
    dateTo: null,
  })
  const [sort, setSort] = useState<CustomerSort>({
    field: 'last_visit',
    order: 'desc',
  })
  const [page, setPage] = useState<number>(PAGINATION.DEFAULT_PAGE)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Combine filters with search
  const effectiveFilters = useMemo<CustomerFilters>(() => ({
    ...filters,
    search,
  }), [filters, search])

  // Use React Query hook - automatic caching and refetching
  const {
    data,
    isLoading,
    error,
  } = useCustomers(effectiveFilters, sort, page, PAGINATION.DEFAULT_LIMIT)

  const customers = data?.customers || []
  const pagination = data?.pagination || null

  // Show loading skeleton only on initial load (no data yet)
  const showSkeletonLoading = isLoading && !data

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page on search
  }

  // Handle filters apply
  const handleFiltersApply = (newFilters: CustomerFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to first page on filter change
  }

  // Handle filters clear
  const handleFiltersClear = () => {
    setFilters({
      search,
      minPoints: null,
      maxPoints: null,
      dateFrom: null,
      dateTo: null,
    })
    setPage(1)
  }

  // Handle sort change
  const handleSortChange = (newSort: CustomerSort) => {
    setSort(newSort)
    setPage(1) // Reset to first page on sort change
  }

  // Handle CSV export
  const handleExportCSV = () => {
    if (customers.length === 0) return
    exportCustomersToCSV(customers)
  }

  // Handle pagination
  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    if (!pagination) return
    setPage((prev) => Math.min(pagination.totalPages, prev + 1))
  }

  const hasFilters =
    filters.minPoints !== null ||
    filters.maxPoints !== null ||
    filters.dateFrom !== null ||
    filters.dateTo !== null

  const hasSearch = search.trim() !== ''

  const showEmptyState = !isLoading && customers.length === 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Clientes"
        subtitle="Gestiona tus clientes y visualiza su actividad"
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput value={search} onChange={handleSearchChange} />
        </div>

        <div className="flex gap-3">
          <FiltersPanel
            filters={filters}
            onApply={handleFiltersApply}
            onClear={handleFiltersClear}
            isOpen={isFiltersOpen}
            onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
          />

          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={customers.length === 0}
            className="gap-2"
            aria-label="Exportar clientes a CSV"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </Button>
        </div>
      </div>

      {/* Info Bar */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
          <p>
            {pagination.total} cliente{pagination.total !== 1 ? 's' : ''} registrado{pagination.total !== 1 ? 's' : ''}
            {hasFilters && ' (filtrados)'}
          </p>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFiltersClear}
              className="text-primary-600 hover:text-primary-700"
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-error-200 bg-error-50 p-4 text-sm text-error-700">
          <p className="font-medium">Error al cargar clientes</p>
          <p>{error instanceof Error ? error.message : String(error)}</p>
        </div>
      )}

      {/* Loading State - Only show skeleton on initial load with no cached data */}
      {showSkeletonLoading && (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {/* Empty State */}
      {showEmptyState && (
        <CustomerEmptyState hasSearch={hasSearch || hasFilters} />
      )}

      {/* Desktop Table View - Show immediately if we have data (even if refetching) */}
      {!showSkeletonLoading && customers.length > 0 && (
        <>
          <div className="hidden md:block">
            <CustomerTable
              customers={customers}
              sort={sort}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {customers.map((customer) => (
              <CustomerCard key={customer.id} customer={customer} />
            ))}
          </div>
        </>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-neutral-200 pt-4">
          <p className="text-sm text-neutral-600">
            Página {pagination.page} de {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={pagination.page === 1}
              className="gap-1"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={pagination.page === pagination.totalPages}
              className="gap-1"
              aria-label="Página siguiente"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

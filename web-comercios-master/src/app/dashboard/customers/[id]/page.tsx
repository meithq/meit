'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Phone, Calendar, Edit, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { CustomerStats } from '@/components/customers/customer-stats'
import { TransactionTimeline } from '@/components/customers/transaction-timeline'
import { GiftCardsList } from '@/components/customers/gift-cards-list'
import { EditCustomerModal } from '@/components/customers/edit-customer-modal'
import { AdjustPointsModal } from '@/components/customers/adjust-points-modal'
import { useCustomerDetail } from '@/hooks/use-customer-detail'
import { useAuthStore } from '@/store/auth-store'
import { formatPhone, formatDate } from '@/lib/formatters'
import { ROUTES } from '@/lib/constants'
import { AlertCircle } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function CustomerDetailPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const customerId = resolvedParams.id
  const router = useRouter()
  const role = useAuthStore((state) => state.role)

  const {
    customer,
    stats,
    transactions,
    giftCards,
    loading,
    error,
    refreshCustomer,
    updateCustomerInfo,
    adjustPoints,
  } = useCustomerDetail(customerId)

  const [editModalOpen, setEditModalOpen] = useState(false)
  const [adjustPointsModalOpen, setAdjustPointsModalOpen] = useState(false)

  const canEdit = role === 'admin'

  const handleBack = () => {
    router.push(ROUTES.CUSTOMERS)
  }

  const handleEditSave = async (data: { name: string; email?: string }) => {
    const success = await updateCustomerInfo(data)
    if (success) {
      await refreshCustomer()
    }
    return success
  }

  const handleAdjustPoints = async (points: number, reason: string) => {
    const success = await adjustPoints(points, reason)
    if (success) {
      await refreshCustomer()
    }
    return success
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button skeleton */}
          <Skeleton className="h-10 w-48 mb-6" />

          {/* Header skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-48 mb-1" />
            <Skeleton className="h-5 w-40" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6"
            aria-label="Volver a clientes"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Clientes
          </Button>

          <EmptyState
            icon={AlertCircle}
            title="Cliente no encontrado"
            description={
              error || 'El cliente que buscas no existe o fue eliminado.'
            }
            action={{
              label: 'Volver a Clientes',
              onClick: handleBack,
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6"
            aria-label="Volver a clientes"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Clientes
          </Button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-neutral-900 mb-3">
                  {customer.name}
                </h1>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    <span>{formatPhone(customer.phone)}</span>
                  </div>

                  {customer.email && (
                    <div className="flex items-center gap-2 text-neutral-700">
                      <Mail className="w-4 h-4" aria-hidden="true" />
                      <span>{customer.email}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-neutral-600 text-sm">
                    <Calendar className="w-4 h-4" aria-hidden="true" />
                    <span>
                      Cliente desde {formatDate(customer.created_at, 'd MMMM yyyy')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {canEdit && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditModalOpen(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setAdjustPointsModalOpen(true)}
                  >
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Ajustar puntos
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Stats cards */}
          {stats && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Estadísticas
              </h2>
              <CustomerStats stats={stats} />
            </div>
          )}

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transaction timeline */}
            <div>
              <TransactionTimeline transactions={transactions} />
            </div>

            {/* Gift cards */}
            <div>
              <GiftCardsList giftCards={giftCards} />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {canEdit && customer && (
        <>
          <EditCustomerModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            customer={customer}
            onSave={handleEditSave}
          />
          <AdjustPointsModal
            open={adjustPointsModalOpen}
            onClose={() => setAdjustPointsModalOpen(false)}
            customerName={customer.name}
            currentPoints={customer.total_points}
            onSave={handleAdjustPoints}
          />
        </>
      )}
    </>
  )
}

// Use React's use() hook to unwrap params Promise (Next.js 15)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function use<T>(promise: Promise<T>): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((promise as any)._result !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (promise as any)._result
  }
  throw promise.then(
    (value) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (promise as any)._result = value
    },
    (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (promise as any)._result = Promise.reject(error)
    }
  )
}

'use client'

import { Users, QrCode, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

interface CustomerEmptyStateProps {
  hasSearch: boolean
}

/**
 * Empty state component for customers list
 *
 * Shows different messages based on whether user has search active or no customers at all
 */
export function CustomerEmptyState({ hasSearch }: CustomerEmptyStateProps) {
  if (hasSearch) {
    return (
      <EmptyState
        icon={Users}
        title="No se encontraron clientes"
        description="No hay clientes que coincidan con tu búsqueda. Intenta con otros términos."
      />
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-primary-50 p-6 mb-6">
        <Users className="h-12 w-12 text-primary-600" aria-hidden="true" />
      </div>

      <h3 className="text-xl font-semibold text-neutral-900 mb-2">
        Todavía no tienes clientes
      </h3>

      <div className="max-w-md text-center space-y-3 mb-8">
        <p className="text-neutral-600 flex items-center gap-2 justify-center">
          <QrCode className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Comparte tu código QR para que los clientes se registren
        </p>
        <p className="text-neutral-600 flex items-center gap-2 justify-center">
          <Send className="h-5 w-5 text-primary-600" aria-hidden="true" />
          Una vez que tengas clientes, aparecerán aquí
        </p>
      </div>

      <div className="flex gap-3 flex-col sm:flex-row">
        <Button variant="primary" className="gap-2">
          <QrCode className="h-4 w-4" aria-hidden="true" />
          Ver código QR
        </Button>
        <Button variant="outline" className="gap-2">
          <Send className="h-4 w-4" aria-hidden="true" />
          Invitar cliente
        </Button>
      </div>
    </div>
  )
}

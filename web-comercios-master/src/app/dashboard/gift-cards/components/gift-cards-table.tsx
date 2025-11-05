'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, Calendar } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { GiftCardWithCustomer, GiftCardStatus } from '@/hooks/use-gift-cards'
import { useGiftCards } from '@/hooks/use-gift-cards'

interface GiftCardsTableProps {
  status: GiftCardStatus
}

export function GiftCardsTable({ status }: GiftCardsTableProps) {
  const [search, setSearch] = useState('')
  const { giftCards, loading, isExpiringSoon } = useGiftCards(status)

  // Filter gift cards by search term
  const filteredGiftCards = giftCards.filter((card) => {
    if (!search.trim()) return true
    const searchLower = search.toLowerCase()
    return (
      card.code.toLowerCase().includes(searchLower) ||
      card.customer?.name?.toLowerCase().includes(searchLower) ||
      card.customer?.phone?.includes(search)
    )
  })

  const getStatusBadge = (card: GiftCardWithCustomer) => {
    if (card.status === 'redeemed') {
      return <Badge variant="success">Redimida</Badge>
    }
    if (card.status === 'expired') {
      return <Badge variant="error">Expirada</Badge>
    }
    if (card.expires_at && isExpiringSoon(card.expires_at)) {
      return <Badge variant="warning">Por vencer</Badge>
    }
    return <Badge variant="success">Activa</Badge>
  }

  const getTitle = () => {
    switch (status) {
      case 'active':
        return 'Gift Cards Activas'
      case 'redeemed':
        return 'Gift Cards Redimidas'
      case 'expired':
        return 'Gift Cards Vencidas'
      default:
        return 'Gift Cards'
    }
  }

  const getEmptyStateMessage = () => {
    switch (status) {
      case 'active':
        return 'No hay gift cards activas'
      case 'redeemed':
        return 'No hay gift cards redimidas'
      case 'expired':
        return 'No hay gift cards vencidas'
      default:
        return 'No hay gift cards'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{getTitle()}</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Buscar por código o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Buscar gift cards"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredGiftCards.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={getEmptyStateMessage()}
            description={
              search
                ? 'Intenta con otros términos de búsqueda'
                : 'Las gift cards aparecerán aquí cuando estén disponibles'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Generada</TableHead>
                  {status === 'active' && <TableHead>Vence</TableHead>}
                  {status === 'redeemed' && <TableHead>Redimida</TableHead>}
                  {status === 'expired' && <TableHead>Venció</TableHead>}
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGiftCards.map((card) => (
                  <TableRow key={card.id}>
                    <TableCell className="font-mono font-medium">
                      {card.code}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-neutral-900">
                          {card.customer?.name || 'Sin asignar'}
                        </span>
                        {card.customer?.phone && (
                          <span className="text-sm text-neutral-500">
                            {card.customer.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      ${card.value.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-600">
                      {format(new Date(card.created_at), 'PP', { locale: es })}
                    </TableCell>
                    {status === 'active' && (
                      <TableCell className="text-sm text-neutral-600">
                        {card.expires_at
                          ? format(new Date(card.expires_at), 'PP', { locale: es })
                          : '-'}
                      </TableCell>
                    )}
                    {status === 'redeemed' && (
                      <TableCell className="text-sm text-neutral-600">
                        {card.redeemed_at
                          ? format(new Date(card.redeemed_at), 'PP', { locale: es })
                          : '-'}
                      </TableCell>
                    )}
                    {status === 'expired' && (
                      <TableCell className="text-sm text-neutral-600">
                        {card.expires_at
                          ? format(new Date(card.expires_at), 'PP', { locale: es })
                          : '-'}
                      </TableCell>
                    )}
                    <TableCell>{getStatusBadge(card)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

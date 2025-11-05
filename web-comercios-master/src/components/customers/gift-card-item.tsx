'use client'

import { useState } from 'react'
import { Gift, Copy, Check, Calendar, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/formatters'
import { differenceInDays, parseISO } from 'date-fns'
import type { GiftCard } from '@/types/customer'

interface GiftCardItemProps {
  giftCard: GiftCard
}

/**
 * Gift Card Item Component
 *
 * Displays a single gift card with value, code, expiration, and copy button
 * Shows status badge (active, expiring soon, redeemed)
 */
export function GiftCardItem({ giftCard }: GiftCardItemProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(giftCard.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const isExpiringSoon = () => {
    if (!giftCard.expiresAt) return false
    const expiryDate = typeof giftCard.expiresAt === 'string'
      ? parseISO(giftCard.expiresAt)
      : giftCard.expiresAt
    const daysUntilExpiration = differenceInDays(expiryDate, new Date())
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0
  }

  const getStatusBadge = () => {
    if (giftCard.status === 'redeemed') {
      return <Badge variant="success">Canjeada</Badge>
    }
    if (giftCard.status === 'expired') {
      return <Badge variant="error">Expirada</Badge>
    }
    if (isExpiringSoon()) {
      return <Badge variant="warning">Vence pronto</Badge>
    }
    return <Badge variant="primary">Activa</Badge>
  }

  const isActive = giftCard.status === 'available'

  return (
    <div
      className={`
        relative flex items-start gap-4 p-4 rounded-lg border-2
        ${isActive ? 'bg-primary-50 border-primary-200' : 'bg-neutral-50 border-neutral-200'}
        transition-colors
      `}
    >
      {/* Icon */}
      <div className={`
        flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
        ${isActive ? 'bg-primary-100' : 'bg-neutral-100'}
      `}>
        <Gift className={`w-6 h-6 ${isActive ? 'text-primary-600' : 'text-neutral-500'}`} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-xl font-bold text-neutral-900">
              {formatCurrency(giftCard.value)}
            </p>
            <p className="text-sm text-neutral-600">USD</p>
          </div>
          {getStatusBadge()}
        </div>

        {/* Code */}
        <div className="flex items-center gap-2 mb-2">
          <code className="text-sm font-mono font-semibold text-neutral-900 bg-white px-2 py-1 rounded border border-neutral-200">
            {giftCard.code}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            disabled={!isActive}
            aria-label="Copiar código"
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-accent-green" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Expiration info */}
        {giftCard.expiresAt && (
          <div className="flex items-center gap-1.5 text-sm text-neutral-600">
            {isExpiringSoon() ? (
              <>
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-orange-600 font-medium">
                  Vence {formatDate(giftCard.expiresAt, 'd MMM yyyy')}
                </span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>
                  Vence {formatDate(giftCard.expiresAt, 'd MMM yyyy')}
                </span>
              </>
            )}
          </div>
        )}

        {/* Redeemed info */}
        {giftCard.status === 'redeemed' && giftCard.redeemedAt && (
          <p className="text-sm text-neutral-600 mt-1">
            Canjeada el {formatDate(giftCard.redeemedAt, 'd MMM yyyy')}
          </p>
        )}
      </div>
    </div>
  )
}

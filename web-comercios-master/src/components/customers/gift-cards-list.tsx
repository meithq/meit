import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { GiftCardItem } from './gift-card-item'
import type { GiftCard } from '@/types/customer'
import { Gift } from 'lucide-react'

interface GiftCardsListProps {
  giftCards: GiftCard[]
}

/**
 * Gift Cards List Component
 *
 * Displays a list of customer gift cards (active and redeemed)
 * Shows empty state when no gift cards exist
 */
export function GiftCardsList({ giftCards }: GiftCardsListProps) {
  // Separate active and redeemed gift cards
  const activeGiftCards = giftCards.filter(gc => gc.status === 'available')
  const redeemedGiftCards = giftCards.filter(gc => gc.status === 'redeemed')

  if (giftCards.length === 0) {
    return (
      <Card padding="lg">
        <EmptyState
          icon={Gift}
          title="Sin gift cards activas"
          description="Este cliente no tiene gift cards disponibles para canjear."
        />
      </Card>
    )
  }

  return (
    <Card padding="md">
      <h3 className="text-lg font-semibold text-neutral-900 mb-6">
        Gift Cards {activeGiftCards.length > 0 && `(${activeGiftCards.length})`}
      </h3>

      {/* Active Gift Cards */}
      {activeGiftCards.length > 0 ? (
        <div className="space-y-3 mb-6">
          {activeGiftCards.map((giftCard) => (
            <GiftCardItem key={giftCard.id} giftCard={giftCard} />
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <EmptyState
            icon={Gift}
            title="Sin gift cards activas"
            description="Todas las gift cards han sido canjeadas."
            size="sm"
          />
        </div>
      )}

      {/* Redeemed Gift Cards */}
      {redeemedGiftCards.length > 0 && (
        <>
          <div className="border-t border-neutral-200 my-6" />
          <h4 className="text-sm font-medium text-neutral-600 mb-3">
            Canjeadas ({redeemedGiftCards.length})
          </h4>
          <div className="space-y-3">
            {redeemedGiftCards.map((giftCard) => (
              <GiftCardItem key={giftCard.id} giftCard={giftCard} />
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

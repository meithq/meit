'use client'

import { useState } from 'react'
import { Settings, Gift } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { StatsCards } from './components/stats-cards'
import { ValidationCard } from './components/validation-card'
import { GiftCardsTable } from './components/gift-cards-table'
import { ConfigModal } from './components/config-modal'
import { useGiftCards } from '@/hooks/use-gift-cards'

export default function GiftCardsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'redeemed' | 'expired'>('active')
  const [configModalOpen, setConfigModalOpen] = useState(false)

  // Fetch stats for all statuses
  const { stats: activeStats, refetch: refetchActive } = useGiftCards('active')
  const { giftCards: redeemedCards, refetch: refetchRedeemed } = useGiftCards('redeemed')
  const { giftCards: expiredCards, refetch: refetchExpired } = useGiftCards('expired')

  const handleRedeemSuccess = () => {
    // Refresh all tabs after redemption
    refetchActive()
    refetchRedeemed()
    refetchExpired()
  }

  return (
    <div className="container mx-auto space-y-6 p-4 pb-16 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary-100 p-3">
            <Gift className="h-6 w-6 text-primary-600" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 md:text-3xl">
              Gift Cards
            </h1>
            <p className="text-sm text-neutral-600">
              Valida, redime y administra las gift cards de tus clientes
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setConfigModalOpen(true)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Configuración
        </Button>
      </div>

      {/* Statistics Cards */}
      <StatsCards
        activeCount={activeStats.activeCount}
        redeemedThisMonth={activeStats.redeemedThisMonth}
        totalValue={activeStats.totalValue}
        redemptionRate={activeStats.redemptionRate}
      />

      {/* Validation Section */}
      <ValidationCard onRedeemSuccess={handleRedeemSuccess} />

      {/* Gift Cards Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'active' | 'redeemed' | 'expired')}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="gap-2">
            <span className="hidden sm:inline">Gift Cards</span> Activas
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
              {activeStats.activeCount}
            </span>
          </TabsTrigger>
          <TabsTrigger value="redeemed" className="gap-2">
            Redimidas
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
              {redeemedCards.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            Vencidas
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-700">
              {expiredCards.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <GiftCardsTable status="active" />
        </TabsContent>

        <TabsContent value="redeemed" className="space-y-4">
          <GiftCardsTable status="redeemed" />
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <GiftCardsTable status="expired" />
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      <ConfigModal open={configModalOpen} onOpenChange={setConfigModalOpen} />
    </div>
  )
}

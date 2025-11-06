"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getDashboardMetrics, type DashboardMetrics } from "@/lib/supabase/dashboard"

export function SectionCards() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    checkinsToday: 0,
    pointsToday: 0,
    activeCustomers: 0,
    giftCardsGenerated: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await getDashboardMetrics()
        setMetrics(data)
      } catch (error) {
        console.error("Error loading dashboard metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMetrics()
  }, [])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t lg:px-6">
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Check-ins hoy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              formatNumber(metrics.checkinsToday)
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Puntos asignados hoy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              formatNumber(metrics.pointsToday)
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Clientes activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              formatNumber(metrics.activeCustomers)
            )}
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Gift Cards generadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              formatNumber(metrics.giftCardsGenerated)
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

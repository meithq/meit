'use client'

import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { InsightData } from '@/hooks/use-analytics'

interface InsightsSectionProps {
  insights: InsightData[]
  loading: boolean
}

interface InsightCardProps {
  insight: InsightData
}

function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card className="border-l-4 border-l-accent-yellow hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img" aria-label="Insight icon">
            {insight.icon}
          </span>
          <div className="flex-1">
            <p className="text-sm text-neutral-700 leading-relaxed">{insight.text}</p>
            {insight.cta && (
              <button
                className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 focus:outline-none focus:underline"
                onClick={() => {
                  // TODO: Handle CTA action
                  alert('Acción próximamente')
                }}
              >
                {insight.cta} →
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InsightSkeleton() {
  return (
    <Card className="border-l-4 border-l-accent-yellow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function InsightsSection({ insights, loading }: InsightsSectionProps) {
  if (loading) {
    return (
      <section aria-labelledby="insights-heading">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-accent-yellow" aria-hidden="true" />
          <h2 id="insights-heading" className="text-xl font-semibold text-neutral-900">
            Insights Automáticos
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <InsightSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <section aria-labelledby="insights-heading">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-accent-yellow" aria-hidden="true" />
          <h2 id="insights-heading" className="text-xl font-semibold text-neutral-900">
            Insights Automáticos
          </h2>
        </div>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <Lightbulb className="h-12 w-12 text-neutral-300 mx-auto mb-3" aria-hidden="true" />
              <p className="text-neutral-500 text-sm">
                No hay suficientes datos para generar insights en este período
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  return (
    <section aria-labelledby="insights-heading">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-accent-yellow" aria-hidden="true" />
        <h2 id="insights-heading" className="text-xl font-semibold text-neutral-900">
          Insights Automáticos
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>
    </section>
  )
}

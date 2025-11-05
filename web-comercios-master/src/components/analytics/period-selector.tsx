'use client'

import * as React from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { subDays, format } from 'date-fns'

export interface PeriodRange {
  from: Date
  to: Date
  label: string
}

interface PeriodSelectorProps {
  selectedPeriod: PeriodRange
  onPeriodChange: (period: PeriodRange) => void
}

const PERIOD_OPTIONS: PeriodRange[] = [
  {
    from: subDays(new Date(), 7),
    to: new Date(),
    label: 'Últimos 7 días'
  },
  {
    from: subDays(new Date(), 30),
    to: new Date(),
    label: 'Últimos 30 días'
  },
  {
    from: subDays(new Date(), 90),
    to: new Date(),
    label: 'Últimos 90 días'
  }
]

export function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  const [isCustom, setIsCustom] = React.useState(false)

  const handlePeriodSelect = (period: PeriodRange) => {
    setIsCustom(false)
    onPeriodChange(period)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="h-5 w-5 text-neutral-600" aria-hidden="true" />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Selector de período">
        {PERIOD_OPTIONS.map((period) => (
          <Button
            key={period.label}
            variant={selectedPeriod.label === period.label && !isCustom ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handlePeriodSelect(period)}
            aria-pressed={selectedPeriod.label === period.label && !isCustom}
          >
            {period.label}
          </Button>
        ))}

        {/* Custom range button - would open a date picker modal */}
        <Button
          variant={isCustom ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            setIsCustom(true)
            // TODO: Open date picker modal for custom range selection
            alert('Selector de rango personalizado próximamente')
          }}
          aria-pressed={isCustom}
        >
          Rango personalizado
        </Button>
      </div>

      <span className="text-sm text-neutral-600 ml-2" aria-live="polite">
        {format(selectedPeriod.from, 'dd/MM/yyyy')} - {format(selectedPeriod.to, 'dd/MM/yyyy')}
      </span>
    </div>
  )
}

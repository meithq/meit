'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CustomerFilters } from '@/types/customer'

interface FiltersPanelProps {
  filters: CustomerFilters
  onApply: (filters: CustomerFilters) => void
  onClear: () => void
  isOpen: boolean
  onToggle: () => void
}

/**
 * Filters panel for customers list
 *
 * Features:
 * - Points range (min/max)
 * - Date range (from/to)
 * - Status dropdown
 * - Apply/Clear buttons
 */
export function FiltersPanel({
  filters,
  onApply,
  onClear,
  isOpen,
  onToggle,
}: FiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<CustomerFilters>(filters)

  const handleApply = () => {
    onApply(localFilters)
    onToggle()
  }

  const handleClear = () => {
    const clearedFilters: CustomerFilters = {
      search: filters.search,
      minPoints: null,
      maxPoints: null,
      dateFrom: null,
      dateTo: null,
    }
    setLocalFilters(clearedFilters)
    onClear()
    onToggle()
  }

  const hasActiveFilters =
    localFilters.minPoints !== null ||
    localFilters.maxPoints !== null ||
    localFilters.dateFrom !== null ||
    localFilters.dateTo !== null

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className="gap-2"
        aria-label="Abrir filtros"
      >
        <Filter className="h-4 w-4" aria-hidden="true" />
        Filtros
        {hasActiveFilters && (
          <span className="h-2 w-2 rounded-full bg-primary-600" aria-label="Filtros activos" />
        )}
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 lg:static lg:bg-transparent lg:z-auto">
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl lg:relative lg:shadow-none lg:border lg:border-neutral-200 lg:rounded-lg lg:max-w-none lg:w-auto">
        <div className="flex items-center justify-between border-b border-neutral-200 p-4 lg:hidden">
          <h3 className="text-lg font-semibold text-neutral-900">Filtros</h3>
          <button
            type="button"
            onClick={onToggle}
            className="text-neutral-500 hover:text-neutral-700"
            aria-label="Cerrar filtros"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto lg:max-h-none">
          {/* Points Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral-700">
              Rango de Puntos
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minPoints" className="text-xs text-neutral-600">
                  Mínimo
                </Label>
                <Input
                  id="minPoints"
                  type="number"
                  min="0"
                  value={localFilters.minPoints ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      minPoints: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="maxPoints" className="text-xs text-neutral-600">
                  Máximo
                </Label>
                <Input
                  id="maxPoints"
                  type="number"
                  min="0"
                  value={localFilters.maxPoints ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      maxPoints: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-neutral-700">
              Última Visita
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dateFrom" className="text-xs text-neutral-600">
                  Desde
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={localFilters.dateFrom ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dateFrom: e.target.value || null,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="dateTo" className="text-xs text-neutral-600">
                  Hasta
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={localFilters.dateTo ?? ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      dateTo: e.target.value || null,
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              className="flex-1"
            >
              Limpiar
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              className="flex-1"
            >
              Aplicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

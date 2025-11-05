'use client'

import * as React from 'react'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AnalyticsMetrics, ChartDataPoint, TopChallenge } from '@/hooks/use-analytics'
import { format } from 'date-fns'

interface ExportButtonProps {
  metrics: AnalyticsMetrics | null
  checkinsData: ChartDataPoint[]
  pointsData: ChartDataPoint[]
  topChallenges: TopChallenge[]
  dateRange: { from: Date; to: Date }
}

export function ExportButton({ metrics, checkinsData, pointsData, topChallenges, dateRange }: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false)
  const [showMenu, setShowMenu] = React.useState(false)

  const exportAsCSV = () => {
    setIsExporting(true)

    try {
      // Build CSV content
      let csvContent = 'Reporte de Analytics MEIT\n'
      csvContent += `Período: ${format(dateRange.from, 'dd/MM/yyyy')} - ${format(dateRange.to, 'dd/MM/yyyy')}\n\n`

      // Metrics section
      csvContent += 'MÉTRICAS GENERALES\n'
      csvContent += 'Métrica,Valor\n'
      csvContent += `Total Check-ins,${metrics?.today_visits || 0}\n`
      csvContent += `Nuevos Clientes,${metrics?.new_customers || 0}\n`
      csvContent += `Tasa de Retención,${metrics?.retention_rate || 0}%\n`
      csvContent += `Gift Cards Generadas,${metrics?.gift_cards_generated || 0}\n`
      csvContent += `Gift Cards Redimidas,${metrics?.gift_cards_redeemed || 0}\n`
      csvContent += `Crecimiento,${metrics?.growth_percentage || 0}%\n\n`

      // Check-ins daily data
      csvContent += 'CHECK-INS DIARIOS\n'
      csvContent += 'Fecha,Check-ins\n'
      checkinsData.forEach(point => {
        csvContent += `${point.date},${point.value}\n`
      })
      csvContent += '\n'

      // Points daily data
      csvContent += 'PUNTOS ASIGNADOS DIARIOS\n'
      csvContent += 'Fecha,Puntos\n'
      pointsData.forEach(point => {
        csvContent += `${point.date},${point.value}\n`
      })
      csvContent += '\n'

      // Top challenges
      csvContent += 'TOP RETOS\n'
      csvContent += 'Nombre,Completados\n'
      topChallenges.forEach(challenge => {
        csvContent += `${challenge.name},${challenge.completions}\n`
      })

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `analytics-meit-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setShowMenu(false)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Error al exportar el archivo CSV')
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsPDF = () => {
    // TODO: Implement PDF export with a library like jsPDF
    alert('Exportación a PDF próximamente')
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="md"
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting || !metrics}
        className="gap-2"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Exportar Reporte
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-20"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="export-menu"
          >
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 rounded-t-lg focus:outline-none focus:bg-neutral-50"
              onClick={exportAsCSV}
              role="menuitem"
            >
              <FileSpreadsheet className="h-4 w-4 text-accent-green" aria-hidden="true" />
              <span>Exportar como CSV</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 rounded-b-lg focus:outline-none focus:bg-neutral-50"
              onClick={exportAsPDF}
              role="menuitem"
            >
              <FileText className="h-4 w-4 text-red-600" aria-hidden="true" />
              <span>Exportar como PDF</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

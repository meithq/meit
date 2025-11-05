/**
 * CSV export utilities for customer data
 */

import type { Customer } from '@/types/customer'
import { format } from 'date-fns'

/**
 * Convert customers array to CSV string
 */
export function customersToCSV(customers: Customer[]): string {
  // CSV Header
  const header = ['Nombre', 'Teléfono', 'Email', 'Puntos', 'Visitas', 'Última Visita', 'Fecha Registro']

  // CSV Rows
  const rows = customers.map((customer) => {
    const lastVisit = customer.last_visit
      ? format(new Date(customer.last_visit), 'dd/MM/yyyy HH:mm')
      : 'Nunca'

    const createdAt = format(new Date(customer.created_at), 'dd/MM/yyyy')

    const email = customer.email || '-'

    return [
      escapeCSVField(customer.name),
      escapeCSVField(customer.phone),
      escapeCSVField(email),
      customer.total_points.toString(),
      customer.visit_count.toString(),
      escapeCSVField(lastVisit),
      createdAt,
    ]
  })

  // Combine header and rows
  const csvLines = [header, ...rows]

  // Join with newlines
  return csvLines.map((row) => row.join(',')).join('\n')
}

/**
 * Escape CSV field to handle special characters
 */
function escapeCSVField(field: string): string {
  // If field contains comma, newline, or quotes, wrap in quotes and escape inner quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}

/**
 * Export customers to CSV and download
 */
export function exportCustomersToCSV(customers: Customer[]): void {
  const csvContent = customersToCSV(customers)
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm')
  const filename = `clientes_${timestamp}.csv`

  downloadCSV(csvContent, filename)
}

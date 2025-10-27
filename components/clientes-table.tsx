"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cliente } from "@/lib/clientes-data"

interface ClientesTableProps {
  clientes: Cliente[]
}

export function ClientesTable({ clientes }: ClientesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredClientes = clientes

  // Calcular paginación
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClientes = filteredClientes.slice(startIndex, endIndex)

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Función para obtener el color del badge según los puntos
  const getPuntosBadgeVariant = (puntos: number) => {
    if (puntos >= 2000) return "default"
    if (puntos >= 1000) return "secondary"
    return "outline"
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold w-1/5">Nombre</TableHead>
                <TableHead className="font-semibold w-1/5">Teléfono</TableHead>
                <TableHead className="font-semibold w-1/5 text-right">Puntos</TableHead>
                <TableHead className="font-semibold w-1/5 text-center">Visitas</TableHead>
                <TableHead className="font-semibold w-1/5">Última Visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClientes.length > 0 ? (
                currentClientes.map((cliente) => (
                  <TableRow key={cliente.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{cliente.nombre}</TableCell>
                    <TableCell className="text-muted-foreground">{cliente.telefono}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getPuntosBadgeVariant(cliente.puntos)}>
                        {cliente.puntos.toLocaleString('es-ES')} pts
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {cliente.visitas}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(cliente.ultimaVisita)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No se encontraron clientes.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Mostrar primera página, última página, página actual y páginas adyacentes
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

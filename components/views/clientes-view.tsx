"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { FormInput } from "@/components/ui/form-input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Search, Filter, Download, Phone, Award, Calendar, Home, Users } from "lucide-react"
import { useState, useMemo } from "react"
import { exportToCSV } from "@/lib/export-csv"
import { clientesData } from "@/lib/clientes-data"
import { useNavigation } from "@/contexts/navigation-context"

export function ClientesView() {
  const { setView } = useNavigation()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filtrar clientes basado en el término de búsqueda
  const filteredClientes = useMemo(() => {
    if (!searchTerm) return clientesData

    return clientesData.filter((cliente) =>
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.includes(searchTerm)
    )
  }, [searchTerm])

  const handleExportCSV = () => {
    exportToCSV(
      filteredClientes,
      `clientes-${new Date().toISOString().split('T')[0]}`,
      {
        id: "ID",
        nombre: "Nombre",
        telefono: "Teléfono",
        puntos: "Puntos",
        visitas: "Visitas",
        ultimaVisita: "Última Visita"
      }
    )
  }

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

  // Calcular paginación
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClientes = filteredClientes.slice(startIndex, endIndex)

  return (
    <div className="flex flex-col gap-4 pt-4 md:pt-6 md:gap-6 max-w-[1200px] mx-auto w-full pb-[100px]">
      {/* Breadcrumb */}
      <div className="px-4 lg:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="#"
                className="flex items-center gap-1 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault()
                  setView("dashboard")
                }}
              >
                <Home className="h-4 w-4" />
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Clientes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Clientes
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestiona y visualiza información de tus clientes
        </p>
      </div>

      {/* Search and Actions Bar */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <FormInput
              type="text"
              placeholder="Buscar clientes..."
              className="pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <SecondaryButton className="flex-1 sm:flex-none">
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </SecondaryButton>
            <SecondaryButton
              className="flex-1 sm:flex-none"
              onClick={handleExportCSV}
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4 lg:px-6">
        {currentClientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentClientes.map((cliente) => (
              <Card key={cliente.id} className="p-4 shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
                {/* Header con nombre y puntos */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">
                      {cliente.nombre}
                    </h3>
                  </div>
                  <Badge variant={getPuntosBadgeVariant(cliente.puntos)}>
                    {cliente.puntos.toLocaleString('es-ES')} pts
                  </Badge>
                </div>

                {/* Información de contacto y estadísticas */}
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{cliente.telefono}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium">{cliente.visitas} visitas</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>Última visita: {formatDate(cliente.ultimaVisita)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No se encontraron clientes" : "Aún no tienes clientes"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
              {searchTerm
                ? "Intenta ajustar tus criterios de búsqueda"
                : "Los clientes aparecerán aquí cuando realicen su primera transacción"
              }
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 lg:px-6 mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClientes.length)} de {filteredClientes.length} clientes
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-2 text-sm border-0 hover:bg-primary/10 hover:text-primary transition-colors rounded-full ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
            >
              Anterior
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Mostrar primera página, última página, página actual y páginas adyacentes
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm border-0 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer rounded-full flex items-center justify-center ${currentPage === page ? "bg-primary/10 text-primary" : ""}`}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-muted-foreground">...</span>
                )
              }
              return null
            })}

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 text-sm border-0 hover:bg-primary/10 hover:text-primary transition-colors rounded-full ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

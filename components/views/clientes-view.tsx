"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { FormInput } from "@/components/ui/form-input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { Search, Filter, Download, Phone, Award, Calendar, Home, Users, Building2, Trophy, Clock } from "lucide-react"
import { useState, useMemo, useEffect } from "react"
import { exportToCSV } from "@/lib/export-csv"
import { useNavigation } from "@/contexts/navigation-context"
import { getBusinessSettings, type BusinessSettings } from "@/lib/supabase/business-settings"
import {
  getCustomersByBusiness,
  subscribeToCustomerBusinesses,
  type CustomerBusinessWithDetails
} from "@/lib/supabase/customer-businesses"
import { getPointsAuditByCustomer, type PointsAudit } from "@/lib/supabase/points-audit"
import { toast } from "sonner"

export function ClientesView() {
  const { setView } = useNavigation()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Estados para negocio y clientes
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null)
  const [customers, setCustomers] = useState<CustomerBusinessWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Estados para el Sheet de historial
  const [isHistorySheetOpen, setIsHistorySheetOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBusinessWithDetails | null>(null)
  const [pointsHistory, setPointsHistory] = useState<PointsAudit[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  // Cargar configuración del negocio y clientes al montar el componente
  useEffect(() => {
    loadBusinessAndCustomers()
  }, [])

  // Suscripción en tiempo real para actualizar clientes
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const setupSubscription = async () => {
      if (!businessSettings?.id) return

      console.log('🔌 Setting up ClientesView realtime subscription...')

      unsubscribe = subscribeToCustomerBusinesses(businessSettings.id, (payload) => {
        console.log('👥 ClientesView received customer_business change:', payload)
        // Recargar clientes sin mostrar loader
        loadBusinessAndCustomers(false)
      })
    }

    setupSubscription()

    return () => {
      if (unsubscribe) {
        console.log('🔌 Cleaning up ClientesView subscription')
        unsubscribe()
      }
    }
  }, [businessSettings?.id])

  const loadBusinessAndCustomers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }

      // Cargar la configuración del negocio (solo si aún no está cargada)
      let settings = businessSettings
      if (!settings) {
        settings = await getBusinessSettings()
        if (!settings) {
          toast.error('No se encontró configuración del negocio')
          if (showLoader) {
            setIsLoading(false)
          }
          return
        }
        setBusinessSettings(settings)
      }

      // Cargar los clientes del negocio
      const customersList = await getCustomersByBusiness(settings.id!)
      setCustomers(customersList)
    } catch (error) {
      console.error('Error loading business and customers:', error)
      toast.error('Error al cargar los datos')
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  const handleOpenHistory = async (customer: CustomerBusinessWithDetails) => {
    setSelectedCustomer(customer)
    setIsHistorySheetOpen(true)
    setIsLoadingHistory(true)

    try {
      // Cargar historial de puntos del cliente
      const history = await getPointsAuditByCustomer(customer.customer_id)
      setPointsHistory(history)
    } catch (error) {
      console.error('Error loading points history:', error)
      toast.error('Error al cargar el historial de puntos')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Filtrar clientes basado en el término de búsqueda
  const filteredClientes = useMemo(() => {
    if (!searchTerm) return customers

    return customers.filter((customer) =>
      customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm)
    )
  }, [searchTerm, customers])

  const handleExportCSV = () => {
    const exportData = filteredClientes.map((customer) => ({
      nombre: customer.customer_name || 'N/A',
      telefono: customer.phone || 'N/A',
      puntos: customer.total_points || 0,
      visitas: customer.visits_count || 0,
      ultimaVisita: customer.last_visit_at
        ? new Date(customer.last_visit_at).toLocaleDateString('es-ES')
        : 'N/A',
    }))

    exportToCSV(
      exportData,
      `clientes-${businessSettings?.name || 'negocio'}-${new Date().toISOString().split('T')[0]}`,
      {
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
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Clientes
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestiona y visualiza información de tus clientes{businessSettings ? ` de ${businessSettings.name}` : ''}
            </p>
          </div>
        </div>
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="p-4 shadow-none"
                style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}
              >
                {/* Header with name and points skeleton */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                {/* Contact info and stats skeleton */}
                <div className="flex flex-col gap-2">
                  {/* Phone */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-28" />
                  </div>

                  {/* Visits */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-20" />
                  </div>

                  {/* Last visit */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : currentClientes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentClientes.map((customer) => (
              <Card
                key={customer.id}
                className="p-4 shadow-none cursor-pointer transition-all hover:border-primary/20 hover:shadow-sm"
                style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}
                onClick={() => handleOpenHistory(customer)}
              >
                {/* Header con nombre y puntos */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base text-foreground">
                      {customer.customer_name || 'Cliente'}
                    </h3>
                  </div>
                  <Badge variant={getPuntosBadgeVariant(customer.total_points || 0)}>
                    {(customer.total_points || 0).toLocaleString('es-ES')} pts
                  </Badge>
                </div>

                {/* Información de contacto y estadísticas */}
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{customer.phone || 'N/A'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="font-medium">{customer.visits_count || 0} visitas</span>
                  </div>

                  {customer.last_visit_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Última visita: {formatDate(customer.last_visit_at)}</span>
                    </div>
                  )}
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
              {searchTerm ? "No se encontraron clientes" : "Aún no tienes clientes en este negocio"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
              {searchTerm
                ? "Intenta ajustar tus criterios de búsqueda"
                : "Los clientes aparecerán aquí cuando escaneen el código QR y hagan check-in"
              }
            </p>
            {businessSettings && (
              <p className="text-xs text-muted-foreground">
                Negocio: <span className="font-medium">{businessSettings.name}</span>
              </p>
            )}
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

      {/* Sheet de Historial de Puntos */}
      <Sheet open={isHistorySheetOpen} onOpenChange={setIsHistorySheetOpen}>
        <SheetContent
          side="right"
          className="m-4 h-[calc(100vh-2rem)] p-0 [&>button]:bg-white [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border [&>button]:shadow-sm [&>button]:cursor-pointer flex flex-col"
          style={{ borderRadius: '30px', borderColor: '#eeeeee' }}
        >
          <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-border">
            <SheetTitle className="text-2xl">Historial de Puntos</SheetTitle>
            <SheetDescription>
              {selectedCustomer?.customer_name || 'Cliente'}
            </SheetDescription>

            {/* Resumen de puntos */}
            {selectedCustomer && (
              <div className="mt-4 p-4 bg-primary/5 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {selectedCustomer.total_points || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Puntos disponibles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-muted-foreground">
                      {selectedCustomer.lifetime_points || 0} totales
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedCustomer.visits_count || 0} visitas
                    </p>
                  </div>
                </div>
              </div>
            )}
          </SheetHeader>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoadingHistory ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="p-4 rounded-2xl border border-border">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <Skeleton className="w-16 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pointsHistory.length > 0 ? (
              <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

                {/* Entradas del timeline */}
                <div className="space-y-4">
                  {pointsHistory.map((entry, index) => {
                    const isPositive = entry.points_assigned > 0
                    const isNegative = entry.points_assigned < 0

                    return (
                      <div key={entry.id} className="relative pl-11">
                        {/* Icono en el timeline */}
                        <div
                          className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isPositive
                              ? 'bg-green-100'
                              : isNegative
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                          }`}
                        >
                          {isPositive ? (
                            <span className="text-green-600 font-bold text-lg">+</span>
                          ) : isNegative ? (
                            <span className="text-red-600 font-bold text-lg">−</span>
                          ) : (
                            <Trophy className="w-4 h-4 text-gray-600" />
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="bg-white rounded-2xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className={`font-semibold text-base ${
                                isPositive
                                  ? 'text-green-600'
                                  : isNegative
                                  ? 'text-red-600'
                                  : 'text-foreground'
                              }`}>
                                {entry.points_assigned > 0 ? '+' : ''}{entry.points_assigned} puntos
                              </p>
                              {entry.challenge_id && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  Reto completado
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {new Date(entry.created_at).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>

                          {entry.notes && (
                            <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                  <Trophy className="w-10 h-10 text-primary/40" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Sin historial
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  Este cliente aún no tiene puntos asignados
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

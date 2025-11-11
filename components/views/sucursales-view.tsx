"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { FormInput } from "@/components/ui/form-input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Plus, Phone, MapPin, Users, Home, MoreVertical, QrCode, Ban, Trash2, Download, Printer, Building2, Edit2 } from "lucide-react"
import { useState, useMemo, useEffect, useRef } from "react"
import { sucursalesData, Sucursal } from "@/lib/sucursales-data"
import { useNavigation } from "@/contexts/navigation-context"
import QRCodeLib from "qrcode"
import { getBusinesses, createBusiness, updateBusiness, deleteBusiness, type Business } from "@/lib/supabase/businesses"
import { getBusinessSettings } from "@/lib/supabase/business-settings"
import { toast } from "sonner"

export function SucursalesView() {
  const { setView } = useNavigation()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [nombreSucursal, setNombreSucursal] = useState("")
  const [direccion, setDireccion] = useState("")
  const [qrCodeContent, setQrCodeContent] = useState("")
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<Business | null>(null)
  const [sucursalToDelete, setSucursalToDelete] = useState<Business | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const itemsPerPage = 10

  // Database states
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false)
  const [isSavingBusiness, setIsSavingBusiness] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [businessName, setBusinessName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Load businesses and business settings on mount
  useEffect(() => {
    loadBusinesses()
    loadBusinessInfo()
  }, [])

  const loadBusinessInfo = async () => {
    try {
      const settings = await getBusinessSettings()
      if (settings) {
        setBusinessName(settings.name || "")
        const fullPhone = settings.phone_code && settings.phone_number
          ? `${settings.phone_code}${settings.phone_number}`
          : ""
        setPhoneNumber(fullPhone)
      }
    } catch (error) {
      console.error('Error loading business settings:', error)
    }
  }

  // Load business data when editing
  useEffect(() => {
    if (editingBusiness) {
      setNombreSucursal(editingBusiness.name || "")
      setDireccion(editingBusiness.address || "")
      setQrCodeContent(editingBusiness.qr_code || "")
      setIsSheetOpen(true)
    }
  }, [editingBusiness])

  // Generate QR message when creating new branch (not editing)
  useEffect(() => {
    if (!editingBusiness && nombreSucursal && businessName) {
      const message = `Hola quiero hacer checkin en ${businessName} - ${nombreSucursal}`
      const encodedMessage = encodeURIComponent(message)

      // Usar siempre el número de Evolution API (fijo, desde variable de entorno)
      const evolutionWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '584126376341'
      setQrCodeContent(`https://wa.me/${evolutionWhatsAppNumber}?text=${encodedMessage}`)
    }
  }, [nombreSucursal, businessName, editingBusiness])

  // Function to regenerate QR code with current business name
  const regenerateQRCode = () => {
    if (nombreSucursal && businessName) {
      const message = `Hola quiero hacer checkin en ${businessName} - ${nombreSucursal}`
      const encodedMessage = encodeURIComponent(message)
      const evolutionWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '584126376341'
      setQrCodeContent(`https://wa.me/${evolutionWhatsAppNumber}?text=${encodedMessage}`)
      toast.success('Código QR actualizado con el nombre del negocio actual')
    }
  }

  const loadBusinesses = async () => {
    setIsLoadingBusinesses(true)
    try {
      const data = await getBusinesses()
      setBusinesses(data)
    } catch (error) {
      console.error('Error loading businesses:', error)
      toast.error('Error al cargar las sucursales')
    } finally {
      setIsLoadingBusinesses(false)
    }
  }

  // Generar QR Code cuando se selecciona una sucursal
  useEffect(() => {
    if (selectedSucursal && isQRModalOpen) {
      const generateQR = async () => {
        try {
          const qrData = selectedSucursal.qr_code || `Sucursal: ${selectedSucursal.name}`
          const url = await QRCodeLib.toDataURL(qrData, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          setQrCodeUrl(url)
        } catch (err) {
          console.error('Error generating QR code:', err)
        }
      }
      generateQR()
    }
  }, [selectedSucursal, isQRModalOpen])

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `QR-${selectedSucursal?.name || 'sucursal'}.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  const handlePrintQR = () => {
    if (qrCodeUrl) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Imprimir QR - ${selectedSucursal?.name}</title>
              <style>
                @media print {
                  @page {
                    margin: 0;
                    size: A4 portrait;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                  }
                }
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  padding: 20px;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  box-sizing: border-box;
                }
                .container {
                  background: white;
                  border-radius: 30px;
                  border: 2px solid #8b5cf6;
                  padding: 30px;
                  text-align: center;
                  max-width: 650px;
                  width: 100%;
                  box-sizing: border-box;
                }
                h1 {
                  font-size: 36px;
                  margin: 0 0 5px 0;
                  color: #1a1a1a;
                  font-weight: 700;
                  letter-spacing: -0.5px;
                }
                .address {
                  font-size: 15px;
                  color: #666;
                  margin: 0 0 20px 0;
                  font-weight: 500;
                }
                .qr-container {
                  background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%);
                  padding: 20px;
                  border-radius: 20px;
                  border: 2px solid #8b5cf6;
                  display: inline-block;
                  margin-bottom: 20px;
                  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
                }
                img {
                  width: 280px;
                  height: 280px;
                  display: block;
                  border-radius: 10px;
                }
                .instructions {
                  background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%);
                  padding: 20px;
                  border-radius: 20px;
                  margin-top: 15px;
                  border: 1px solid #e9d5ff;
                }
                .instructions h2 {
                  font-size: 20px;
                  margin: 0 0 15px 0;
                  color: #8b5cf6;
                  font-weight: 700;
                  text-align: center;
                }
                .steps {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 12px;
                  margin: 0;
                  padding: 0;
                  list-style: none;
                }
                .step {
                  background: white;
                  padding: 12px;
                  border-radius: 12px;
                  border: 1px solid #e9d5ff;
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                .step-number {
                  background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
                  color: white;
                  width: 28px;
                  height: 28px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-weight: 700;
                  font-size: 14px;
                  flex-shrink: 0;
                }
                .step-text {
                  font-size: 13px;
                  color: #1a1a1a;
                  line-height: 1.4;
                  text-align: left;
                }
                .footer {
                  margin-top: 15px;
                  font-size: 14px;
                  color: #8b5cf6;
                  font-weight: 600;
                }
                .footer p {
                  margin: 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>${businessName || 'Mi Negocio'}</h1>
                <p class="address">📍 ${selectedSucursal?.name}${selectedSucursal?.address ? ` - ${selectedSucursal.address}` : ''}</p>

                <div class="qr-container">
                  <img src="${qrCodeUrl}" alt="QR Code" />
                </div>

                <div class="instructions">
                  <h2>¿Cómo hacer check-in?</h2>
                  <div class="steps">
                    <div class="step">
                      <div class="step-number">1</div>
                      <div class="step-text">Escanea el QR con tu cámara</div>
                    </div>
                    <div class="step">
                      <div class="step-number">2</div>
                      <div class="step-text">Se abrirá WhatsApp</div>
                    </div>
                    <div class="step">
                      <div class="step-number">3</div>
                      <div class="step-text">Presiona "Enviar"</div>
                    </div>
                    <div class="step">
                      <div class="step-number">4</div>
                      <div class="step-text">¡Recibe tus puntos!</div>
                    </div>
                  </div>
                </div>

                <div class="footer">
                  <p>Gana puntos y obtén recompensas</p>
                </div>
              </div>
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.onafterprint = () => window.close();
                  }, 500);
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  const handleDeleteSucursal = async () => {
    if (!sucursalToDelete?.id) return

    try {
      await deleteBusiness(sucursalToDelete.id)
      toast.success('Sucursal eliminada exitosamente')
      await loadBusinesses() // Reload the list
      setIsDeleteModalOpen(false)
      setSucursalToDelete(null)
    } catch (error) {
      console.error('Error deleting business:', error)
      toast.error('Error al eliminar la sucursal')
    }
  }

  // Filtrar sucursales basado en el término de búsqueda
  const filteredSucursales = useMemo(() => {
    if (!searchTerm) return businesses

    return businesses.filter((business) =>
      business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.address?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, businesses])

  // Función para obtener el color del badge según el estado
  const getEstadoBadgeVariant = (estado: string) => {
    if (estado === "activa") return "default"
    return "secondary"
  }

  // Calcular paginación
  const totalPages = Math.ceil(filteredSucursales.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentSucursales = filteredSucursales.slice(startIndex, endIndex)

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
              <BreadcrumbPage>Sucursales</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Sucursales
        </h1>
        <p className="text-muted-foreground text-sm">
          Gestiona las sucursales de tu negocio
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
              placeholder="Buscar sucursales..."
              className="pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Button */}
          <PrimaryButton
            className="w-full sm:w-auto"
            onClick={() => setIsSheetOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Nueva Sucursal
          </PrimaryButton>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4 lg:px-6">
        {isLoadingBusinesses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="p-6 shadow-none relative"
                style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}
              >
                {/* More Icon Skeleton */}
                <div className="absolute top-4 right-4">
                  <Skeleton className="w-5 h-5 rounded-full" />
                </div>

                {/* Content Skeleton */}
                <div className="pr-8">
                  <div className="flex items-start gap-3">
                    {/* Icon Skeleton */}
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

                    {/* Text Content Skeleton */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <div className="flex items-start gap-1">
                        <Skeleton className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : currentSucursales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSucursales.map((business) => (
              <Card key={business.id} className="p-6 shadow-none relative" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
                {/* Icono de 3 puntos con menú */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="absolute top-4 right-4 p-1 hover:bg-primary/10 rounded-full transition-colors [&:hover>svg]:text-primary cursor-pointer">
                      <MoreVertical className="w-5 h-5 text-muted-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="shadow-sm" style={{ borderRadius: '12px', borderColor: '#eeeeee' }}>
                    <DropdownMenuItem
                      className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                      style={{ borderRadius: '8px' }}
                      onClick={() => {
                        setSelectedSucursal(business)
                        setIsQRModalOpen(true)
                      }}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Ver QR
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                      style={{ borderRadius: '8px' }}
                      onClick={() => {
                        setEditingBusiness(business)
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      style={{ borderRadius: '8px' }}
                      onClick={() => {
                        setSucursalToDelete(business as any)
                        setIsDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Contenido */}
                <div className="pr-8">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base text-foreground mb-1">
                        {business.name || 'Sin nombre'}
                      </h3>
                      {business.address && (
                        <div className="flex items-start gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{business.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <Building2 className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No se encontraron sucursales" : "Aún no tienes sucursales"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
              {searchTerm
                ? "Intenta ajustar tus criterios de búsqueda"
                : "Crea tu primera sucursal para empezar a gestionar tu negocio"
              }
            </p>
            {!searchTerm && (
              <PrimaryButton onClick={() => setIsSheetOpen(true)}>
                <Plus className="mr-2 h-5 w-5" />
                Crear primera sucursal
              </PrimaryButton>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 lg:px-6 mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredSucursales.length)} de {filteredSucursales.length} sucursales
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

      {/* Sheet para Nueva/Editar Sucursal */}
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open)
        if (!open) {
          // Reset form when closing
          setNombreSucursal("")
          setDireccion("")
          setQrCodeContent("")
          setEditingBusiness(null)
        }
      }}>
        <SheetContent side="right" className="m-4 h-[calc(100vh-2rem)] p-6 [&>button]:bg-white [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border [&>button]:shadow-sm [&>button]:cursor-pointer" style={{ borderRadius: '30px', borderColor: '#eeeeee' }}>
          <SheetHeader className="pr-16">
            <SheetTitle className="text-2xl">
              {editingBusiness ? 'Editar Sucursal' : 'Nueva Sucursal'}
            </SheetTitle>
            <SheetDescription>
              {editingBusiness ? 'Modifica los datos de la sucursal' : 'Completa los datos para crear una nueva sucursal'}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre">Nombre de sucursal</Label>
              <FormInput
                id="nombre"
                value={nombreSucursal}
                onChange={(e) => setNombreSucursal(e.target.value)}
                placeholder="Ej: Sucursal Centro"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="direccion">Dirección (opcional)</Label>
              <FormInput
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Av. Principal, Local 123"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="qrcode">Contenido del código QR</Label>
                {editingBusiness && (
                  <SecondaryButton
                    onClick={regenerateQRCode}
                    className="text-xs h-7 px-3"
                  >
                    🔄 Regenerar QR
                  </SecondaryButton>
                )}
              </div>
              <FormInput
                id="qrcode"
                value={qrCodeContent}
                onChange={(e) => setQrCodeContent(e.target.value)}
                placeholder="Se generará automáticamente al ingresar el nombre"
              />
              <p className="text-xs text-muted-foreground">
                {editingBusiness
                  ? `Enlace actual: "${businessName} - ${nombreSucursal}". Click en "Regenerar QR" si cambiaste el nombre del negocio.`
                  : "Se genera automáticamente un enlace de WhatsApp con el mensaje de check-in. Puedes editarlo si lo deseas."
                }
              </p>
            </div>
          </div>

          <SheetFooter>
            <SecondaryButton onClick={() => setIsSheetOpen(false)} disabled={isSavingBusiness}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={async () => {
                if (!nombreSucursal.trim()) {
                  toast.error('El nombre de la sucursal es requerido')
                  return
                }

                setIsSavingBusiness(true)
                try {
                  if (editingBusiness) {
                    // Update existing business
                    await updateBusiness(editingBusiness.id!, {
                      name: nombreSucursal,
                      address: direccion || null,
                      qr_code: qrCodeContent || null,
                    })
                    toast.success('Sucursal actualizada exitosamente')
                  } else {
                    // Create new business
                    await createBusiness({
                      name: nombreSucursal,
                      address: direccion || null,
                      qr_code: qrCodeContent || null,
                    })
                    toast.success('Sucursal creada exitosamente')
                  }
                  await loadBusinesses() // Reload the list
                  setIsSheetOpen(false)
                  setNombreSucursal("")
                  setDireccion("")
                  setQrCodeContent("")
                  setEditingBusiness(null)
                } catch (error) {
                  console.error('Error saving business:', error)
                  toast.error(editingBusiness ? 'Error al actualizar la sucursal' : 'Error al crear la sucursal')
                } finally {
                  setIsSavingBusiness(false)
                }
              }}
              disabled={isSavingBusiness}
            >
              {isSavingBusiness
                ? (editingBusiness ? 'Actualizando...' : 'Creando...')
                : (editingBusiness ? 'Actualizar Sucursal' : 'Crear Sucursal')
              }
            </PrimaryButton>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal QR Code */}
      <Dialog open={isQRModalOpen} onOpenChange={setIsQRModalOpen}>
        <DialogContent
          className="max-w-md"
          showHelpButton={true}
          onHelpClick={() => setIsHelpModalOpen(true)}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedSucursal?.name}</DialogTitle>
            <DialogDescription>
              Código QR para check-in por WhatsApp
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl && (
              <>
                <div className="p-6 bg-white border rounded-3xl" style={{ borderColor: '#eeeeee' }}>
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-[300px] h-[300px]"
                  />
                </div>

                {/* Mensaje de WhatsApp que se enviará */}
                {selectedSucursal?.qr_code && (
                  <div className="w-full p-3 bg-green-50 border border-green-200 rounded-2xl text-xs">
                    <p className="text-gray-600 mb-1">Mensaje pre-rellenado:</p>
                    <p className="font-mono text-green-800">
                      {decodeURIComponent(selectedSucursal.qr_code.split('text=')[1] || 'Check-in')}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter className="gap-2">
            <SecondaryButton
              onClick={handleDownloadQR}
              className="flex-1"
            >
              <Download className="mr-2 h-5 w-5" />
              Descargar PNG
            </SecondaryButton>
            <SecondaryButton
              onClick={handlePrintQR}
              className="flex-1"
            >
              <Printer className="mr-2 h-5 w-5" />
              Imprimir
            </SecondaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Ayuda */}
      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Instrucciones de uso</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6 py-4">
            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                📱 Instrucciones para clientes:
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Escanear el código QR con la cámara del teléfono</li>
                <li>Se abrirá WhatsApp automáticamente con un mensaje pre-escrito</li>
                <li>Presionar "Enviar" para hacer check-in</li>
                <li>Recibir confirmación instantánea con puntos ganados</li>
                <li>¡Listo! El cliente queda registrado automáticamente</li>
              </ol>
            </div>

            {/* Beneficios */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                ✨ Beneficios:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>Registro automático:</strong> No necesitan descargar ninguna app</li>
                <li><strong>Check-in instantáneo:</strong> Solo escanean y envían</li>
                <li><strong>Confirmación por WhatsApp:</strong> Reciben su balance de puntos</li>
                <li><strong>Sin fricción:</strong> Todo el proceso en menos de 10 segundos</li>
              </ul>
            </div>

            {/* Dónde colocar el QR */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                💡 Dónde colocar el código QR:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>En la entrada del local (visible desde afuera)</li>
                <li>En la caja registradora</li>
                <li>En las mesas (para restaurantes)</li>
                <li>En el mostrador de atención al cliente</li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                <strong>Tip:</strong> Imprímelo en tamaño A4 para mejor visibilidad
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <SecondaryButton
              onClick={() => setIsHelpModalOpen(false)}
              className="flex-1"
            >
              Cerrar
            </SecondaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Eliminar Sucursal</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar esta sucursal?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-2">{sucursalToDelete?.name || 'Sin nombre'}</p>
              {sucursalToDelete?.address && (
                <p className="text-xs text-muted-foreground mb-2">{sucursalToDelete.address}</p>
              )}
              <p className="text-sm text-red-600 mt-3">
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta sucursal.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <SecondaryButton
              onClick={() => {
                setIsDeleteModalOpen(false)
                setSucursalToDelete(null)
              }}
              className="flex-1"
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={handleDeleteSucursal}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Eliminar
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

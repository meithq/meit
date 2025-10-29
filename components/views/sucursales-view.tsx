"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { FormInput } from "@/components/ui/form-input"
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
import { Search, Plus, Phone, MapPin, Users, Home, MoreVertical, QrCode, Ban, Trash2, Download, Printer, Building2 } from "lucide-react"
import { useState, useMemo, useEffect, useRef } from "react"
import { sucursalesData, Sucursal } from "@/lib/sucursales-data"
import { useNavigation } from "@/contexts/navigation-context"
import QRCodeLib from "qrcode"

export function SucursalesView() {
  const { setView } = useNavigation()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [nombreSucursal, setNombreSucursal] = useState("")
  const [direccion, setDireccion] = useState("")
  const [isQRModalOpen, setIsQRModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSucursal, setSelectedSucursal] = useState<Sucursal | null>(null)
  const [sucursalToDelete, setSucursalToDelete] = useState<Sucursal | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const itemsPerPage = 10

  // Generar QR Code cuando se selecciona una sucursal
  useEffect(() => {
    if (selectedSucursal && isQRModalOpen) {
      const generateQR = async () => {
        try {
          const qrData = `${selectedSucursal.nombre} - ${selectedSucursal.codigo}`
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
      link.download = `QR-${selectedSucursal?.codigo}.png`
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
              <title>Imprimir QR - ${selectedSucursal?.nombre}</title>
              <style>
                body {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  min-height: 100vh;
                  margin: 0;
                  font-family: sans-serif;
                }
                h1 { margin-bottom: 20px; }
                img { border: 1px solid #ddd; padding: 20px; }
              </style>
            </head>
            <body>
              <h1>${selectedSucursal?.nombre}</h1>
              <p>${selectedSucursal?.codigo}</p>
              <img src="${qrCodeUrl}" alt="QR Code" />
              <script>
                window.onload = () => {
                  window.print();
                  window.onafterprint = () => window.close();
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  const handleDeleteSucursal = () => {
    // Aquí iría la lógica para eliminar la sucursal
    console.log('Eliminar sucursal:', sucursalToDelete)
    setIsDeleteModalOpen(false)
    setSucursalToDelete(null)
  }

  // Filtrar sucursales basado en el término de búsqueda
  const filteredSucursales = useMemo(() => {
    if (!searchTerm) return sucursalesData

    return sucursalesData.filter((sucursal) =>
      sucursal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sucursal.telefono.includes(searchTerm)
    )
  }, [searchTerm])

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
        {currentSucursales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentSucursales.map((sucursal) => (
              <Card key={sucursal.id} className="p-4 shadow-none relative h-40" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
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
                        setSelectedSucursal(sucursal)
                        setIsQRModalOpen(true)
                      }}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      Ver QR
                    </DropdownMenuItem>
                    <DropdownMenuItem className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer" style={{ borderRadius: '8px' }}>
                      <Ban className="mr-2 h-4 w-4" />
                      Inactivar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      className="cursor-pointer"
                      style={{ borderRadius: '8px' }}
                      onClick={() => {
                        setSucursalToDelete(sucursal)
                        setIsDeleteModalOpen(true)
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Badge de estado en esquina inferior derecha */}
                <div className="absolute bottom-4 right-4">
                  <Badge variant={getEstadoBadgeVariant(sucursal.estado)}>
                    {sucursal.estado === "activa" ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                {/* Nombre */}
                <div className="pr-8">
                  <h3 className="font-semibold text-base text-foreground mb-2">
                    {sucursal.nombre}
                  </h3>
                  <span className="inline-block text-xs px-2 py-1 rounded bg-muted text-muted-foreground font-mono">
                    {sucursal.codigo}
                  </span>
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

      {/* Sheet para Nueva Sucursal */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="m-4 h-[calc(100vh-2rem)] p-6 [&>button]:bg-white [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border [&>button]:shadow-sm [&>button]:cursor-pointer" style={{ borderRadius: '30px', borderColor: '#eeeeee' }}>
          <SheetHeader className="pr-16">
            <SheetTitle className="text-2xl">Nueva Sucursal</SheetTitle>
            <SheetDescription>
              Completa los datos para crear una nueva sucursal
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
          </div>

          <SheetFooter>
            <SecondaryButton onClick={() => setIsSheetOpen(false)}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={() => {
                // Aquí iría la lógica para guardar la sucursal
                console.log({ nombreSucursal, direccion })
                setIsSheetOpen(false)
                setNombreSucursal("")
                setDireccion("")
              }}
            >
              Crear Sucursal
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
            <DialogTitle className="text-2xl">{selectedSucursal?.nombre}</DialogTitle>
            <DialogDescription>
              Código QR para {selectedSucursal?.codigo}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl && (
              <div className="p-6 bg-white border rounded-3xl" style={{ borderColor: '#eeeeee' }}>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-[300px] h-[300px]"
                />
              </div>
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
                <li>Se abrirá WhatsApp con un mensaje pre-escrito</li>
                <li>Enviar el mensaje para registrarse</li>
                <li>Recibir confirmación y empezar a acumular puntos</li>
              </ol>
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
              <p className="text-sm font-semibold mb-2">{sucursalToDelete?.nombre}</p>
              <p className="text-xs text-muted-foreground">{sucursalToDelete?.codigo}</p>
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

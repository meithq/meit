"use client"

import { Card } from "@/components/ui/card"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { PrimaryButton } from "@/components/ui/primary-button"
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
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Home, Settings, Gift, TrendingUp, DollarSign, Percent, CheckCircle, Calendar, User, CreditCard, X } from "lucide-react"
import { useState } from "react"
import { useNavigation } from "@/contexts/navigation-context"

interface GiftCard {
  id: string
  codigo: string
  cliente: string
  telefono: string
  valor: number
  fechaEmision: string
  vencimiento: string
  estado: "activa" | "redimida" | "vencida"
}

const giftCardEjemplo: GiftCard = {
  id: "1",
  codigo: "GC-2024-8754",
  cliente: "María García",
  telefono: "+1 234 567 8901",
  valor: 500,
  fechaEmision: "2024-01-15",
  vencimiento: "2024-12-31",
  estado: "activa"
}

const giftCardsData: GiftCard[] = [
  {
    id: "1",
    codigo: "GC-2024-8754",
    cliente: "María García",
    telefono: "+1 234 567 8901",
    valor: 500,
    fechaEmision: "2024-01-15",
    vencimiento: "2024-12-31",
    estado: "activa"
  },
  {
    id: "2",
    codigo: "GC-2024-8755",
    cliente: "Juan Pérez",
    telefono: "+1 234 567 8900",
    valor: 300,
    fechaEmision: "2024-02-10",
    vencimiento: "2025-02-10",
    estado: "activa"
  },
  {
    id: "3",
    codigo: "GC-2024-8756",
    cliente: "Carlos López",
    telefono: "+1 234 567 8902",
    valor: 250,
    fechaEmision: "2024-01-20",
    vencimiento: "2024-07-20",
    estado: "redimida"
  },
  {
    id: "4",
    codigo: "GC-2024-8757",
    cliente: "Ana Martínez",
    telefono: "+1 234 567 8903",
    valor: 400,
    fechaEmision: "2023-12-01",
    vencimiento: "2024-06-01",
    estado: "vencida"
  },
  {
    id: "5",
    codigo: "GC-2024-8758",
    cliente: "Pedro Rodríguez",
    telefono: "+1 234 567 8904",
    valor: 200,
    fechaEmision: "2024-03-05",
    vencimiento: "2025-03-05",
    estado: "activa"
  },
  {
    id: "6",
    codigo: "GC-2024-8759",
    cliente: "Laura Sánchez",
    telefono: "+1 234 567 8905",
    valor: 350,
    fechaEmision: "2024-02-15",
    vencimiento: "2024-08-15",
    estado: "redimida"
  },
  {
    id: "7",
    codigo: "GC-2024-8760",
    cliente: "Diego Torres",
    telefono: "+1 234 567 8906",
    valor: 150,
    fechaEmision: "2023-11-10",
    vencimiento: "2024-05-10",
    estado: "vencida"
  }
]

export function GiftCardsView() {
  const { setView } = useNavigation()
  const [codigoGiftCard, setCodigoGiftCard] = useState("")
  const [giftCardValidada, setGiftCardValidada] = useState<GiftCard | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showConfigSheet, setShowConfigSheet] = useState(false)
  const [activeTab, setActiveTab] = useState("activas")

  // Estados de configuración
  const [puntosRequeridos, setPuntosRequeridos] = useState(100)
  const [valorGiftCard, setValorGiftCard] = useState(5)
  const [diasVencimiento, setDiasVencimiento] = useState(30)
  const [maxGiftCards, setMaxGiftCards] = useState(5)

  // Contar gift cards por estado
  const countActivas = giftCardsData.filter(gc => gc.estado === "activa").length
  const countRedimidas = giftCardsData.filter(gc => gc.estado === "redimida").length
  const countVencidas = giftCardsData.filter(gc => gc.estado === "vencida").length

  // Filtrar gift cards por estado
  const filteredGiftCards = giftCardsData.filter((gc) => {
    if (activeTab === "activas") return gc.estado === "activa"
    if (activeTab === "redimidas") return gc.estado === "redimida"
    if (activeTab === "vencidas") return gc.estado === "vencida"
    return true
  })

  const handleValidarGiftCard = () => {
    if (codigoGiftCard.trim()) {
      // Aquí iría la lógica de validación con el backend
      // Por ahora usamos datos de ejemplo
      setGiftCardValidada(giftCardEjemplo)
      setShowModal(true)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleValidarGiftCard()
    }
  }

  const handleCancelar = () => {
    setShowModal(false)
    setGiftCardValidada(null)
    setCodigoGiftCard("")
  }

  const handleRedimir = () => {
    if (giftCardValidada) {
      console.log("Redimiendo gift card:", giftCardValidada.codigo)
      // Aquí iría la lógica de redención
      setShowModal(false)
      setGiftCardValidada(null)
      setCodigoGiftCard("")
    }
  }

  const handleRestaurarPredeterminados = () => {
    setPuntosRequeridos(100)
    setValorGiftCard(5)
    setDiasVencimiento(30)
    setMaxGiftCards(5)
  }

  const handleGuardarCambios = () => {
    console.log("Guardando configuración:", {
      puntosRequeridos,
      valorGiftCard,
      diasVencimiento,
      maxGiftCards
    })
    // Aquí iría la lógica para guardar la configuración
    setShowConfigSheet(false)
  }

  const metricas = [
    {
      titulo: "Activas",
      valor: "248",
      icon: Gift,
      descripcion: "Gift cards activas",
      tendencia: "+12%",
      positiva: true,
    },
    {
      titulo: "Redimidas este mes",
      valor: "87",
      icon: TrendingUp,
      descripcion: "Canjes en el mes",
      tendencia: "+8%",
      positiva: true,
    },
    {
      titulo: "Valor en circulación",
      valor: "$45,230",
      icon: DollarSign,
      descripcion: "Total disponible",
      tendencia: "+15%",
      positiva: true,
    },
    {
      titulo: "Tasa de Redención",
      valor: "68%",
      icon: Percent,
      descripcion: "Últimos 30 días",
      tendencia: "+5%",
      positiva: true,
    },
  ]

  return (
    <div className="flex flex-col gap-4 pt-4 md:pt-6 md:gap-6 max-w-[1400px] mx-auto w-full pb-[100px]">
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
              <BreadcrumbPage>Gift Cards</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section */}
      <div className="px-4 lg:px-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gift Cards</h1>
          <p className="text-muted-foreground text-sm">
            Administra tarjetas de regalo
          </p>
        </div>
        <PrimaryButton onClick={() => setShowConfigSheet(true)}>
          <Settings className="mr-2 h-5 w-5" />
          Configuración
        </PrimaryButton>
      </div>

      {/* Métricas Grid */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricas.map((metrica, index) => {
            const Icon = metrica.icon
            return (
              <Card
                key={index}
                className="p-6 shadow-none"
                style={{ borderRadius: "30px", border: "1px solid #eeeeee" }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">
                      {metrica.titulo}
                    </p>
                    <h3 className="text-3xl font-bold text-foreground mb-2">
                      {metrica.valor}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {metrica.descripcion}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`text-xs font-medium ${
                      metrica.positiva ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {metrica.tendencia}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    vs mes anterior
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Validar Gift Card */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            className="p-6 shadow-none"
            style={{ borderRadius: "30px", border: "1px solid #eeeeee" }}
          >
            <h2 className="text-xl font-semibold mb-2">Validar Gift Card</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Escanea el código QR de la gift card o ingresa el código manualmente. Presiona Enter para validar.
            </p>
            <div className="flex gap-3">
              <FormInput
                type="text"
                placeholder="Ingresa el código de la gift card..."
                value={codigoGiftCard}
                onChange={(e) => setCodigoGiftCard(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <PrimaryButton onClick={handleValidarGiftCard}>
                <CheckCircle className="mr-2 h-5 w-5" />
                Validar
              </PrimaryButton>
            </div>
          </Card>
        </div>
      </div>

      {/* Listado de Gift Cards con Tabs */}
      <div className="px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full min-h-[56px] grid grid-cols-3" style={{ borderRadius: '50px' }}>
            <TabsTrigger
              value="activas"
              className="text-base min-h-[56px] data-[state=active]:bg-white data-[state=active]:text-primary cursor-pointer"
              style={{ borderRadius: '50px' }}
            >
              Activas ({countActivas})
            </TabsTrigger>
            <TabsTrigger
              value="redimidas"
              className="text-base min-h-[56px] data-[state=active]:bg-white data-[state=active]:text-primary cursor-pointer"
              style={{ borderRadius: '50px' }}
            >
              Redimidas ({countRedimidas})
            </TabsTrigger>
            <TabsTrigger
              value="vencidas"
              className="text-base min-h-[56px] data-[state=active]:bg-white data-[state=active]:text-primary cursor-pointer"
              style={{ borderRadius: '50px' }}
            >
              Vencidas ({countVencidas})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredGiftCards.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredGiftCards.map((giftcard) => (
                  <Card
                    key={giftcard.id}
                    className="p-4 shadow-none"
                    style={{ borderRadius: "30px", border: "1px solid #eeeeee" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Información principal */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Código y Cliente */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Código</p>
                          <p className="font-semibold font-mono text-sm">{giftcard.codigo}</p>
                          <p className="text-sm text-muted-foreground mt-2">{giftcard.cliente}</p>
                        </div>

                        {/* Valor */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Valor</p>
                          <p className="text-2xl font-bold text-primary">${giftcard.valor}</p>
                        </div>

                        {/* Fecha de emisión */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Emisión</p>
                          <p className="text-sm font-medium">
                            {new Date(giftcard.fechaEmision).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Vencimiento */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Vencimiento</p>
                          <p className="text-sm font-medium">
                            {new Date(giftcard.vencimiento).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Badge de estado */}
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          giftcard.estado === "activa"
                            ? "bg-green-100 text-green-700"
                            : giftcard.estado === "redimida"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {giftcard.estado === "activa" ? "Activa" : giftcard.estado === "redimida" ? "Redimida" : "Vencida"}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card
                className="p-12 shadow-none"
                style={{ borderRadius: "30px", border: "1px solid #eeeeee" }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Gift className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No hay gift cards {activeTab} en este momento
                  </p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Sheet de Configuración */}
      <Sheet open={showConfigSheet} onOpenChange={setShowConfigSheet}>
        <SheetContent side="right" className="m-4 h-[calc(100vh-2rem)] p-6 [&>button]:bg-white [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border [&>button]:shadow-sm [&>button]:cursor-pointer" style={{ borderRadius: '30px', borderColor: '#eeeeee' }}>
          <SheetHeader className="pr-16">
            <SheetTitle className="text-2xl">
              Configuración de Gift Cards
            </SheetTitle>
            <SheetDescription>
              Personaliza los parámetros de generación y vencimiento de gift cards
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 py-4">
            {/* Puntos requeridos */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Puntos requeridos para generar gift card</Label>
                <span className="text-lg font-bold text-primary">{puntosRequeridos}</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={puntosRequeridos}
                onChange={(e) => setPuntosRequeridos(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-xs text-muted-foreground">Rango: 50 - 500 puntos</p>
            </div>

            {/* Valor de gift card */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="valor">Valor de gift card (USD)</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <FormInput
                  id="valor"
                  type="number"
                  min="2"
                  max="25"
                  value={valorGiftCard}
                  onChange={(e) => setValorGiftCard(Number(e.target.value))}
                  className="pl-8"
                />
              </div>
              <p className="text-xs text-muted-foreground">Rango: $2 - $25 USD</p>
            </div>

            {/* Días de vencimiento */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Días de vencimiento</Label>
                <span className="text-lg font-bold text-primary">{diasVencimiento}</span>
              </div>
              <input
                type="range"
                min="7"
                max="90"
                step="1"
                value={diasVencimiento}
                onChange={(e) => setDiasVencimiento(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-xs text-muted-foreground">Rango: 7 - 90 días</p>
            </div>

            {/* Máximo de gift cards */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Máximo de gift cards activas por cliente</Label>
                <span className="text-lg font-bold text-primary">{maxGiftCards}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={maxGiftCards}
                onChange={(e) => setMaxGiftCards(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-xs text-muted-foreground">Rango: 1 - 10 gift cards</p>
            </div>

            {/* Nota informativa */}
            <div className="p-4 rounded-[20px] bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Nota:</span> Los cambios se aplicarán a las nuevas gift cards generadas. Las gift cards existentes mantendrán su configuración original.
              </p>
            </div>
          </div>

          <SheetFooter>
            <SecondaryButton onClick={handleRestaurarPredeterminados}>
              Restaurar predeterminados
            </SecondaryButton>
            <PrimaryButton onClick={handleGuardarCambios}>
              Guardar cambios
            </PrimaryButton>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal de Gift Card Validada */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="sr-only">Gift Card Validada</DialogTitle>
          {giftCardValidada && (
            <div>
              {/* Tarjeta Gift Card Visual */}
              <div
                className="relative p-8 mb-6 rounded-[24px] overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6D28D9 100%)",
                  minHeight: "280px",
                }}
              >
                {/* Decoración de fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-8 h-8 text-white" />
                        <span className="text-white font-bold text-xl">Gift Card</span>
                      </div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          giftCardValidada.estado === "activa"
                            ? "bg-green-500 text-white"
                            : giftCardValidada.estado === "redimida"
                            ? "bg-blue-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {giftCardValidada.estado === "activa" ? "Activa" : giftCardValidada.estado === "redimida" ? "Redimida" : "Vencida"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-sm mb-1">Valor</p>
                      <p className="text-white font-bold text-5xl">${giftCardValidada.valor}</p>
                    </div>
                  </div>

                  {/* Código */}
                  <div className="mb-8">
                    <p className="text-white/80 text-xs mb-2">Código de tarjeta</p>
                    <p className="text-white font-mono text-2xl font-bold tracking-wider">
                      {giftCardValidada.codigo}
                    </p>
                  </div>

                  {/* Footer de la tarjeta */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/80 text-xs mb-1">Titular</p>
                      <p className="text-white font-semibold text-lg">{giftCardValidada.cliente}</p>
                      <p className="text-white/70 text-sm">{giftCardValidada.telefono}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-xs mb-1">Válida hasta</p>
                      <p className="text-white font-semibold">
                        {new Date(giftCardValidada.vencimiento).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <SecondaryButton className="flex-1" onClick={handleCancelar}>
                  <X className="mr-2 h-5 w-5" />
                  Cancelar
                </SecondaryButton>
                <PrimaryButton
                  className="flex-1"
                  onClick={handleRedimir}
                  disabled={giftCardValidada.estado !== "activa"}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Redimir Gift Card
                </PrimaryButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

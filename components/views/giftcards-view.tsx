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
import { Home, Settings, Gift, TrendingUp, DollarSign, Percent, CheckCircle, Calendar, User, CreditCard, X, ScanLine } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { QRScanner } from "@/components/ui/qr-scanner"
import { useNavigation } from "@/contexts/navigation-context"
import { getGiftCardSettings, upsertGiftCardSettings } from "@/lib/supabase/gift-card-settings"
import { getGiftCardByCode, getGiftCardsByBusiness, redeemGiftCardComplete } from "@/lib/supabase/gift-cards"
import { getCustomerById } from "@/lib/supabase/customers"
import { getBusinessSettings } from "@/lib/supabase/business-settings"
import { validateAdminPin } from "@/lib/supabase/points-audit"
import { getCurrentUser } from "@/lib/supabase/auth"
import type { GiftCard as GiftCardDB, GiftCardWithCustomer } from "@/lib/types/gift-cards"
import { toast } from "sonner"

interface GiftCard {
  id: string
  codigo: string
  cliente: string
  telefono: string
  valor: number
  fechaEmision: string
  vencimiento: string
  estado: "activa" | "redimida" | "vencida"
  customer_id: string
  business_settings_id: number
}

export function GiftCardsView() {
  const { setView } = useNavigation()
  const [codigoGiftCard, setCodigoGiftCard] = useState("")
  const [giftCardValidada, setGiftCardValidada] = useState<GiftCard | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showConfigSheet, setShowConfigSheet] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [activeTab, setActiveTab] = useState("activas")
  const [activeMode, setActiveMode] = useState<"redimir" | "gestion">("redimir")
  const [pin, setPin] = useState(["", "", "", ""])
  const [isValidating, setIsValidating] = useState(false)
  const [giftCardNotFound, setGiftCardNotFound] = useState(false)
  const [giftCardsData, setGiftCardsData] = useState<GiftCard[]>([])
  const [isLoadingGiftCards, setIsLoadingGiftCards] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const pinInputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Auto-focus en el primer input del PIN cuando se abre el modal
    if (showPinModal && pinInputsRef.current[0]) {
      pinInputsRef.current[0].focus()
    }
  }, [showPinModal])

  // Cargar gift cards cuando se cambia a modo gestión
  useEffect(() => {
    if (activeMode === "gestion") {
      loadGiftCards()
    }
  }, [activeMode])

  const loadGiftCards = async () => {
    setIsLoadingGiftCards(true)
    try {
      // Obtener business settings para obtener el business_settings_id
      const businessSettings = await getBusinessSettings()

      if (!businessSettings?.id) {
        console.error("No business settings found")
        return
      }

      // Obtener todas las gift cards del negocio
      const giftCardsDB = await getGiftCardsByBusiness(businessSettings.id)

      // Mapear a la interfaz local
      const giftCardsMapped: GiftCard[] = giftCardsDB.map((gc: GiftCardWithCustomer) => {
        // Determinar el estado considerando la fecha de vencimiento
        let estado: "activa" | "redimida" | "vencida" = "activa"

        if (gc.status === 'redeemed') {
          estado = 'redimida'
        } else if (gc.status === 'expired' || new Date(gc.expires_at) < new Date()) {
          estado = 'vencida'
        } else if (gc.status === 'active') {
          estado = 'activa'
        }

        return {
          id: gc.id,
          codigo: gc.code,
          cliente: gc.customer_name || 'N/A',
          telefono: gc.customer_phone || 'N/A',
          valor: gc.value,
          fechaEmision: gc.created_at,
          vencimiento: gc.expires_at,
          estado: estado,
          customer_id: gc.customer_id,
          business_settings_id: gc.business_settings_id
        }
      })

      setGiftCardsData(giftCardsMapped)
    } catch (error) {
      console.error("Error loading gift cards:", error)
      toast.error("Error al cargar las gift cards")
    } finally {
      setIsLoadingGiftCards(false)
    }
  }

  const handlePinChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newPin = [...pin]
      newPin[index] = value
      setPin(newPin)

      // Auto-avanzar al siguiente input
      if (value && index < 3) {
        pinInputsRef.current[index + 1]?.focus()
      }
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinInputsRef.current[index - 1]?.focus()
    }
  }

  const handleCancelarPin = () => {
    setShowPinModal(false)
    setPin(["", "", "", ""])
    setPinError(null)
  }

  const handleConfirmarRedencion = async () => {
    const pinCompleto = pin.join("")

    if (pinCompleto.length !== 4) {
      setPinError("PIN incompleto")
      return
    }

    if (!giftCardValidada) {
      toast.error("No hay gift card seleccionada")
      return
    }

    setIsRedeeming(true)
    setPinError(null)

    try {
      // 1. Validar el PIN del admin
      const admin = await validateAdminPin(pinCompleto)

      if (!admin) {
        setPinError("PIN incorrecto")
        setIsRedeeming(false)
        return
      }

      // 2. Obtener el usuario actual (operador)
      const currentUser = await getCurrentUser()

      if (!currentUser) {
        toast.error("No se pudo obtener el usuario actual")
        setIsRedeeming(false)
        return
      }

      // 3. Obtener business settings
      const businessSettings = await getBusinessSettings()

      if (!businessSettings?.id) {
        toast.error("No se pudo obtener la configuración del negocio")
        setIsRedeeming(false)
        return
      }

      // 4. Redimir la gift card
      console.log("🎁 Redimiendo gift card:", giftCardValidada.codigo)
      await redeemGiftCardComplete(
        giftCardValidada.id,
        currentUser.id,
        admin.id,
        `Gift card redimida: ${giftCardValidada.codigo} ($${giftCardValidada.valor} USD)`
      )

      // 5. Crear notificación para el cliente (opcional, no detener el proceso si falla)
      try {
        const { createNotification } = await import('@/lib/supabase/notifications')
        await createNotification({
          business_settings_id: giftCardValidada.business_settings_id,
          customer_id: giftCardValidada.customer_id,
          type: 'gift_card_redeemed',
          title: '✨ Gift Card Redimida',
          message: `Tu gift card de $${giftCardValidada.valor} USD ha sido redimida exitosamente.`,
          metadata: {
            gift_card_code: giftCardValidada.codigo,
            gift_card_value: giftCardValidada.valor,
          },
        })
      } catch (notifError) {
        console.error('⚠️ Error creating notification (non-critical):', notifError)
      }

      // 6. Mostrar éxito
      toast.success("Gift card redimida exitosamente", {
        description: `$${giftCardValidada.valor} USD - ${giftCardValidada.codigo}`,
        duration: 5000,
      })

      // 7. Recargar la lista de gift cards si está en modo gestión
      if (activeMode === "gestion") {
        await loadGiftCards()
      }

      // 8. Cerrar ambos modales y limpiar estados
      setShowPinModal(false)
      setShowModal(false)
      setGiftCardValidada(null)
      setCodigoGiftCard("")
      setPin(["", "", "", ""])
      setPinError(null)

    } catch (error) {
      console.error("❌ Error redimiendo gift card:", error)
      const errorMessage = error instanceof Error ? error.message : "Error desconocido"
      toast.error(`Error al redimir gift card: ${errorMessage}`)
      setPinError("Error al procesar la redención")
    } finally {
      setIsRedeeming(false)
    }
  }

  // Estados de configuración
  const [puntosRequeridos, setPuntosRequeridos] = useState(100)
  const [valorGiftCard, setValorGiftCard] = useState(5)
  const [diasVencimiento, setDiasVencimiento] = useState(30)
  const [maxGiftCards, setMaxGiftCards] = useState(5)
  const [isLoadingSettings, setIsLoadingSettings] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  // Load gift card settings when config sheet opens
  useEffect(() => {
    if (showConfigSheet) {
      loadGiftCardSettings()
    }
  }, [showConfigSheet])

  const loadGiftCardSettings = async () => {
    setIsLoadingSettings(true)
    try {
      const settings = await getGiftCardSettings()
      if (settings) {
        setPuntosRequeridos(settings.points_required || 100)
        setValorGiftCard(settings.card_value || 5)
        setDiasVencimiento(settings.expiration_days || 30)
        setMaxGiftCards(settings.max_active_cards || 5)
      }
    } catch (error) {
      console.error("Error loading gift card settings:", error)
      toast.error("Error al cargar la configuración")
    } finally {
      setIsLoadingSettings(false)
    }
  }

  // Contar gift cards por estado
  const countActivas = giftCardsData.filter(gc => gc.estado === "activa").length
  const countRedimidas = giftCardsData.filter(gc => gc.estado === "redimida").length
  const countVencidas = giftCardsData.filter(gc => gc.estado === "vencida").length

  // Calcular redimidas este mes
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const countRedimidasEsteMes = giftCardsData.filter(gc => {
    if (gc.estado !== "redimida") return false
    // Si hay fecha de redención, usarla; sino usar fecha de creación
    const fechaCreacion = new Date(gc.fechaEmision)
    return fechaCreacion >= firstDayOfMonth
  }).length

  // Filtrar gift cards por estado
  const filteredGiftCards = giftCardsData.filter((gc) => {
    if (activeTab === "activas") return gc.estado === "activa"
    if (activeTab === "redimidas") return gc.estado === "redimida"
    if (activeTab === "vencidas") return gc.estado === "vencida"
    return true
  })

  const handleValidarGiftCard = async (codigo?: string) => {
    const codigoAValidar = codigo || codigoGiftCard

    if (!codigoAValidar.trim()) {
      toast.error("Ingresa un código de gift card")
      return
    }

    setIsValidating(true)
    setGiftCardNotFound(false)

    try {
      // Si se pasó un código, actualizar el estado
      if (codigo) {
        setCodigoGiftCard(codigo)
      }

      // Buscar la gift card por código
      const giftCardDB = await getGiftCardByCode(codigoAValidar.trim())

      if (!giftCardDB) {
        // Gift card no encontrada
        setGiftCardNotFound(true)
        setGiftCardValidada(null)
        setShowModal(true)
        return
      }

      // Obtener información del cliente
      const customer = await getCustomerById(giftCardDB.customer_id)

      if (!customer) {
        toast.error("No se pudo obtener la información del cliente")
        return
      }

      // Mapear la gift card de DB a la interfaz local
      const giftCardMapped: GiftCard = {
        id: giftCardDB.id,
        codigo: giftCardDB.code,
        cliente: customer.name || 'N/A',
        telefono: customer.phone || 'N/A',
        valor: giftCardDB.value,
        fechaEmision: giftCardDB.created_at,
        vencimiento: giftCardDB.expires_at,
        estado: giftCardDB.status === 'active' ? 'activa' :
                giftCardDB.status === 'redeemed' ? 'redimida' : 'vencida',
        customer_id: giftCardDB.customer_id,
        business_settings_id: giftCardDB.business_settings_id
      }

      setGiftCardValidada(giftCardMapped)
      setShowModal(true)

    } catch (error) {
      console.error("Error validating gift card:", error)
      toast.error("Error al validar la gift card")
    } finally {
      setIsValidating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleValidarGiftCard()
    }
  }

  const handleScan = (decodedText: string) => {
    // Cerrar el escáner
    setShowScanner(false)

    // Validar la gift card automáticamente con el código escaneado
    handleValidarGiftCard(decodedText)
  }

  const handleCancelar = () => {
    setShowModal(false)
    setGiftCardValidada(null)
    setGiftCardNotFound(false)
    setCodigoGiftCard("")
  }

  const handleRedimir = () => {
    if (giftCardValidada) {
      // Mostrar el modal del PIN en lugar de redimir directamente
      setShowPinModal(true)
    }
  }

  const handleRestaurarPredeterminados = () => {
    setPuntosRequeridos(100)
    setValorGiftCard(5)
    setDiasVencimiento(30)
    setMaxGiftCards(5)
    toast.success("Valores predeterminados restaurados")
  }

  const handleGuardarCambios = async () => {
    setIsSavingSettings(true)
    try {
      await upsertGiftCardSettings({
        points_required: puntosRequeridos,
        card_value: valorGiftCard,
        expiration_days: diasVencimiento,
        max_active_cards: maxGiftCards,
      })
      toast.success("Configuración guardada exitosamente")
      setShowConfigSheet(false)
    } catch (error) {
      console.error("Error saving gift card settings:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setIsSavingSettings(false)
    }
  }

  const metricas = [
    {
      titulo: "Activas",
      valor: countActivas.toString(),
      icon: Gift,
      descripcion: "Gift cards activas",
    },
    {
      titulo: "Redimidas este mes",
      valor: countRedimidasEsteMes.toString(),
      icon: TrendingUp,
      descripcion: "Canjes en el mes",
    },
    {
      titulo: "Valor en circulación",
      valor: `$${giftCardsData.filter(gc => gc.estado === "activa").reduce((acc, gc) => acc + gc.valor, 0).toLocaleString()}`,
      icon: DollarSign,
      descripcion: "Total disponible",
    },
    {
      titulo: "Tasa de Redención",
      valor: `${giftCardsData.length > 0 ? Math.round((countRedimidas / giftCardsData.length) * 100) : 0}%`,
      icon: Percent,
      descripcion: "Total histórico",
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
        {activeMode === "gestion" && (
          <PrimaryButton onClick={() => setShowConfigSheet(true)}>
            <Settings className="mr-2 h-5 w-5" />
            Configuración
          </PrimaryButton>
        )}
      </div>

      {/* Selector Redimir/Gestionar */}
      <div className="px-4 lg:px-6">
        <div className="relative w-full max-w-md mx-auto min-h-[56px] bg-gray-200 rounded-[50px] p-1">
          {/* Indicador animado */}
          <div
            className="absolute top-1 bottom-1 bg-white rounded-[50px] shadow-sm transition-all duration-300 ease-in-out"
            style={{
              left: activeMode === "redimir" ? "0.25rem" : "calc(50% + 0.125rem)",
              width: "calc(50% - 0.25rem)",
            }}
          />

          {/* Botones */}
          <div className="relative grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveMode("redimir")}
              className={`text-base min-h-[48px] rounded-[50px] cursor-pointer transition-colors duration-300 relative z-10 font-medium ${
                activeMode === "redimir" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Redimir
            </button>
            <button
              onClick={() => setActiveMode("gestion")}
              className={`text-base min-h-[48px] rounded-[50px] cursor-pointer transition-colors duration-300 relative z-10 font-medium ${
                activeMode === "gestion" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Gestionar
            </button>
          </div>
        </div>
      </div>

      {/* Vista Redimir */}
      {activeMode === "redimir" && (
        <div className="px-4 lg:px-6">
          <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
            <Card
              className="p-8 shadow-none"
              style={{ borderRadius: "30px", border: "1px solid #eeeeee" }}
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-2xl font-semibold">Validar Gift Card</h2>
                {/* Botón de escáner - Solo visible en móvil y tablet */}
                <button
                  onClick={() => setShowScanner(true)}
                  className="md:hidden w-12 h-12 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  title="Escanear código QR"
                >
                  <ScanLine className="w-6 h-6 text-primary" />
                </button>
              </div>
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
                <PrimaryButton onClick={() => handleValidarGiftCard()} disabled={isValidating}>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {isValidating ? "Validando..." : "Validar"}
                </PrimaryButton>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Vista Gestión */}
      {activeMode === "gestion" && (
        <>
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
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Listado de Gift Cards con Tabs */}
          <div className="px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="relative mb-4 w-full min-h-[56px] bg-gray-200 rounded-[50px] p-1">
            {/* Indicador animado */}
            <div
              className="absolute top-1 bottom-1 bg-white rounded-[50px] shadow-sm transition-all duration-300 ease-in-out"
              style={{
                left: activeTab === "activas" ? "0.25rem" : activeTab === "redimidas" ? "calc(33.333% + 0.125rem)" : "calc(66.666% + 0.125rem)",
                width: "calc(33.333% - 0.25rem)",
              }}
            />

            {/* Tabs */}
            <div className="relative grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab("activas")}
                className={`text-base min-h-[48px] rounded-[50px] cursor-pointer transition-colors duration-300 relative z-10 font-medium ${
                  activeTab === "activas" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Activas ({countActivas})
              </button>
              <button
                onClick={() => setActiveTab("redimidas")}
                className={`text-base min-h-[48px] rounded-[50px] cursor-pointer transition-colors duration-300 relative z-10 font-medium ${
                  activeTab === "redimidas" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Redimidas ({countRedimidas})
              </button>
              <button
                onClick={() => setActiveTab("vencidas")}
                className={`text-base min-h-[48px] rounded-[50px] cursor-pointer transition-colors duration-300 relative z-10 font-medium ${
                  activeTab === "vencidas" ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Vencidas ({countVencidas})
              </button>
            </div>
          </div>

          <TabsContent value={activeTab}>
            {isLoadingGiftCards ? (
              <Card
                className="p-12 shadow-none"
                style={{ borderRadius: "30px", border: "1px solid #eeeeee" }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <Gift className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Cargando gift cards...
                  </p>
                </div>
              </Card>
            ) : filteredGiftCards.length > 0 ? (
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
        </>
      )}

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
            <SecondaryButton onClick={handleRestaurarPredeterminados} disabled={isSavingSettings}>
              Restaurar predeterminados
            </SecondaryButton>
            <PrimaryButton onClick={handleGuardarCambios} disabled={isSavingSettings}>
              {isSavingSettings ? "Guardando..." : "Guardar cambios"}
            </PrimaryButton>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal de Gift Card Validada */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg">
          <DialogTitle className="sr-only">
            {giftCardNotFound ? "Gift Card No Encontrada" : "Gift Card Validada"}
          </DialogTitle>

          {/* Estado: Gift Card no encontrada */}
          {giftCardNotFound && (
            <div className="py-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <X className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">
                  Código incorrecto
                </h2>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                  El código <span className="font-mono font-semibold">{codigoGiftCard}</span> no existe o no es válido. Verifica el código e intenta nuevamente.
                </p>
                <PrimaryButton onClick={handleCancelar} className="w-full max-w-xs">
                  Entendido
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* Estado: Gift Card encontrada */}
          {giftCardValidada && !giftCardNotFound && (
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

      {/* Modal de Confirmación con PIN */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Confirmar con PIN</DialogTitle>
          <div className="flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">Confirmar redención</h2>
            <p className="text-sm text-muted-foreground mb-8 text-center">
              Ingresa tu PIN de 4 dígitos para confirmar la redención de la gift card
            </p>

            {/* Inputs de PIN */}
            <div className="flex gap-3 mb-2">
              {[0, 1, 2, 3].map((index) => (
                <input
                  key={index}
                  ref={(el) => { pinInputsRef.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={pin[index]}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  disabled={isRedeeming}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 rounded-2xl focus:border-primary focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: pinError ? "#ef4444" : pin[index] ? "#84dcdb" : "#e5e7eb" }}
                />
              ))}
            </div>

            {/* Error message */}
            {pinError && (
              <p className="text-sm text-red-600 mb-6">{pinError}</p>
            )}

            {!pinError && <div className="mb-6"></div>}

            {/* Botones */}
            <div className="flex gap-3 w-full">
              <SecondaryButton className="flex-1" onClick={handleCancelarPin} disabled={isRedeeming}>
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                className="flex-1"
                onClick={handleConfirmarRedencion}
                disabled={pin.some((digit) => !digit) || isRedeeming}
              >
                {isRedeeming ? "Procesando..." : "Confirmar"}
              </PrimaryButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Escáner QR - Solo se muestra cuando showScanner es true */}
      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}

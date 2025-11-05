"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Building2, Gift, MessageSquare, Users, MoreVertical, Edit2, Trash2, Search } from "lucide-react"
import { Card } from "@/components/ui/card"
import { FormInput } from "@/components/ui/form-input"
import { FormSelect } from "@/components/ui/form-select"
import { Label } from "@/components/ui/label"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { getBusinessSettings, upsertBusinessSettings } from "@/lib/supabase/business-settings"
import { getBusinessTypes, type BusinessType } from "@/lib/supabase/business-types"
import { getGiftCardSettings, upsertGiftCardSettings } from "@/lib/supabase/gift-card-settings"
import { toast } from "sonner"

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: SettingsSection
}

type SettingsSection = "negocio" | "puntos" | "whatsapp" | "equipo"

export function SettingsModal({ open, onOpenChange, initialTab = "negocio" }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>(initialTab)

  // Business settings states
  const [businessName, setBusinessName] = useState("")
  const [businessType, setBusinessType] = useState<string>("")
  const [phoneCode, setPhoneCode] = useState("414")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false)
  const [isSavingBusiness, setIsSavingBusiness] = useState(false)

  // Business types from database
  const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([])
  const [isLoadingTypes, setIsLoadingTypes] = useState(false)

  // Points settings states
  const [puntosRequeridos, setPuntosRequeridos] = useState(100)
  const [valorGiftCard, setValorGiftCard] = useState(5)
  const [diasVencimiento, setDiasVencimiento] = useState(30)
  const [maxGiftCards, setMaxGiftCards] = useState(5)
  const [isLoadingGiftCards, setIsLoadingGiftCards] = useState(false)
  const [isSavingGiftCards, setIsSavingGiftCards] = useState(false)

  const menuItems = [
    { id: "negocio" as SettingsSection, label: "Negocio", icon: Building2 },
    { id: "puntos" as SettingsSection, label: "Gift Cards", icon: Gift },
    { id: "whatsapp" as SettingsSection, label: "WhatsApp", icon: MessageSquare },
    { id: "equipo" as SettingsSection, label: "Equipo", icon: Users },
  ]

  // Actualizar la pestaña activa cuando cambie initialTab
  useEffect(() => {
    if (initialTab) {
      setActiveSection(initialTab)
    }
  }, [initialTab])

  // Load business types when component mounts
  useEffect(() => {
    loadBusinessTypes()
  }, [])

  // Load business settings when modal opens
  useEffect(() => {
    if (open) {
      loadBusinessSettings()
      loadGiftCardSettings()
    }
  }, [open])

  const loadBusinessTypes = async () => {
    setIsLoadingTypes(true)
    try {
      const types = await getBusinessTypes()
      console.log("🔍 Business types loaded:", types)
      setBusinessTypes(types)
    } catch (error) {
      console.error("❌ Error loading business types:", error)
      toast.error("Error al cargar los tipos de negocio")
    } finally {
      setIsLoadingTypes(false)
    }
  }

  const loadBusinessSettings = async () => {
    setIsLoadingBusiness(true)
    try {
      const settings = await getBusinessSettings()
      if (settings) {
        setBusinessName(settings.name || "")
        setBusinessType(settings.type?.toString() || "")
        setPhoneCode(settings.phone_code || "414")
        setPhoneNumber(settings.phone_number || "")
        setAddress(settings.address || "")
      }
    } catch (error) {
      console.error("Error loading business settings:", error)
      toast.error("Error al cargar la configuración del negocio")
    } finally {
      setIsLoadingBusiness(false)
    }
  }

  const loadGiftCardSettings = async () => {
    setIsLoadingGiftCards(true)
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
      toast.error("Error al cargar la configuración de gift cards")
    } finally {
      setIsLoadingGiftCards(false)
    }
  }

  const handleSaveBusinessSettings = async () => {
    setIsSavingBusiness(true)
    try {
      await upsertBusinessSettings({
        name: businessName,
        type: businessType ? parseInt(businessType) : undefined,
        phone_code: phoneCode,
        phone_number: phoneNumber,
        address: address,
      })
      toast.success("Configuración guardada exitosamente")
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving business settings:", error)
      toast.error("Error al guardar la configuración")
    } finally {
      setIsSavingBusiness(false)
    }
  }

  const handleCancelBusinessSettings = () => {
    onOpenChange(false)
    // Reset form when cancelled
    loadBusinessSettings()
  }

  const handleRestaurarPredeterminados = () => {
    setPuntosRequeridos(100)
    setValorGiftCard(5)
    setDiasVencimiento(30)
    setMaxGiftCards(5)
    toast.success("Valores predeterminados restaurados")
  }

  const handleGuardarCambiosGiftCards = async () => {
    setIsSavingGiftCards(true)
    try {
      console.log("Saving gift card settings:", {
        points_required: puntosRequeridos,
        card_value: valorGiftCard,
        expiration_days: diasVencimiento,
        max_active_cards: maxGiftCards,
      })
      const result = await upsertGiftCardSettings({
        points_required: puntosRequeridos,
        card_value: valorGiftCard,
        expiration_days: diasVencimiento,
        max_active_cards: maxGiftCards,
      })
      console.log("Gift card settings saved successfully:", result)
      toast.success("Configuración guardada exitosamente")
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving gift card settings:", error)
      console.error("Error type:", typeof error)
      console.error("Error keys:", error ? Object.keys(error) : "null")
      if (error instanceof Error) {
        console.error("Error message:", error.message)
        console.error("Error stack:", error.stack)
      }
      toast.error("Error al guardar la configuración")
    } finally {
      setIsSavingGiftCards(false)
    }
  }

  // Memoize business type options
  const businessTypeOptions = React.useMemo(() => {
    const options = businessTypes.map(type => ({
      value: type.id.toString(),
      label: type.name
    }))
    console.log("📋 Business type options:", options)
    return options
  }, [businessTypes])

  const renderContent = () => {
    switch (activeSection) {
      case "negocio":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Información del Negocio</h2>
              <p className="text-sm text-muted-foreground">
                Configura la información general de tu negocio
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nombre">Nombre del comercio</Label>
                <FormInput
                  id="nombre"
                  placeholder="Ej: Mi Restaurante"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  disabled={isLoadingBusiness}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tipo">Tipo de negocio</Label>
                <FormSelect
                  placeholder="Selecciona el tipo de negocio"
                  value={businessType}
                  onValueChange={setBusinessType}
                  options={businessTypeOptions}
                  disabled={isLoadingBusiness || isLoadingTypes}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="telefono">Teléfono/WhatsApp</Label>
                <div className="flex gap-2">
                  <div className="w-32">
                    <FormSelect
                      value={phoneCode}
                      onValueChange={setPhoneCode}
                      placeholder="Código"
                      options={[
                        { value: "414", label: "0414" },
                        { value: "424", label: "0424" },
                        { value: "416", label: "0416" },
                        { value: "426", label: "0426" },
                        { value: "412", label: "0412" },
                        { value: "422", label: "0422" },
                      ]}
                      disabled={isLoadingBusiness}
                    />
                  </div>
                  <FormInput
                    id="telefono"
                    placeholder="Ej: 1234567"
                    className="flex-1"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoadingBusiness}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="direccion">Dirección</Label>
                <FormInput
                  id="direccion"
                  placeholder="Ej: Av. Principal #123"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={isLoadingBusiness}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <SecondaryButton
                className="flex-1"
                onClick={handleCancelBusinessSettings}
                disabled={isSavingBusiness}
              >
                Cancelar
              </SecondaryButton>
              <PrimaryButton
                className="flex-1"
                onClick={handleSaveBusinessSettings}
                disabled={isSavingBusiness || isLoadingBusiness}
              >
                {isSavingBusiness ? "Guardando..." : "Guardar cambios"}
              </PrimaryButton>
            </div>
          </div>
        )

      case "puntos":
        return (
          <div className="flex flex-col h-full">
            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Configuración de Gift Cards</h2>
                  <p className="text-sm text-muted-foreground">
                    Personaliza los parámetros de generación y vencimiento de gift cards
                  </p>
                </div>

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
            </div>

            {/* Botones fijos */}
            <div className="pt-4 border-t mt-4" style={{ borderColor: '#eeeeee' }}>
              <div className="flex gap-3">
                <SecondaryButton
                  className="flex-1"
                  onClick={handleRestaurarPredeterminados}
                  disabled={isSavingGiftCards}
                >
                  Restaurar predeterminados
                </SecondaryButton>
                <PrimaryButton
                  className="flex-1"
                  onClick={handleGuardarCambiosGiftCards}
                  disabled={isSavingGiftCards || isLoadingGiftCards}
                >
                  {isSavingGiftCards ? "Guardando..." : "Guardar cambios"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        )

      case "whatsapp":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Integración WhatsApp</h2>
              <p className="text-sm text-muted-foreground">
                Configura las notificaciones por WhatsApp
              </p>
            </div>

            {/* Estado de conexión */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Estado de conexión</h3>
              <div className="flex items-center justify-between p-4 border rounded-[20px] bg-white" style={{ borderColor: '#eeeeee' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">+58412345678</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                        CONECTADO
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Última actividad: Hace 2 minutos
                    </p>
                  </div>
                </div>
                <SecondaryButton>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Enviar mensaje de prueba
                </SecondaryButton>
              </div>
            </div>

            {/* Personalización de mensajes */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Personalización de mensajes</h3>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="saludo">Saludo</Label>
                  <FormInput
                    id="saludo"
                    defaultValue="Hola [NOMBRE]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usa [NOMBRE] para incluir el nombre del cliente
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="despedida">Despedida</Label>
                  <FormInput
                    id="despedida"
                    defaultValue="¡Sigue sumando!"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="tono">Tono del mensaje</Label>
                  <FormSelect
                    placeholder="Selecciona el tono"
                    options={[
                      { value: "amigable", label: "Amigable" },
                      { value: "profesional", label: "Profesional" },
                      { value: "casual", label: "Casual" },
                      { value: "formal", label: "Formal" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Vista previa */}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">VISTA PREVIA</Label>
              <Card className="p-4 bg-gray-50" style={{ borderRadius: '20px', border: '1px solid #eeeeee' }}>
                <div className="space-y-1 text-sm">
                  <p>Hola Maria</p>
                  <p>¡Has ganado 25 puntos!</p>
                  <p>Puntos acumulados: 75</p>
                  <p>¡Sigue sumando!</p>
                </div>
              </Card>
            </div>

            <div className="flex gap-3 pt-4">
              <SecondaryButton className="flex-1">
                Cancelar
              </SecondaryButton>
              <PrimaryButton className="flex-1">
                Guardar cambios
              </PrimaryButton>
            </div>
          </div>
        )

      case "equipo":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Gestión de Equipo</h2>
              <p className="text-sm text-muted-foreground">
                Administra los miembros de tu equipo
              </p>
            </div>

            {/* Buscador y botón agregar */}
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <FormInput
                  type="text"
                  placeholder="Buscar usuarios..."
                  className="pl-11"
                />
              </div>
              <PrimaryButton>
                <Users className="w-4 h-4 mr-2" />
                Agregar usuario
              </PrimaryButton>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Usuario 1 */}
              <Card className="p-4 bg-white" style={{ borderRadius: '20px', border: '1px solid #eeeeee' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">JD</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Juan Domínguez</h3>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                          ADMIN
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                          ACTIVO
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">juan@email.com</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Último acceso: Hace 5 minutos
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-primary/10 rounded-full transition-colors [&:hover>svg]:text-primary cursor-pointer">
                        <MoreVertical className="w-5 h-5 text-muted-foreground transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="shadow-sm" style={{ borderRadius: '12px', borderColor: '#eeeeee' }}>
                      <DropdownMenuItem
                        className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                        style={{ borderRadius: '8px' }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        style={{ borderRadius: '8px' }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>

              {/* Usuario 2 */}
              <Card className="p-4 bg-white" style={{ borderRadius: '20px', border: '1px solid #eeeeee' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">MP</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">María Pérez</h3>
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">
                          GERENTE
                        </span>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-md">
                          ACTIVO
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">maria@email.com</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Último acceso: Hace 2 horas
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-primary/10 rounded-full transition-colors [&:hover>svg]:text-primary cursor-pointer">
                        <MoreVertical className="w-5 h-5 text-muted-foreground transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="shadow-sm" style={{ borderRadius: '12px', borderColor: '#eeeeee' }}>
                      <DropdownMenuItem
                        className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                        style={{ borderRadius: '8px' }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        style={{ borderRadius: '8px' }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>

              {/* Usuario 3 */}
              <Card className="p-4 bg-white" style={{ borderRadius: '20px', border: '1px solid #eeeeee' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">CL</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Carlos López</h3>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                          CAJERO
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                          INACTIVO
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">carlos@email.com</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Último acceso: Hace 3 días
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-primary/10 rounded-full transition-colors [&:hover>svg]:text-primary cursor-pointer">
                        <MoreVertical className="w-5 h-5 text-muted-foreground transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="shadow-sm" style={{ borderRadius: '12px', borderColor: '#eeeeee' }}>
                      <DropdownMenuItem
                        className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                        style={{ borderRadius: '8px' }}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer"
                        style={{ borderRadius: '8px' }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Configuración</DialogTitle>
        <div className="flex h-[600px]">
          {/* Sidebar */}
          <div className="w-64 border-r bg-muted/30 p-4 flex flex-col gap-2" style={{ borderColor: '#eeeeee' }}>
            <div className="mb-4">
              <h3 className="text-lg font-bold px-3">Configuración</h3>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-[16px] transition-colors text-left cursor-pointer hover:bg-primary/10 hover:text-primary [&:hover>svg]:text-primary ${
                    activeSection === item.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeSection === item.id ? "text-primary" : ""}`} />
                  {item.label}
                </button>
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

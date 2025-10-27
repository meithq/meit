"use client"

import { useState } from "react"
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

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type SettingsSection = "negocio" | "puntos" | "whatsapp" | "equipo"

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("negocio")

  const menuItems = [
    { id: "negocio" as SettingsSection, label: "Negocio", icon: Building2 },
    { id: "puntos" as SettingsSection, label: "Puntos", icon: Gift },
    { id: "whatsapp" as SettingsSection, label: "WhatsApp", icon: MessageSquare },
    { id: "equipo" as SettingsSection, label: "Equipo", icon: Users },
  ]

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
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tipo">Tipo de negocio</Label>
                <FormSelect
                  placeholder="Selecciona el tipo de negocio"
                  options={[
                    { value: "panaderia", label: "Panadería" },
                    { value: "restaurante", label: "Restaurante" },
                    { value: "cafeteria", label: "Cafetería" },
                    { value: "bar", label: "Bar" },
                    { value: "heladeria", label: "Heladería" },
                    { value: "tienda", label: "Tienda" },
                    { value: "supermercado", label: "Supermercado" },
                    { value: "otro", label: "Otro" },
                  ]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="telefono">Teléfono/WhatsApp</Label>
                <FormInput
                  id="telefono"
                  placeholder="Ej: +1 234 567 8900"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="direccion">Dirección</Label>
                <FormInput
                  id="direccion"
                  placeholder="Ej: Av. Principal #123"
                />
              </div>
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

      case "puntos":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Configuración de sistema de puntos</h2>
              <p className="text-sm text-muted-foreground">
                Define cómo tus clientes acumulan puntos y obtienen gift cards. Los cambios afectan solo a las transacciones futuras.
              </p>
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200" style={{ borderRadius: '20px' }}>
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">i</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-blue-900 mb-1">Configuración de sistema de puntos</h3>
                  <p className="text-sm text-blue-700">
                    Define cómo tus clientes acumulan puntos y obtienen gift cards. Los cambios afectan solo a las transacciones futuras.
                  </p>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="puntos-por-dolar">
                  Puntos por dólar <span className="text-red-500">*</span>
                </Label>
                <FormInput
                  id="puntos-por-dolar"
                  type="number"
                  defaultValue="1"
                />
                <p className="text-xs text-muted-foreground">
                  Cuántos puntos se otorgan por cada $1 USD de compra
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="puntos-giftcard">
                  Puntos necesarios para gift card <span className="text-red-500">*</span>
                </Label>
                <FormInput
                  id="puntos-giftcard"
                  type="number"
                  defaultValue="100"
                />
                <p className="text-xs text-muted-foreground">
                  Cantidad de puntos que el cliente debe acumular para recibir una gift card
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="valor-giftcard">
                  Valor de la gift card (USD) <span className="text-red-500">*</span>
                </Label>
                <FormInput
                  id="valor-giftcard"
                  type="number"
                  defaultValue="5"
                />
                <p className="text-xs text-muted-foreground">
                  Valor en dólares de cada gift card generada
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="limite-diario">
                  Límite diario de puntos por cliente <span className="text-red-500">*</span>
                </Label>
                <FormInput
                  id="limite-diario"
                  type="number"
                  defaultValue="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Máximo de puntos que un cliente puede acumular en un día
                </p>
              </div>
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

"use client"

import { Card } from "@/components/ui/card"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Search, Home, Check, Gift, UserPlus, X, Trophy } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useNavigation } from "@/contexts/navigation-context"
import { getBusinessSettings } from "@/lib/supabase/business-settings"
import { getCustomersByBusiness, addPointsToCustomerBusiness, type CustomerBusinessWithDetails } from "@/lib/supabase/customer-businesses"
import { getBusinesses, type Business } from "@/lib/supabase/businesses"
import { getActiveChallenges, type Challenge } from "@/lib/supabase/challenges"
import { validateAdminPin, createPointsAudit, getCurrentUser } from "@/lib/supabase/points-audit"
import { checkAndGenerateGiftCards } from "@/lib/supabase/gift-card-auto-generation"
import { createNotification } from "@/lib/supabase/notifications"
import { FormSelect } from "@/components/ui/form-select"
import { toast } from "sonner"

interface Cliente {
  id: string
  nombre: string
  telefono: string
  puntos: number
  giftCards: number
  estado: "activo" | "inactivo"
}

export function POSView() {
  const { setView } = useNavigation()
  const [currentStep, setCurrentStep] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRetos, setSelectedRetos] = useState<string[]>([])
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState(["", "", "", ""])
  const pinInputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [modalState, setModalState] = useState<"input" | "loading" | "success">("input")
  const [progress, setProgress] = useState(0)

  // Estados para base de datos
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoadingClientes, setIsLoadingClientes] = useState(false)
  const [retosDisponibles, setRetosDisponibles] = useState<Challenge[]>([])
  const [isLoadingRetos, setIsLoadingRetos] = useState(false)
  const [sucursales, setSucursales] = useState<Business[]>([])
  const [selectedSucursal, setSelectedSucursal] = useState<string | undefined>(undefined)
  const [currentBusinessId, setCurrentBusinessId] = useState<number | null>(null)
  const [currentBusinessSettingsId, setCurrentBusinessSettingsId] = useState<number | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Cargar clientes y retos al montar
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    // Cargar usuario actual
    const user = await getCurrentUser()
    if (user) {
      setCurrentUserId(user.id)
    }

    // Cargar sucursales
    await loadSucursales()
  }

  const loadSucursales = async () => {
    try {
      const businessesData = await getBusinesses()
      setSucursales(businessesData)

      // Si hay sucursales, seleccionar la primera por defecto
      if (businessesData.length > 0 && businessesData[0].id) {
        setSelectedSucursal(businessesData[0].id.toString())
        setCurrentBusinessId(businessesData[0].id)

        // Cargar datos de la primera sucursal
        if (businessesData[0].business_settings_id) {
          setCurrentBusinessSettingsId(businessesData[0].business_settings_id)
          loadClientes(businessesData[0].business_settings_id)
          loadRetos(businessesData[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading sucursales:', error)
      toast.error('Error al cargar las sucursales')
    }
  }

  const loadRetos = async (businessId: number) => {
    try {
      setIsLoadingRetos(true)

      // Obtener retos activos de la sucursal
      const retosData = await getActiveChallenges(businessId)
      setRetosDisponibles(retosData)
    } catch (error) {
      console.error('Error loading challenges:', error)
      toast.error('Error al cargar los retos')
    } finally {
      setIsLoadingRetos(false)
    }
  }

  const loadClientes = async (businessSettingsId: number) => {
    try {
      setIsLoadingClientes(true)

      // Obtener clientes del negocio
      const customersData = await getCustomersByBusiness(businessSettingsId)
      console.log('Raw customers data:', customersData)

      // Transformar datos al formato esperado
      const clientesTransformados: Cliente[] = customersData.map(customer => {
        console.log('Mapping customer:', customer)
        return {
          id: customer.customer_id, // Este es el UUID del cliente en la tabla customers
          nombre: customer.customer_name || 'Sin nombre',
          telefono: customer.phone || 'Sin teléfono',
          puntos: customer.total_points || 0,
          giftCards: 0, // TODO: Implementar cuando tengamos gift cards por cliente
          estado: customer.customer_is_active ? 'activo' : 'inactivo'
        }
      })

      console.log('Clientes transformados:', clientesTransformados)

      setClientes(clientesTransformados)
    } catch (error) {
      console.error('Error loading customers:', error)
      toast.error('Error al cargar los clientes')
    } finally {
      setIsLoadingClientes(false)
    }
  }

  const filteredClientes = searchQuery
    ? clientes.filter(
        (c) =>
          c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.telefono.includes(searchQuery)
      )
    : []

  const handleSelectCliente = (clienteItem: Cliente) => {
    setClienteSeleccionado(clienteItem)
    setSearchQuery(`${clienteItem.nombre} - ${clienteItem.telefono}`)
    setShowDropdown(false)
  }

  const handleCargarCliente = () => {
    if (clienteSeleccionado) {
      setCliente(clienteSeleccionado)
    }
  }

  const handleLimpiar = () => {
    setCliente(null)
    setClienteSeleccionado(null)
    setSearchQuery("")
    setSelectedRetos([])
  }

  const handleSucursalChange = (sucursalId: string) => {
    setSelectedSucursal(sucursalId)

    // Buscar la sucursal seleccionada
    const sucursal = sucursales.find(s => s.id?.toString() === sucursalId)
    if (sucursal?.id && sucursal.business_settings_id) {
      setCurrentBusinessId(sucursal.id)
      setCurrentBusinessSettingsId(sucursal.business_settings_id)

      // Recargar datos de la nueva sucursal
      loadClientes(sucursal.business_settings_id)
      loadRetos(sucursal.id)

      // Limpiar selección actual
      handleLimpiar()
    }
  }

  const handleToggleReto = (retoId: string) => {
    setSelectedRetos((prev) =>
      prev.includes(retoId)
        ? prev.filter((id) => id !== retoId)
        : [...prev, retoId]
    )
  }

  const totalPuntos = selectedRetos.reduce((sum, retoId) => {
    const reto = retosDisponibles.find((r) => r.id === retoId)
    return sum + (reto?.points || 0)
  }, 0)

  // Actualizar paso actual basado en el progreso
  useEffect(() => {
    if (!cliente) {
      setCurrentStep(1)
    } else if (selectedRetos.length === 0) {
      setCurrentStep(2)
    } else {
      setCurrentStep(3)
    }
  }, [cliente, selectedRetos.length])

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      pinInputsRef.current[index + 1]?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinInputsRef.current[index - 1]?.focus()
    }
  }

  const handleAsignarPuntos = () => {
    setShowPinModal(true)
    setModalState("input")
    setProgress(0)
  }

  const handleConfirmarAsignacion = async () => {
    const pinCompleto = pin.join("")
    if (pinCompleto.length !== 4) {
      toast.error('Error', {
        description: 'Por favor ingresa un PIN de 4 dígitos'
      })
      return
    }

    // Validar que tengamos todos los datos necesarios
    if (!currentUserId) {
      toast.error('Error', {
        description: 'No se pudo identificar al usuario actual'
      })
      return
    }

    if (!currentBusinessId) {
      toast.error('Error', {
        description: 'No se pudo identificar la sucursal'
      })
      return
    }

    if (!currentBusinessSettingsId) {
      toast.error('Error', {
        description: 'No se pudo identificar la configuración del negocio'
      })
      return
    }

    if (!cliente) {
      toast.error('Error', {
        description: 'No se ha seleccionado un cliente'
      })
      return
    }

    // Cambiar a estado loading
    setModalState("loading")
    setProgress(0)

    // Simular progreso visual
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return prev
        }
        return prev + 5
      })
    }, 100)

    try {
      // Validar el PIN contra la base de datos
      const adminUser = await validateAdminPin(pinCompleto)

      if (!adminUser) {
        clearInterval(progressInterval)
        setModalState("input")
        setProgress(0)
        toast.error('PIN inválido', {
          description: 'El PIN ingresado no es válido o no pertenece a un administrador'
        })
        return
      }

      // Crear registros de auditoría para cada reto seleccionado
      for (const retoId of selectedRetos) {
        const reto = retosDisponibles.find(r => r.id === retoId)
        if (!reto) continue

        await createPointsAudit({
          operator_id: currentUserId,
          admin_id: adminUser.id,
          customer_id: cliente.id,
          business_id: currentBusinessId,
          points_assigned: reto.points,
          challenge_id: reto.id
        })
      }

      // Agregar los puntos al cliente en la relación cliente-negocio
      console.log('Attempting to add points to customer-business:', {
        customerId: cliente.id,
        customerName: cliente.nombre,
        businessSettingsId: currentBusinessSettingsId,
        points: totalPuntos
      })
      await addPointsToCustomerBusiness(cliente.id, currentBusinessSettingsId, totalPuntos)

      // Crear notificación para el customer sobre los puntos asignados
      try {
        const retosNombres = selectedRetos
          .map(id => retosDisponibles.find(r => r.id === id)?.nombre)
          .filter(Boolean)
          .join(', ')

        await createNotification({
          business_settings_id: currentBusinessSettingsId,
          customer_id: cliente.id,
          type: 'points_assigned',
          title: '🌟 ¡Puntos Ganados!',
          message: `Has ganado ${totalPuntos} puntos por completar: ${retosNombres}`,
          metadata: {
            customer_id: cliente.id,
            customer_name: cliente.nombre,
            points: totalPuntos,
            challenges: retosNombres,
            challenge_ids: selectedRetos
          },
          priority: 'normal'
        })
        console.log('✅ Notification created for customer:', cliente.id)
      } catch (error) {
        console.error('Error creating points notification:', error)
        // No bloquear el flujo si falla la notificación
      }

      // Verificar y generar gift cards automáticamente si el cliente califica
      console.log('🎁 Checking if customer qualifies for gift cards...')
      const giftCardResults = await checkAndGenerateGiftCards(
        cliente.id,
        currentBusinessSettingsId
      )

      // Log resultados de gift cards
      giftCardResults.forEach((result, index) => {
        if (result.generated) {
          console.log(`✅ Gift card ${index + 1} generated:`, result.giftCard?.code)
          toast.success('🎁 Gift Card Generada', {
            description: `Se generó una gift card de $${result.giftCard?.value} USD`,
            duration: 5000,
          })
        } else {
          console.log(`ℹ️ Gift card ${index + 1}:`, result.message)
        }
      })

      // Completar progreso
      clearInterval(progressInterval)
      setProgress(100)

      // Cambiar a estado success
      setTimeout(() => {
        setModalState("success")
        toast.success('Puntos asignados', {
          description: `Se asignaron ${totalPuntos} puntos exitosamente`
        })

        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          setShowPinModal(false)
          setModalState("input")
          setPin(["", "", "", ""])
          setProgress(0)
          handleLimpiar()
        }, 2000)
      }, 300)
    } catch (error) {
      clearInterval(progressInterval)
      setModalState("input")
      setProgress(0)
      console.error('Error al asignar puntos:', error)

      // Extraer mensaje de error más descriptivo
      const errorMessage = error instanceof Error
        ? error.message
        : 'No se pudieron asignar los puntos. Intenta de nuevo.'

      toast.error('Error', {
        description: errorMessage
      })
    }
  }

  const steps = [
    { number: 1, title: "Buscar Cliente" },
    { number: 2, title: "Seleccionar reto" },
    { number: 3, title: "Verificar puntos" },
    { number: 4, title: "Confirmar asignación" },
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
              <BreadcrumbPage>Punto de Venta</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section */}
      <div className="px-4 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Punto de Venta
            </h1>
            <p className="text-muted-foreground text-sm">
              Gestiona la asignación de puntos a tus clientes
            </p>
          </div>

          {/* Selector de Sucursal */}
          {sucursales.length > 0 && (
            <div className="w-64">
              <FormSelect
                placeholder="Selecciona sucursal"
                value={selectedSucursal}
                onValueChange={handleSucursalChange}
                options={sucursales.map(sucursal => ({
                  value: sucursal.id?.toString() || '',
                  label: sucursal.name || 'Sin nombre'
                }))}
              />
            </div>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center max-w-3xl">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      currentStep > step.number
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.number
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-white border-gray-300 text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <span className="text-lg font-semibold">{step.number}</span>
                    )}
                  </div>
                  {/* Label */}
                  <span
                    className={`mt-2 text-xs text-center font-medium whitespace-nowrap ${
                      currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {/* Line connector */}
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-16 mx-2 transition-all ${
                      currentStep > step.number ? "bg-primary" : "bg-gray-300"
                    }`}
                    style={{ marginTop: "-40px" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid - 2 Columns */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1 - Search Cliente & Select Reto */}
          <div className="flex flex-col gap-6">
            <Card className="p-6 shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
              <h2 className="text-xl font-semibold mb-4">Buscar Cliente</h2>
              <div className="relative">
                <div className="flex gap-3">
                  <FormInput
                    type="text"
                    placeholder="Número de teléfono o nombre..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setClienteSeleccionado(null)
                      setShowDropdown(true)
                    }}
                    onFocus={() => {
                      if (searchQuery && !clienteSeleccionado) {
                        setShowDropdown(true)
                      }
                    }}
                    className="flex-1"
                  />
                  <PrimaryButton onClick={handleCargarCliente}>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Cargar Cliente
                  </PrimaryButton>
                  {cliente && (
                    <SecondaryButton onClick={handleLimpiar}>
                      <X className="mr-2 h-5 w-5" />
                      Limpiar
                    </SecondaryButton>
                  )}
                </div>

                {/* Dropdown de resultados */}
                {showDropdown && searchQuery && (
                  <div
                    className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-[24px] shadow-lg z-50 max-h-[300px] overflow-y-auto"
                    style={{ borderColor: '#eeeeee' }}
                  >
                    {isLoadingClientes ? (
                      <div className="px-4 py-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Cargando clientes...</p>
                      </div>
                    ) : filteredClientes.length > 0 ? (
                      filteredClientes.map((clienteItem) => (
                        <div
                          key={clienteItem.id}
                          onClick={() => handleSelectCliente(clienteItem)}
                          className="px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors first:rounded-t-[24px] last:rounded-b-[24px]"
                        >
                          <p className="text-sm font-medium text-foreground">
                            {clienteItem.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {clienteItem.telefono} • {clienteItem.puntos} pts
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No se encontraron clientes
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Intenta con otro nombre o teléfono
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Card de información del cliente */}
            {cliente && (
              <Card className="p-6 shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
                <h2 className="text-xl font-semibold mb-4">Información del Cliente</h2>
                <div className="space-y-4">
                  {/* Nombre y teléfono */}
                  <div>
                    <p className="text-lg font-semibold text-foreground">{cliente.nombre}</p>
                    <p className="text-sm text-muted-foreground">{cliente.telefono}</p>
                  </div>

                  {/* Grid de información */}
                  <div className="grid grid-cols-3 gap-4">
                    {/* Puntos */}
                    <div className="p-4 rounded-[20px] bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Puntos</p>
                      <p className="text-2xl font-bold text-primary">{cliente.puntos}</p>
                    </div>

                    {/* Gift Cards */}
                    <div className="p-4 rounded-[20px] bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Gift Cards</p>
                      <p className="text-2xl font-bold text-foreground">{cliente.giftCards}</p>
                    </div>

                    {/* Estado */}
                    <div className="p-4 rounded-[20px] bg-muted">
                      <p className="text-xs text-muted-foreground mb-1">Estado</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          cliente.estado === "activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {cliente.estado === "activo" ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
              <h2 className="text-xl font-semibold mb-4">Seleccionar Reto</h2>
              {!cliente ? (
                <div className="flex items-center justify-center min-h-[200px] text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Busca un cliente para ver los retos disponibles
                    </p>
                  </div>
                </div>
              ) : isLoadingRetos ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : retosDisponibles.length === 0 ? (
                <div className="flex items-center justify-center min-h-[200px] text-center">
                  <div>
                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
                      <Trophy className="h-8 w-8 text-primary/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      No hay retos activos disponibles
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {retosDisponibles.map((reto) => {
                    const getTipoLabel = (tipo: string) => {
                      switch(tipo) {
                        case 'monto_minimo': return 'Monto mínimo'
                        case 'horario_visita': return 'Horario específico'
                        case 'frecuencia_visitas': return 'Frecuencia'
                        case 'categoria_producto': return 'Categoría'
                        default: return tipo
                      }
                    }

                    const getIcono = (tipo: string) => {
                      switch(tipo) {
                        case 'monto_minimo': return '💰'
                        case 'horario_visita': return '🕐'
                        case 'frecuencia_visitas': return '🔄'
                        case 'categoria_producto': return '🏷️'
                        default: return '🎯'
                      }
                    }

                    return (
                      <div
                        key={reto.id}
                        onClick={() => handleToggleReto(reto.id)}
                        className={`relative p-4 border rounded-[24px] cursor-pointer transition-all ${
                          selectedRetos.includes(reto.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-[#eeeeee] hover:border-primary/50'
                        }`}
                      >
                        <div className="flex gap-3">
                          {/* Icono circular */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            {getIcono(reto.challenge_type)}
                          </div>

                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground mb-1">
                              {reto.name}
                            </h3>
                            {reto.description && (
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {reto.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-primary rounded-full text-primary-foreground">
                                {getTipoLabel(reto.challenge_type)}
                              </span>
                              {reto.is_repeatable && (
                                <span className="text-xs text-muted-foreground">🔁 Repetible</span>
                              )}
                            </div>
                          </div>

                          {/* Puntos en la esquina */}
                          <div className="flex-shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {reto.points} pts
                            </span>
                          </div>
                        </div>

                        {/* Indicador de selección */}
                        {selectedRetos.includes(reto.id) && (
                          <div className="absolute bottom-4 right-4">
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  {/* Resumen de selección */}
                  {selectedRetos.length > 0 ? (
                    <div className="mt-4 p-4 rounded-[20px] bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {selectedRetos.length} {selectedRetos.length === 1 ? 'reto seleccionado' : 'retos seleccionados'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Haz clic en "Confirmar" para continuar
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {totalPuntos}
                          </p>
                          <p className="text-xs text-muted-foreground">puntos totales</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground mt-4">
                      Seleccione al menos un reto para continuar
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Column 2 - Resumen */}
          <Card className="p-6 shadow-none h-fit sticky top-4" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>
            {!cliente ? (
              <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                <p className="text-sm">Busca un cliente para continuar</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Información del cliente */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                  <p className="text-lg font-semibold text-foreground">{cliente.nombre}</p>
                  <p className="text-sm text-muted-foreground">{cliente.telefono}</p>
                </div>

                {/* Puntos actuales */}
                <div className="p-4 rounded-[20px] bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">Puntos actuales</p>
                  <p className="text-3xl font-bold text-primary">{cliente.puntos}</p>
                </div>

                {/* Retos seleccionados */}
                {selectedRetos.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-3">
                      Retos seleccionados ({selectedRetos.length})
                    </p>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {selectedRetos.map((retoId) => {
                        const reto = retosDisponibles.find((r) => r.id === retoId)
                        if (!reto) return null

                        const getIcono = (tipo: string) => {
                          switch(tipo) {
                            case 'monto_minimo': return '💰'
                            case 'horario_visita': return '🕐'
                            case 'frecuencia_visitas': return '🔄'
                            case 'categoria_producto': return '🏷️'
                            default: return '🎯'
                          }
                        }

                        return (
                          <div
                            key={reto.id}
                            className="p-3 rounded-[16px] bg-muted flex items-center gap-2"
                          >
                            <span className="text-lg">{getIcono(reto.challenge_type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {reto.name}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-primary ml-2 whitespace-nowrap">
                              +{reto.points} pts
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Total de puntos a asignar */}
                    <div className="mt-4 p-4 rounded-[20px] bg-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          Total a asignar
                        </p>
                        <p className="text-3xl font-bold text-primary">
                          +{totalPuntos}
                        </p>
                      </div>
                      <div className="mt-2 pt-3 border-t border-primary/20">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Puntos finales
                          </p>
                          <p className="text-lg font-semibold text-foreground">
                            {cliente.puntos + totalPuntos} pts
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-3 pt-4">
                      <PrimaryButton className="w-full" onClick={handleAsignarPuntos}>
                        <Check className="mr-2 h-5 w-5" />
                        Asignar Puntos
                      </PrimaryButton>
                      <SecondaryButton className="w-full" onClick={handleLimpiar}>
                        Cancelar
                      </SecondaryButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[200px] text-center">
                    <div>
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                        <Gift className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Selecciona al menos un reto para continuar
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Modal de confirmación con PIN */}
      <Dialog open={showPinModal} onOpenChange={(open) => {
        if (!open && modalState !== "loading") {
          setShowPinModal(false)
          setPin(["", "", "", ""])
          setModalState("input")
          setProgress(0)
        }
      }}>
        <DialogContent className="max-w-md">
          {modalState === "input" && (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Asignación de Puntos</DialogTitle>
                <DialogDescription>
                  Ingresa tu PIN de 4 dígitos para confirmar la asignación de {totalPuntos} puntos
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                {/* Inputs OTP */}
                <div className="flex justify-center gap-3 mb-6">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        pinInputsRef.current[index] = el
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      className="w-16 h-16 text-center text-2xl font-bold border-2 rounded-[16px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      style={{ borderColor: digit ? 'var(--primary)' : '#eeeeee' }}
                    />
                  ))}
                </div>

                {/* Resumen */}
                {cliente && (
                  <div className="p-4 rounded-[20px] bg-muted space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cliente:</span>
                      <span className="font-medium">{cliente.nombre}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Retos seleccionados:</span>
                      <span className="font-medium">{selectedRetos.length}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-muted-foreground">Puntos a asignar:</span>
                      <span className="font-bold text-primary">+{totalPuntos}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <SecondaryButton
                  className="flex-1"
                  onClick={() => {
                    setShowPinModal(false)
                    setPin(["", "", "", ""])
                    setModalState("input")
                    setProgress(0)
                  }}
                >
                  Cancelar
                </SecondaryButton>
                <PrimaryButton
                  className="flex-1"
                  onClick={handleConfirmarAsignacion}
                  disabled={pin.some((digit) => !digit)}
                >
                  <Check className="mr-2 h-5 w-5" />
                  Confirmar
                </PrimaryButton>
              </div>
            </>
          )}

          {modalState === "loading" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                  style={{ animationDuration: '1s' }}
                ></div>
                <Gift className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Procesando...</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center">
                Asignando {totalPuntos} puntos a {cliente?.nombre}
              </p>

              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {progress}%
                </p>
              </div>
            </div>
          )}

          {modalState === "success" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">¡Puntos asignados!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Se han asignado {totalPuntos} puntos a {cliente?.nombre}
              </p>
              <div className="mt-4 p-4 rounded-[20px] bg-green-50 border border-green-200 w-full max-w-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Puntos anteriores:</span>
                  <span className="text-sm font-medium text-green-900">{cliente?.puntos}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-green-800">Puntos nuevos:</span>
                  <span className="text-lg font-bold text-green-600">
                    {cliente ? cliente.puntos + totalPuntos : 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

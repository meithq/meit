"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PrimaryButton } from "@/components/ui/primary-button"
import { SecondaryButton } from "@/components/ui/secondary-button"
import { FormInput } from "@/components/ui/form-input"
import { FormSelect } from "@/components/ui/form-select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, Home, MoreVertical, Edit2, Pause, BarChart3, Trophy, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useNavigation } from "@/contexts/navigation-context"
import { getChallenges, createChallenge, updateChallenge, deleteChallenge, toggleChallengeActive } from "@/lib/supabase/challenges"
import { getBusinessSettings } from "@/lib/supabase/business-settings"
import { getBusinesses } from "@/lib/supabase/businesses"
import { encodeTargetValue, decodeTargetValue, type Challenge, type ChallengeType } from "@/lib/types/challenges"
import { toast } from "sonner"

interface Reto {
  id: string
  titulo: string
  descripcion: string
  puntos: number
  meta: number
  completadosHoy: number
  porcentaje: number
  estado: "activo" | "pausado" | "finalizado"
}

export function RetosView() {
  const { setView } = useNavigation()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateSheet, setShowCreateSheet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [challengeToDelete, setChallengeToDelete] = useState<Challenge | null>(null)

  // Estados del formulario
  const [tipoReto, setTipoReto] = useState<string>("")
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [puntosOtorgar, setPuntosOtorgar] = useState("")

  // Campos condicionales según tipo de reto
  const [montoMinimo, setMontoMinimo] = useState("") // Para tipo: monto_minimo
  const [horaInicio, setHoraInicio] = useState("") // Para tipo: horario_visita
  const [horaFin, setHoraFin] = useState("") // Para tipo: horario_visita
  const [numeroVisitas, setNumeroVisitas] = useState("") // Para tipo: frecuencia_visitas
  const [diasPeriodo, setDiasPeriodo] = useState("7") // Para tipo: frecuencia_visitas
  const [categoria, setCategoria] = useState("") // Para tipo: categoria_producto

  // Campos adicionales
  const [esRepetible, setEsRepetible] = useState(true)
  const [maxCompletacionesDia, setMaxCompletacionesDia] = useState("")
  const [maxCompletacionesTotal, setMaxCompletacionesTotal] = useState("")
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")

  // Cargar retos al montar el componente
  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setIsLoading(true)
      // Obtener la primera sucursal del usuario
      const businesses = await getBusinesses()
      if (!businesses || businesses.length === 0) {
        console.error('No businesses found')
        toast.error('Error', {
          description: 'Debes crear una sucursal primero en la sección de Sucursales'
        })
        setIsLoading(false)
        return
      }

      const firstBusiness = businesses[0]
      if (!firstBusiness.id) {
        console.error('No business id found')
        setIsLoading(false)
        return
      }

      const data = await getChallenges(firstBusiness.id)
      setChallenges(data)
    } catch (error) {
      console.error('Error loading challenges:', error)
      toast.error('Error', {
        description: 'No se pudieron cargar los retos'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Opciones del tipo de reto
  const tipoRetoOptions = [
    { value: "monto_minimo", label: "Por monto mínimo" },
    { value: "horario_visita", label: "Por horario de visita" },
    { value: "frecuencia_visitas", label: "Por frecuencia de visitas" },
    { value: "categoria_producto", label: "Por categoría de producto" },
  ]

  const getEstadoBadgeVariant = (estado: string) => {
    if (estado === "activo") return "default"
    if (estado === "pausado") return "secondary"
    return "outline"
  }

  const clearForm = () => {
    setTipoReto("")
    setNombre("")
    setDescripcion("")
    setPuntosOtorgar("")
    setMontoMinimo("")
    setHoraInicio("")
    setHoraFin("")
    setNumeroVisitas("")
    setDiasPeriodo("7")
    setCategoria("")
    setEsRepetible(true)
    setMaxCompletacionesDia("")
    setMaxCompletacionesTotal("")
    setFechaInicio("")
    setFechaFin("")
    setEditingChallenge(null)
  }

  const handleOpenCreateSheet = () => {
    clearForm()
    setShowCreateSheet(true)
  }

  const handleOpenEditSheet = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setTipoReto(challenge.challenge_type)
    setNombre(challenge.name)
    setDescripcion(challenge.description || "")
    setPuntosOtorgar(challenge.points.toString())

    // Decodificar target_value
    const decoded = decodeTargetValue(challenge.challenge_type, challenge.target_value)
    if (challenge.challenge_type === 'monto_minimo') {
      setMontoMinimo(decoded.montoMinimo || "")
    } else if (challenge.challenge_type === 'horario_visita') {
      setHoraInicio(decoded.horaInicio || "")
      setHoraFin(decoded.horaFin || "")
    } else if (challenge.challenge_type === 'frecuencia_visitas') {
      setNumeroVisitas(decoded.numeroVisitas || "")
      setDiasPeriodo(decoded.diasPeriodo || "7")
    } else if (challenge.challenge_type === 'categoria_producto') {
      setCategoria(decoded.categoria || "")
    }

    setEsRepetible(challenge.is_repeatable)
    setMaxCompletacionesDia(challenge.max_completions_per_day?.toString() || "")
    setMaxCompletacionesTotal(challenge.max_completions_total?.toString() || "")
    setFechaInicio(challenge.start_date || "")
    setFechaFin(challenge.end_date || "")
    setShowCreateSheet(true)
  }

  const validateForm = (): boolean => {
    if (!tipoReto) {
      toast.error('Error', {
        description: 'Selecciona el tipo de reto'
      })
      return false
    }

    if (!nombre.trim()) {
      toast.error('Error', {
        description: 'Ingresa el nombre del reto'
      })
      return false
    }

    if (!puntosOtorgar || parseInt(puntosOtorgar) <= 0) {
      toast.error('Error', {
        description: 'Ingresa una cantidad válida de puntos'
      })
      return false
    }

    // Validar campos condicionales
    if (tipoReto === 'monto_minimo' && (!montoMinimo || parseInt(montoMinimo) <= 0)) {
      toast.error('Error', {
        description: 'Ingresa un monto mínimo válido'
      })
      return false
    }

    if (tipoReto === 'horario_visita' && (!horaInicio || !horaFin)) {
      toast.error('Error', {
        description: 'Ingresa el horario de inicio y fin'
      })
      return false
    }

    if (tipoReto === 'frecuencia_visitas' && (!numeroVisitas || parseInt(numeroVisitas) <= 0)) {
      toast.error('Error', {
        description: 'Ingresa un número válido de visitas'
      })
      return false
    }

    if (tipoReto === 'categoria_producto' && !categoria.trim()) {
      toast.error('Error', {
        description: 'Ingresa la categoría del producto'
      })
      return false
    }

    return true
  }

  const handleSaveAndActivate = async () => {
    if (!validateForm()) return

    try {
      setIsSaving(true)

      // Obtener la primera sucursal del usuario
      const businesses = await getBusinesses()
      if (!businesses || businesses.length === 0 || !businesses[0].id) {
        toast.error('Error', {
          description: 'Debes crear una sucursal primero en la sección de Sucursales'
        })
        setIsSaving(false)
        return
      }

      // Codificar target_value
      const targetValue = encodeTargetValue(tipoReto as ChallengeType, {
        montoMinimo,
        horaInicio,
        horaFin,
        numeroVisitas,
        diasPeriodo,
        categoria
      })

      const challengeData = {
        name: nombre,
        description: descripcion || undefined,
        points: parseInt(puntosOtorgar),
        challenge_type: tipoReto as ChallengeType,
        target_value: targetValue,
        is_repeatable: esRepetible,
        max_completions_per_day: maxCompletacionesDia ? parseInt(maxCompletacionesDia) : undefined,
        max_completions_total: maxCompletacionesTotal ? parseInt(maxCompletacionesTotal) : undefined,
        start_date: fechaInicio || undefined,
        end_date: fechaFin || undefined,
        is_active: true,
        business_id: businesses[0].id
      }

      if (editingChallenge) {
        await updateChallenge(editingChallenge.id, challengeData)
        toast.success('¡Reto actualizado!', {
          description: 'El reto ha sido actualizado y activado exitosamente'
        })
      } else {
        await createChallenge(challengeData)
        toast.success('¡Reto creado!', {
          description: 'El reto ha sido creado y activado exitosamente'
        })
      }

      setShowCreateSheet(false)
      clearForm()
      loadChallenges()
    } catch (error) {
      console.error('Error saving challenge:', error)
      toast.error('Error', {
        description: 'No se pudo guardar el reto'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveAsDraft = async () => {
    if (!validateForm()) return

    try {
      setIsSaving(true)

      // Obtener la primera sucursal del usuario
      const businesses = await getBusinesses()
      if (!businesses || businesses.length === 0 || !businesses[0].id) {
        toast.error('Error', {
          description: 'Debes crear una sucursal primero en la sección de Sucursales'
        })
        setIsSaving(false)
        return
      }

      // Codificar target_value
      const targetValue = encodeTargetValue(tipoReto as ChallengeType, {
        montoMinimo,
        horaInicio,
        horaFin,
        numeroVisitas,
        diasPeriodo,
        categoria
      })

      const challengeData = {
        name: nombre,
        description: descripcion || undefined,
        points: parseInt(puntosOtorgar),
        challenge_type: tipoReto as ChallengeType,
        target_value: targetValue,
        is_repeatable: esRepetible,
        max_completions_per_day: maxCompletacionesDia ? parseInt(maxCompletacionesDia) : undefined,
        max_completions_total: maxCompletacionesTotal ? parseInt(maxCompletacionesTotal) : undefined,
        start_date: fechaInicio || undefined,
        end_date: fechaFin || undefined,
        is_active: false,
        business_id: businesses[0].id
      }

      if (editingChallenge) {
        await updateChallenge(editingChallenge.id, challengeData)
        toast.success('¡Reto actualizado!', {
          description: 'El reto ha sido guardado como borrador'
        })
      } else {
        await createChallenge(challengeData)
        toast.success('¡Reto guardado!', {
          description: 'El reto ha sido guardado como borrador'
        })
      }

      setShowCreateSheet(false)
      clearForm()
      loadChallenges()
    } catch (error) {
      console.error('Error saving challenge:', error)
      toast.error('Error', {
        description: 'No se pudo guardar el reto'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (challenge: Challenge) => {
    try {
      await toggleChallengeActive(challenge.id, !challenge.is_active)
      if (challenge.is_active) {
        toast.success('Reto pausado', {
          description: 'El reto ha sido pausado exitosamente'
        })
      } else {
        toast.success('Reto activado', {
          description: 'El reto ha sido activado exitosamente'
        })
      }
      loadChallenges()
    } catch (error) {
      console.error('Error toggling challenge:', error)
      toast.error('Error', {
        description: 'No se pudo cambiar el estado del reto'
      })
    }
  }

  const handleDelete = (challenge: Challenge) => {
    setChallengeToDelete(challenge)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!challengeToDelete?.id) return

    try {
      await deleteChallenge(challengeToDelete.id)
      toast.success('Reto eliminado', {
        description: 'El reto ha sido eliminado exitosamente'
      })
      loadChallenges()
      setIsDeleteModalOpen(false)
      setChallengeToDelete(null)
    } catch (error) {
      console.error('Error deleting challenge:', error)
      toast.error('Error', {
        description: 'No se pudo eliminar el reto'
      })
    }
  }

  const handleCancel = () => {
    setShowCreateSheet(false)
    clearForm()
  }

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
              <BreadcrumbPage>Retos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Header Section */}
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Retos
        </h1>
        <p className="text-muted-foreground text-sm">
          Crea y gestiona retos para tus clientes
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
              placeholder="Buscar retos..."
              className="pl-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Button */}
          <PrimaryButton className="w-full sm:w-auto" onClick={handleOpenCreateSheet}>
            <Plus className="mr-2 h-6 w-6" />
            Crear reto
          </PrimaryButton>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4 lg:px-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="p-4 shadow-none relative"
                style={{ borderRadius: '20px', border: '1px solid #eeeeee' }}
              >
                {/* Status indicator skeleton */}
                <div className="absolute top-3 right-3">
                  <Skeleton className="w-2 h-2 rounded-full" />
                </div>

                {/* Header skeleton */}
                <div className="flex items-start gap-2 mb-2">
                  {/* Icono skeleton */}
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />

                  {/* Contenido principal skeleton */}
                  <div className="flex-1 min-w-0 pr-4 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>

                {/* Descripción skeleton */}
                <div className="pl-[48px] mb-2">
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-4/5" />
                </div>

                {/* Divider */}
                <div className="border-t border-border mb-2" />

                {/* Footer skeleton */}
                <div className="flex items-center justify-between">
                  {/* Puntos skeleton */}
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-2 w-10" />
                    </div>
                  </div>

                  {/* Metadata skeleton */}
                  <div className="flex gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : challenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {challenges
              .filter(challenge =>
                challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                challenge.description?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((challenge) => {
                const formatDate = (date: string) => {
                  return new Date(date).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short'
                  })
                }

                return (
            <Card
              key={challenge.id}
              className="group p-4 shadow-none relative hover:border-primary/20 transition-all cursor-pointer"
              style={{ borderRadius: '20px', border: '1px solid #eeeeee' }}
              onClick={() => handleOpenEditSheet(challenge)}
            >
              {/* Menú desplegable - esquina superior derecha */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="absolute top-4 right-4 p-1 hover:bg-primary/10 rounded-full transition-colors [&:hover>svg]:text-primary cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-5 h-5 text-muted-foreground transition-colors" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="shadow-sm" style={{ borderRadius: '12px', borderColor: '#eeeeee' }}>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenEditSheet(challenge)
                    }}
                    className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                    style={{ borderRadius: '8px' }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleActive(challenge)
                    }}
                    className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                    style={{ borderRadius: '8px' }}
                  >
                    <Pause className="mr-2 h-4 w-4" />
                    {challenge.is_active ? "Pausar" : "Activar"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(challenge)
                    }}
                    variant="destructive"
                    className="cursor-pointer"
                    style={{ borderRadius: '8px' }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Header con icono de tipo de reto */}
              <div className="flex items-start gap-2 mb-2">
                {/* Icono del tipo de reto */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-lg">
                  {challenge.challenge_type === 'monto_minimo' && '💰'}
                  {challenge.challenge_type === 'horario_visita' && '🕐'}
                  {challenge.challenge_type === 'frecuencia_visitas' && '🔄'}
                  {challenge.challenge_type === 'categoria_producto' && '🏷️'}
                </div>

                {/* Contenido principal */}
                <div className="flex-1 min-w-0 pr-4">
                  {/* Título */}
                  <h3 className="font-semibold text-sm text-foreground mb-0.5 truncate">
                    {challenge.name}
                  </h3>

                  {/* Tipo de reto */}
                  <p className="text-xs text-muted-foreground">
                    {challenge.challenge_type === 'monto_minimo' && 'Monto mínimo'}
                    {challenge.challenge_type === 'horario_visita' && 'Horario específico'}
                    {challenge.challenge_type === 'frecuencia_visitas' && 'Frecuencia de visitas'}
                    {challenge.challenge_type === 'categoria_producto' && 'Categoría de producto'}
                  </p>
                </div>
              </div>

              {/* Descripción (si existe) */}
              {challenge.description && (
                <p className="text-xs text-muted-foreground/80 mb-2 line-clamp-2 pl-[48px]">
                  {challenge.description}
                </p>
              )}

              {/* Divider */}
              <div className="border-t border-border mb-2" />

              {/* Footer con puntos e info */}
              <div className="flex items-center justify-between">
                {/* Puntos destacados */}
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-foreground leading-none">{challenge.points}</div>
                    <div className="text-[10px] text-muted-foreground">puntos</div>
                  </div>
                </div>

                {/* Metadata chips */}
                <div className="flex flex-wrap gap-2 items-center justify-end">
                  {/* Status badge */}
                  <div className={`px-2 py-0.5 rounded-full text-[10px] ${challenge.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {challenge.is_active ? 'Activo' : 'Inactivo'}
                  </div>

                  {challenge.is_repeatable && (
                    <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <span>🔁</span>
                    </div>
                  )}

                  {/* Fechas */}
                  {(challenge.start_date || challenge.end_date) && (
                    <div className="text-[10px] text-muted-foreground">
                      {challenge.start_date && challenge.end_date && (
                        <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                      )}
                      {challenge.start_date && !challenge.end_date && (
                        <span>Desde {formatDate(challenge.start_date)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )})}
        </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
              <Trophy className="w-10 h-10 text-primary/40" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "No se encontraron retos" : "Aún no tienes retos"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
              {searchTerm
                ? "Intenta ajustar tus criterios de búsqueda"
                : "Crea tu primer reto para motivar a tus clientes a participar"
              }
            </p>
            {!searchTerm && (
              <PrimaryButton onClick={handleOpenCreateSheet}>
                <Plus className="mr-2 h-5 w-5" />
                Crear primer reto
              </PrimaryButton>
            )}
          </div>
        )}
      </div>

      {/* Sheet para crear/editar reto */}
      <Sheet open={showCreateSheet} onOpenChange={setShowCreateSheet}>
        <SheetContent
          side="right"
          className="m-4 h-[calc(100vh-2rem)] p-0 [&>button]:bg-white [&>button]:rounded-full [&>button]:w-10 [&>button]:h-10 [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:border [&>button]:shadow-sm [&>button]:cursor-pointer flex flex-col overflow-hidden"
          style={{ borderRadius: '30px', borderColor: '#eeeeee' }}
        >
          <SheetHeader className="px-6 pt-6 pb-4 flex-shrink-0">
            <SheetTitle className="text-2xl">
              {editingChallenge ? "Editar Reto" : "Crear Reto"}
            </SheetTitle>
            <SheetDescription>
              {editingChallenge
                ? "Modifica los detalles del reto existente"
                : "Define el tipo de reto y los detalles para motivar a tus clientes"
              }
            </SheetDescription>
          </SheetHeader>

          {/* Contenido scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="flex flex-col gap-6">
              {/* Tipo de reto */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="tipo-reto">Tipo de reto</Label>
                <FormSelect
                  placeholder="Selecciona el tipo de reto"
                  value={tipoReto}
                  onValueChange={setTipoReto}
                  options={tipoRetoOptions}
                />
                <p className="text-xs text-muted-foreground">
                  Define el criterio principal del reto
                </p>
              </div>

              {/* Separador */}
              <div className="border-t border-border"></div>

              {/* Detalles del reto */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-sm text-foreground">Detalles del reto</h3>

                {/* Nombre */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nombre">Nombre del reto</Label>
                  <FormInput
                    id="nombre"
                    placeholder="Ej: Compra matutina"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                  />
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    placeholder="Describe cómo funciona el reto..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Esta descripción será visible para tus clientes
                  </p>
                </div>

                {/* Puntos a otorgar */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="puntos">Puntos a otorgar</Label>
                  <FormInput
                    id="puntos"
                    type="number"
                    placeholder="Ej: 50"
                    value={puntosOtorgar}
                    onChange={(e) => setPuntosOtorgar(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cantidad de puntos que ganará el cliente al completar el reto
                  </p>
                </div>

                {/* Campos condicionales según tipo de reto */}
                {tipoReto === 'monto_minimo' && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="monto-minimo">Monto mínimo de compra (USD)</Label>
                    <FormInput
                      id="monto-minimo"
                      type="number"
                      placeholder="Ej: 100"
                      value={montoMinimo}
                      onChange={(e) => setMontoMinimo(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Monto mínimo en USD que debe alcanzar la compra
                    </p>
                  </div>
                )}

                {tipoReto === 'horario_visita' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="hora-inicio">Hora de inicio</Label>
                      <FormInput
                        id="hora-inicio"
                        type="time"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="hora-fin">Hora de fin</Label>
                      <FormInput
                        id="hora-fin"
                        type="time"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        El cliente debe visitar dentro de este horario
                      </p>
                    </div>
                  </>
                )}

                {tipoReto === 'frecuencia_visitas' && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="numero-visitas">Número de visitas requeridas</Label>
                      <FormInput
                        id="numero-visitas"
                        type="number"
                        placeholder="Ej: 5"
                        value={numeroVisitas}
                        onChange={(e) => setNumeroVisitas(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="dias-periodo">Período (días)</Label>
                      <FormInput
                        id="dias-periodo"
                        type="number"
                        placeholder="Ej: 7"
                        value={diasPeriodo}
                        onChange={(e) => setDiasPeriodo(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        El cliente debe completar {numeroVisitas || 'X'} visitas en {diasPeriodo || 'X'} días
                      </p>
                    </div>
                  </>
                )}

                {tipoReto === 'categoria_producto' && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="categoria">Categoría del producto</Label>
                    <FormInput
                      id="categoria"
                      placeholder="Ej: Café, Postres, etc."
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      El cliente debe comprar un producto de esta categoría
                    </p>
                  </div>
                )}
              </div>

              {/* Separador */}
              <div className="border-t border-border"></div>

              {/* Configuración adicional */}
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-sm text-foreground">Configuración adicional</h3>

                {/* Es repetible */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label htmlFor="es-repetible">¿Reto repetible?</Label>
                    <p className="text-xs text-muted-foreground">
                      Los clientes pueden completar el reto múltiples veces
                    </p>
                  </div>
                  <input
                    id="es-repetible"
                    type="checkbox"
                    checked={esRepetible}
                    onChange={(e) => setEsRepetible(e.target.checked)}
                    className="w-5 h-5 cursor-pointer accent-primary"
                  />
                </div>

                {/* Límites de completación (solo si es repetible) */}
                {esRepetible && (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="max-dia">Máximo de completaciones por día</Label>
                      <FormInput
                        id="max-dia"
                        type="number"
                        placeholder="Dejar vacío para sin límite"
                        value={maxCompletacionesDia}
                        onChange={(e) => setMaxCompletacionesDia(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="max-total">Máximo de completaciones totales</Label>
                      <FormInput
                        id="max-total"
                        type="number"
                        placeholder="Dejar vacío para sin límite"
                        value={maxCompletacionesTotal}
                        onChange={(e) => setMaxCompletacionesTotal(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {/* Fechas de vigencia */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fecha-inicio">Fecha de inicio</Label>
                  <FormInput
                    id="fecha-inicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fecha-fin">Fecha de fin</Label>
                  <FormInput
                    id="fecha-fin"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dejar vacío para que el reto no tenga fecha de expiración
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <SheetFooter className="flex-shrink-0 px-6 py-4 border-t border-border">
            <div className="flex flex-col gap-2 w-full">
              <PrimaryButton
                onClick={handleSaveAndActivate}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <div className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingChallenge ? "Actualizar y activar" : "Guardar y activar"
                )}
              </PrimaryButton>
              <SecondaryButton
                onClick={handleSaveAsDraft}
                disabled={isSaving}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <div className="inline-block w-4 h-4 mr-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  editingChallenge ? "Actualizar como borrador" : "Guardar como borrador"
                )}
              </SecondaryButton>
              <SecondaryButton
                onClick={handleCancel}
                disabled={isSaving}
                className="w-full"
              >
                Cancelar
              </SecondaryButton>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Eliminar Reto</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar este reto?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-sm font-semibold mb-2">{challengeToDelete?.name || 'Sin nombre'}</p>
              {challengeToDelete?.description && (
                <p className="text-xs text-muted-foreground mb-2">{challengeToDelete.description}</p>
              )}
              <p className="text-sm text-red-600 mt-3">
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a este reto.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <SecondaryButton
              onClick={() => {
                setIsDeleteModalOpen(false)
                setChallengeToDelete(null)
              }}
              className="flex-1"
            >
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={handleDeleteConfirm}
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

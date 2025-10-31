"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, Home, MoreVertical, Edit2, Pause, BarChart3, Trophy } from "lucide-react"
import { useState } from "react"
import { useNavigation } from "@/contexts/navigation-context"

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

// Array vacío - cargar datos desde la base de datos
const retosData: Reto[] = []

export function RetosView() {
  const { setView } = useNavigation()
  const [searchTerm, setSearchTerm] = useState("")

  const getEstadoBadgeVariant = (estado: string) => {
    if (estado === "activo") return "default"
    if (estado === "pausado") return "secondary"
    return "outline"
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
          <PrimaryButton className="w-full sm:w-auto">
            <Plus className="mr-2 h-6 w-6" />
            Crear reto
          </PrimaryButton>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4 lg:px-6">
        {retosData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {retosData.map((reto) => (
            <Card key={reto.id} className="p-4 shadow-none relative" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
              {/* Badge de estado en esquina inferior derecha */}
              <div className="absolute bottom-4 right-4">
                <Badge variant={getEstadoBadgeVariant(reto.estado)}>
                  {reto.estado === "activo" ? "Activo" : reto.estado === "pausado" ? "Pausado" : "Finalizado"}
                </Badge>
              </div>

              {/* Header con título */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="font-bold text-base text-foreground">
                    {reto.titulo}
                  </h3>
                </div>

                {/* Menú de 3 puntos */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 hover:bg-primary/10 rounded-full transition-colors [&:hover>svg]:text-primary cursor-pointer">
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
                      className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                      style={{ borderRadius: '8px' }}
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pausar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary [&[data-highlighted]>svg]:text-primary cursor-pointer"
                      style={{ borderRadius: '8px' }}
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Analytics
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Descripción */}
              <p className="text-sm text-muted-foreground mb-3">
                {reto.descripcion}
              </p>

              {/* Puntos y Meta */}
              <div className="flex items-center gap-4 mb-3">
                <div>
                  <div className="text-3xl font-bold text-primary">{reto.puntos}</div>
                  <div className="text-xs text-muted-foreground">puntos</div>
                </div>
                <div className="h-10 w-px bg-border"></div>
                <div>
                  <div className="text-sm text-muted-foreground">Meta <span className="font-bold text-foreground">{reto.meta}</span></div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-10 pr-20">
                {/* Completados hoy y porcentaje */}
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">{reto.completadosHoy} completados hoy</span>
                  <span className="font-semibold">{reto.porcentaje}%</span>
                </div>

                {/* Barra */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${reto.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            </Card>
          ))}
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
              <PrimaryButton>
                <Plus className="mr-2 h-5 w-5" />
                Crear primer reto
              </PrimaryButton>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

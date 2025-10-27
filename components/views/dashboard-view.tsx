"use client"

import { SectionCards } from "@/components/section-cards"
import { CheckinsCard } from "@/components/checkins-card"
import { PuntosAsignadosCard } from "@/components/puntos-asignados-card"

export function DashboardView() {
  return (
    <div className="flex flex-col gap-4 pt-4 md:pt-6 md:gap-6 max-w-[1200px] mx-auto w-full pb-[100px]">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Hola, John Doe 👋
        </h1>
        <p className="text-muted-foreground text-sm">
          Hoy es jueves, 23 de Octubre de 2025
        </p>
      </div>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CheckinsCard />
          <PuntosAsignadosCard />
        </div>
      </div>
    </div>
  )
}

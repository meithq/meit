"use client"

import { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PlaceholderViewProps {
  title: string
  description: string
  icon: LucideIcon
}

export function PlaceholderView({ title, description, icon: Icon }: PlaceholderViewProps) {
  return (
    <div className="flex flex-col gap-4 pt-4 md:pt-6 md:gap-6 max-w-[1200px] mx-auto w-full pb-[100px]">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm">
          {description}
        </p>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Icon className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Próximamente</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Esta sección está en desarrollo. Pronto podrás acceder a todas las funcionalidades de {title}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

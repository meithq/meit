import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Gift, Users, Star, CreditCard, FileText, ChevronRight } from "lucide-react"

const quickActions = [
  {
    id: 1,
    icon: Plus,
    label: "Nuevo Cliente"
  },
  {
    id: 2,
    icon: Star,
    label: "Asignar Puntos"
  },
  {
    id: 3,
    icon: Gift,
    label: "Crear Gift Card"
  },
  {
    id: 4,
    icon: Users,
    label: "Ver Clientes"
  },
  {
    id: 5,
    icon: CreditCard,
    label: "Transacciones"
  },
  {
    id: 6,
    icon: FileText,
    label: "Reportes"
  }
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Acciones rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            return (
              <Button
                key={action.id}
                variant="ghost"
                className="w-full h-auto p-3 flex items-center justify-between text-left bg-muted/50 border border-muted hover:bg-muted/70"
              >
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
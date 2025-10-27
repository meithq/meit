import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, Users, CreditCard } from "lucide-react"

const activities = [
  {
    id: 1,
    icon: Star,
    iconColor: "bg-primary/10",
    person: "María González",
    description: "Puntos asignados",
    points: "+25 puntos",
    type: "points_assigned",
    time: "hace 5 minutos"
  },
  {
    id: 2,
    icon: Gift,
    iconColor: "bg-primary/10",
    person: "Carlos Rodríguez",
    description: "Gift card generada",
    points: null,
    type: "gift_card",
    time: "hace 12 minutos"
  },
  {
    id: 3,
    icon: Users,
    iconColor: "bg-primary/10",
    person: "Ana Martínez",
    description: "Check-in realizado",
    points: null,
    type: "check_in",
    time: "hace 18 minutos"
  },
  {
    id: 4,
    icon: CreditCard,
    iconColor: "bg-primary/10",
    person: "Luis Fernández",
    description: "Puntos canjeados",
    points: "-50 puntos",
    type: "points_redeemed",
    time: "hace 25 minutos"
  },
  {
    id: 5,
    icon: Star,
    iconColor: "bg-primary/10",
    person: "Sofia López",
    description: "Puntos asignados",
    points: "+15 puntos",
    type: "points_assigned",
    time: "hace 32 minutos"
  }
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Actividad reciente</CardTitle>
          <a 
            href="#" 
            className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            Ver todas
          </a>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {activities.map((activity) => {
            const IconComponent = activity.icon
            return (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`h-10 w-10 rounded-lg ${activity.iconColor} flex items-center justify-center`}>
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.person}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.description}
                    {activity.points && (
                      <span 
                        className={`ml-1 font-bold ${
                          activity.type === 'points_assigned' 
                            ? 'text-primary' 
                            : activity.type === 'points_redeemed'
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {activity.points}
                      </span>
                    )}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs bg-muted/50 border-muted text-muted-foreground">
                  {activity.time}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
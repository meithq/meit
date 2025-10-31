import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Gift, Star, Users, CreditCard } from "lucide-react"

// Array vacío - cargar datos desde la base de datos
const activities: Array<{
  id: number
  icon: any
  iconColor: string
  person: string
  description: string
  points: string | null
  type: string
  time: string
}> = []

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
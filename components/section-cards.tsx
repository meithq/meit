import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t lg:px-6">
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Check-ins hoy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Puntos asignados hoy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Clientes activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
        </CardHeader>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Gift Cards generadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            0
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  )
}

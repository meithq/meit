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
            127
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Incremento este mes <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Puntos asignados hoy</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,890
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-red-500 text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400">
              <IconTrendingDown />
              -15.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Bajada del 15.3% este período <IconTrendingDown className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Clientes activos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400">
              <IconTrendingUp />
              +15.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Excelente retención de usuarios <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
        <CardHeader>
          <CardDescription>Gift Cards generadas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            89
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400">
              <IconTrendingUp />
              +22.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Crecimiento constante <IconTrendingUp className="size-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

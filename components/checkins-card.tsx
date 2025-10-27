"use client"

import { useState } from "react"
import { UserCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { 
  ChartConfig, 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
} from "@/components/ui/chart"

const data7D = [
  { day: "Lun", checkins: 12 },
  { day: "Mar", checkins: 19 },
  { day: "Mié", checkins: 15 },
  { day: "Jue", checkins: 25 },
  { day: "Vie", checkins: 22 },
  { day: "Sáb", checkins: 18 },
  { day: "Dom", checkins: 14 },
]

const data30D = [
  { day: "Sem 1", checkins: 85 },
  { day: "Sem 2", checkins: 92 },
  { day: "Sem 3", checkins: 78 },
  { day: "Sem 4", checkins: 105 },
]

const data90D = [
  { day: "Mes 1", checkins: 320 },
  { day: "Mes 2", checkins: 380 },
  { day: "Mes 3", checkins: 295 },
]

const chartConfig = {
  checkins: {
    label: "Check-ins",
    color: "#84dcdb",
  },
} satisfies ChartConfig

export function CheckinsCard() {
  const [period, setPeriod] = useState("7D")
  
  const getData = () => {
    switch (period) {
      case "7D":
        return data7D
      case "30D":
        return data30D
      case "90D":
        return data90D
      default:
        return data7D
    }
  }

  const data = getData()
  
  const calculateAverage = () => {
    const total = data.reduce((sum, item) => sum + item.checkins, 0)
    return Math.round(total / data.length)
  }

  const average = calculateAverage()
  
  const getTotal = () => {
    return data.reduce((sum, item) => sum + item.checkins, 0)
  }

  return (
    <Card className="shadow-none" style={{ borderRadius: '30px', border: '1px solid #eeeeee' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <CardTitle className="text-base font-medium">Check-ins</CardTitle>
        </div>
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger 
              value="7D" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              7D
            </TabsTrigger>
            <TabsTrigger 
              value="30D" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              30D
            </TabsTrigger>
            <TabsTrigger 
              value="90D" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              90D
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{getTotal().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
        <p className="text-xs text-muted-foreground">
          {period === "7D" ? "últimos 7 días" : period === "30D" ? "últimos 30 días" : "últimos 90 días"}
        </p>
        <div className="mt-4 h-[120px] overflow-hidden">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              accessibilityLayer
              data={getData()}
              margin={{
                left: 12,
                right: 12,
                top: 8,
                bottom: 8,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Area
                dataKey="checkins"
                type="monotone"
                fill="var(--color-checkins)"
                fillOpacity={0.4}
                stroke="var(--color-checkins)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Promedio por día</span>
          <span className="text-sm font-bold">{average} visitas</span>
        </div>
      </CardContent>
    </Card>
  )
}
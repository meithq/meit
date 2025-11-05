'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { ChartDataPoint } from '@/hooks/use-analytics'

interface CheckInsChartProps {
  data: ChartDataPoint[]
  loading: boolean
}

export function CheckInsChart({ data, loading }: CheckInsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-ins Diarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-ins Diarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-neutral-500 text-sm">No hay datos disponibles para este período</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check-ins Diarios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6B7280' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6B7280' }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
                itemStyle={{ color: '#812797' }}
                formatter={(value: number) => [`${value} check-ins`, 'Total']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#812797"
                strokeWidth={2}
                dot={{ fill: '#812797', r: 4 }}
                activeDot={{ r: 6 }}
                name="Check-ins"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

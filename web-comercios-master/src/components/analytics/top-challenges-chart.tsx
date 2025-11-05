'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { TopChallenge } from '@/hooks/use-analytics'

interface TopChallengesChartProps {
  data: TopChallenge[]
  loading: boolean
}

// Gradient colors from primary-600 to primary-200
const COLORS = ['#812797', '#9B3BAB', '#B54FBF', '#CF63D3', '#E977E7']

export function TopChallengesChart({ data, loading }: TopChallengesChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Retos</CardTitle>
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
          <CardTitle>Top 5 Retos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <p className="text-neutral-500 text-sm">No hay retos activos para mostrar</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format data for horizontal bar chart (reverse for better visual order)
  const chartData = [...data]
    .sort((a, b) => a.completions - b.completions)
    .map(challenge => ({
      name: challenge.name.length > 30 ? `${challenge.name.substring(0, 30)}...` : challenge.name,
      completions: challenge.completions
    }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Retos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6B7280' }}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#6B7280' }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
                formatter={(value: number) => [`${value} completados`, 'Completados']}
              />
              <Bar
                dataKey="completions"
                radius={[0, 4, 4, 0]}
                name="Completados"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

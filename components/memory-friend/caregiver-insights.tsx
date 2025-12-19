"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { Memory } from "@/src/types"
import { format, subDays, isSameDay } from "date-fns"

interface CaregiverInsightsProps {
  memories: Memory[]
}

export function CaregiverInsights({ memories }: CaregiverInsightsProps) {
  // Generate data for the last 7 days
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i)
    const count = memories.filter((m) => isSameDay(new Date(m.created_at), date)).length
    return {
      name: format(date, "EEE"),
      count,
      fullDate: format(date, "MMM d"),
    }
  })

  const totalMemories = memories.length
  const photoMemories = memories.filter(m => m.image_url).length
  const topTags = memories
    .flatMap(m => m.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  
  const sortedTags = Object.entries(topTags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Activity (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg shadow-soft p-2 text-xs">
                          <p className="font-bold">{payload[0].payload.fullDate}</p>
                          <p className="text-primary">{payload[0].value} memories</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count > 0 ? 'hsl(var(--primary))' : 'hsl(var(--muted))'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-display">Summary Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-primary/5 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Captures</p>
              <p className="text-2xl font-bold text-primary">{totalMemories}</p>
            </div>
            <div className="p-3 bg-accent/10 rounded-xl">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">With Photos</p>
              <p className="text-2xl font-bold text-accent-foreground">{photoMemories}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Top Topics</p>
            <div className="flex flex-wrap gap-2">
              {sortedTags.length > 0 ? (
                sortedTags.map(([tag, count]) => (
                  <span key={tag} className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                    {tag} ({count})
                  </span>
                ))
              ) : (
                <p className="text-xs text-muted-foreground italic">No topics identified yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

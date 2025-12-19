import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays, startOfDay, isSameDay } from 'date-fns';
import type { Memory } from '@/types';

interface CaregiverInsightsProps {
  memories: Memory[];
}

export default function CaregiverInsights({ memories }: CaregiverInsightsProps) {
  const last7DaysData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    return days.map(day => {
      const count = memories.filter(m => isSameDay(new Date(m.created_at), day)).length;
      return {
        name: format(day, 'MMM d'),
        count
      };
    });
  }, [memories]);

  const typeData = useMemo(() => {
    const types: Record<string, number> = {};
    memories.forEach(m => {
      types[m.type] = (types[m.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [memories]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card className="bg-white/50 backdrop-blur-sm border-primary/10 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Memory Capture Trend
            <span className="text-xs font-normal text-muted-foreground">(Last 7 Days)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#8b5cf6' }} 
                  activeDot={{ r: 6, strokeWidth: 0 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-sm border-primary/10 shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            Memory Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }} 
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

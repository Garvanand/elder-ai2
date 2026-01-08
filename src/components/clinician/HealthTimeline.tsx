import React from 'react';
import { Card } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'Month 1', cognitive: 80, mobility: 85, sleep: 70 },
  { name: 'Month 2', cognitive: 82, mobility: 82, sleep: 75 },
  { name: 'Month 3', cognitive: 78, mobility: 75, sleep: 65 },
  { name: 'Month 4', cognitive: 75, mobility: 70, sleep: 60 },
  { name: 'Month 5', cognitive: 72, mobility: 68, sleep: 58 },
  { name: 'Month 6', cognitive: 70, mobility: 65, sleep: 55 },
];

export const HealthTimeline = () => {
  return (
    <Card className="h-80 p-6 border-border shadow-sm">
      <h3 className="text-lg font-bold mb-4">Longitudinal Health Timeline</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
              itemStyle={{ fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: '10px' }} />
            <Line type="monotone" dataKey="cognitive" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="mobility" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="sleep" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

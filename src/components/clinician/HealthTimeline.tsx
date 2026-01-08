import React from 'react';
import { HolographicCard } from '../ui/holographic-card';
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
    <HolographicCard className="h-80">
      <h3 className="text-lg font-bold mb-4">Longitudinal Health Timeline</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
          <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid rgba(255,255,255,0.1)' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Line type="monotone" dataKey="cognitive" stroke="#b000ff" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="mobility" stroke="#00f3ff" strokeWidth={3} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="sleep" stroke="#ff006e" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </HolographicCard>
  );
};

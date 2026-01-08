import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  ReferenceLine, ComposedChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Activity, Zap, TrendingUp, Sparkles } from 'lucide-react';

const data = [
  { time: '08:00', cognitive: 65, stability: 70, mood: 60, prediction: 65 },
  { time: '10:00', cognitive: 68, stability: 75, mood: 62, prediction: 68 },
  { time: '12:00', cognitive: 62, stability: 68, mood: 58, prediction: 62 },
  { time: '14:00', cognitive: 70, stability: 80, mood: 65, prediction: 70 },
  { time: '16:00', cognitive: 60, stability: 65, mood: 55, prediction: 60 },
  { time: '18:00', cognitive: 58, stability: 60, mood: 50, prediction: 58 },
  { time: '20:00', cognitive: 64, stability: 72, mood: 58, prediction: 64 },
  { time: '22:00', prediction: 66, isForecast: true },
  { time: '00:00', prediction: 68, isForecast: true },
  { time: '02:00', prediction: 65, isForecast: true },
];

export const HealthTimeline = () => {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden text-white">
      <CardHeader className="p-8 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              Neural <span className="text-cyan-400">Timeline</span>
              <div className="flex items-center gap-1 bg-cyan-400/10 px-2 py-0.5 rounded text-[8px] font-black tracking-widest text-cyan-400 border border-cyan-400/20">
                <TrendingUp className="w-2 h-2" />
                FORECAST ACTIVE
              </div>
            </CardTitle>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Real-time longitudinal telemetry • Predictive Analysis Mode</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cognitive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stability</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full border border-white/40 bg-transparent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ML Forecast</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="colorCognitive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#ffffff20" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#64748b', fontWeight: 'bold' }}
            />
            <YAxis 
              stroke="#ffffff20" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tick={{ fill: '#64748b', fontWeight: 'bold' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0a0e27', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="cognitive" 
              stroke="#22d3ee" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorCognitive)" 
              animationDuration={2000}
            />
            <Area 
              type="monotone" 
              dataKey="stability" 
              stroke="#a855f7" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorStability)" 
              animationDuration={2000}
              animationDelay={500}
            />
            <Line
              type="monotone"
              dataKey="prediction"
              stroke="#ffffff60"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
            <ReferenceLine x="20:00" stroke="#ffffff20" label={{ value: 'NOW', fill: '#ffffff40', fontSize: 10, fontWeight: 'black', position: 'top' }} />
            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="10 10" label={{ value: 'CRITICAL', fill: '#ef4444', fontSize: 10, fontWeight: 'black', position: 'right' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
      <div className="px-8 pb-8 flex items-center gap-4">
        <div className="flex -space-x-2">
          {[1,2,3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border border-[#0a0e27] bg-white/10 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          ML models predicting <span className="text-white">88% probability</span> of cognitive surge in next 4 hours
        </p>
      </div>
    </Card>
  );
};

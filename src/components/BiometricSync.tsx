import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Thermometer, Wind, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const BiometricSync = () => {
  const [heartRate, setHeartRate] = useState(72);
  const [stress, setStress] = useState(24);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => prev + (Math.random() - 0.5) * 2);
      setStress(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 5)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden text-white border-2 border-cyan-500/20 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
      <CardContent className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Biometric <span className="text-cyan-400">Sync</span></h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Real-time Bio-Feedback v2.1</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">Link Stable</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latency: 12ms</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2 text-rose-400">
                <Heart className="w-4 h-4 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-widest">Heart Rate</span>
              </div>
              <span className="text-2xl font-black">{Math.round(heartRate)} <span className="text-xs text-slate-500">BPM</span></span>
            </div>
            <Progress value={(heartRate / 150) * 100} className="h-1 bg-white/5" />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-2 text-cyan-400">
                <Wind className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Respiration</span>
              </div>
              <span className="text-2xl font-black">14 <span className="text-xs text-slate-500">RPM</span></span>
            </div>
            <Progress value={45} className="h-1 bg-white/5" />
          </div>
        </div>

        <div className="p-6 bg-black/20 border border-white/5 rounded-3xl space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Emotional Stress Index</span>
            <span className={stress > 50 ? "text-rose-400" : "text-emerald-400"}>
              {stress > 50 ? "Elevated" : "Optimal"}
            </span>
          </div>
          <div className="relative h-12 flex items-center gap-1">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: [10, Math.random() * 40 + 10, 10],
                  opacity: i < (stress / 5) ? 1 : 0.2
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                className={`flex-1 rounded-full ${i < (stress / 5) ? (stress > 50 ? 'bg-rose-500' : 'bg-cyan-400') : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        <p className="text-[10px] text-slate-500 text-center font-medium leading-relaxed italic">
          AI analysis suggests current biometric state correlates with high cognitive readiness. Continue session.
        </p>
      </CardContent>
    </Card>
  );
};

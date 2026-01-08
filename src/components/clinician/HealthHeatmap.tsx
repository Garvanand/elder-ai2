import React from 'react';
import { motion } from 'framer-motion';

const days = Array.from({ length: 7 * 12 }, (_, i) => ({
  date: i,
  score: Math.random(),
  intensity: Math.floor(Math.random() * 4)
}));

export const HealthHeatmap = () => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Health Heatmap</h3>
          <p className="text-slate-500 text-xs uppercase font-black tracking-widest mt-1">Activity & Biomarker Density</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold">LOW</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-cyan-900/30" />
            <div className="w-3 h-3 rounded-sm bg-cyan-700/50" />
            <div className="w-3 h-3 rounded-sm bg-cyan-500/80" />
            <div className="w-3 h-3 rounded-sm bg-cyan-400" />
          </div>
          <span className="text-[10px] text-slate-500 font-bold">HIGH</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2">
        {days.map((day) => (
          <motion.div
            key={day.date}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: day.date * 0.005 }}
            className={`aspect-square rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-cyan-400/50 ${
              day.intensity === 0 ? 'bg-white/5' :
              day.intensity === 1 ? 'bg-cyan-900/30' :
              day.intensity === 2 ? 'bg-cyan-600/50' :
              'bg-cyan-400'
            }`}
            title={`Day ${day.date}: ${Math.round(day.score * 100)}% Activity`}
          />
        ))}
      </div>
      
      <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Consistency</p>
          <p className="text-lg font-black text-cyan-400">94.2%</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Peak Period</p>
          <p className="text-lg font-black text-white">08:00 - 11:30</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Recovery Rate</p>
          <p className="text-lg font-black text-purple-400">+12.5%</p>
        </div>
      </div>
    </div>
  );
};

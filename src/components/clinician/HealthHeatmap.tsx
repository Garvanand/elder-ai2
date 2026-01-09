import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const days = Array.from({ length: 7 * 12 }, (_, i) => ({
  date: i,
  score: Math.random(),
  intensity: Math.floor(Math.random() * 4)
}));

export const HealthHeatmap = () => {
  return (
    <Card className="border border-border rounded-[32px] p-8 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Health Heatmap</h3>
          <p className="text-muted-foreground text-xs uppercase font-black tracking-widest mt-1">Activity & Biomarker Density</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-bold">LOW</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-primary/10" />
            <div className="w-3 h-3 rounded-sm bg-primary/30" />
            <div className="w-3 h-3 rounded-sm bg-primary/60" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground font-bold">HIGH</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-2">
        {days.map((day) => (
          <motion.div
            key={day.date}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: day.date * 0.005 }}
            className={`aspect-square rounded-sm transition-colors cursor-pointer hover:ring-2 hover:ring-primary/50 ${
              day.intensity === 0 ? 'bg-muted/30' :
              day.intensity === 1 ? 'bg-primary/20' :
              day.intensity === 2 ? 'bg-primary/50' :
              'bg-primary'
            }`}
            title={`Day ${day.date}: ${Math.round(day.score * 100)}% Activity`}
          />
        ))}
      </div>
      
      <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4">
        <div>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Consistency</p>
          <p className="text-lg font-black text-primary">94.2%</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Peak Period</p>
          <p className="text-lg font-black text-foreground">08:00 - 11:30</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Recovery Rate</p>
          <p className="text-lg font-black text-accent-foreground">+12.5%</p>
        </div>
      </div>
    </Card>
  );
};

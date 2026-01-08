import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, AlertCircle, Search, Filter, 
  ArrowUpRight, MoreVertical, Phone, Calendar,
  Brain, Heart, Zap, Shield, Eye
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Patient {
  id: string;
  name: string;
  age: number;
  status: 'critical' | 'stable' | 'monitoring';
  cognitiveScore: number;
  lastActive: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    oxygen: number;
  };
  riskScore: number;
}

const patients: Patient[] = [
  {
    id: '1',
    name: 'Robert Wilson',
    age: 78,
    status: 'critical',
    cognitiveScore: 62,
    lastActive: '2m ago',
    vitals: { heartRate: 92, bloodPressure: '145/95', oxygen: 94 },
    riskScore: 85
  },
  {
    id: '2',
    name: 'Martha Chen',
    age: 82,
    status: 'stable',
    cognitiveScore: 75,
    lastActive: '15m ago',
    vitals: { heartRate: 72, bloodPressure: '120/80', oxygen: 98 },
    riskScore: 32
  },
  {
    id: '3',
    name: 'James Rodriguez',
    age: 71,
    status: 'monitoring',
    cognitiveScore: 68,
    lastActive: '5m ago',
    vitals: { heartRate: 84, bloodPressure: '135/88', oxygen: 96 },
    riskScore: 54
  }
];

export const CommandCenter = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'critical' | 'stable'>('all');

  return (
    <div className="space-y-8 p-6 bg-[#0a0e27] min-h-screen text-white font-sans">
      {/* NASA Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#22d3ee]" />
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Mission <span className="text-cyan-400">Control</span>
            </h1>
          </div>
          <p className="text-slate-400 font-medium tracking-widest text-xs uppercase">
            Global Patient Monitoring Matrix • Sector 7G
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Query neural database..." 
              className="bg-white/5 border-white/10 pl-12 h-12 rounded-xl text-white placeholder:text-slate-600 focus:ring-cyan-400/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl px-6">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Real-time Data Stream (Animated) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {patients.map((patient) => (
            <motion.div
              key={patient.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden group hover:border-cyan-400/50 transition-colors rounded-[32px]">
                <div className="relative p-8">
                  {/* Status Scan Line */}
                  <div className={cn(
                    "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
                    patient.status === 'critical' ? "from-rose-500" : "from-cyan-400",
                    "via-transparent to-transparent opacity-50"
                  )} />

                  <div className="flex justify-between items-start mb-8">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${patient.id}`} alt={patient.name} className="w-full h-full object-cover grayscale" />
                        <div className={cn(
                          "absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-[#0a0e27]",
                          patient.status === 'critical' ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                        )} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">{patient.name}</h3>
                        <p className="text-slate-400 text-sm font-medium">Age: {patient.age} • ID: PX-{patient.id}00</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white">
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Vitals Matrix */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <Heart className="w-4 h-4 text-rose-500 mb-2" />
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">BPM</p>
                      <p className="text-lg font-black tracking-tight">{patient.vitals.heartRate}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <Zap className="w-4 h-4 text-cyan-400 mb-2" />
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">O2%</p>
                      <p className="text-lg font-black tracking-tight">{patient.vitals.oxygen}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <Brain className="w-4 h-4 text-purple-500 mb-2" />
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">COG</p>
                      <p className="text-lg font-black tracking-tight">{patient.cognitiveScore}</p>
                    </div>
                  </div>

                  {/* Risk Indicator */}
                  <div className="space-y-3 mb-8">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Stability Index</p>
                      <p className={cn(
                        "text-sm font-black",
                        patient.riskScore > 70 ? "text-rose-500" : "text-cyan-400"
                      )}>{100 - patient.riskScore}%</p>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${100 - patient.riskScore}%` }}
                        className={cn(
                          "h-full rounded-full shadow-[0_0_10px_currentColor]",
                          patient.riskScore > 70 ? "bg-rose-500" : "bg-cyan-400"
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl uppercase tracking-widest h-12">
                      Initialize Link
                    </Button>
                    <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-xl h-12">
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

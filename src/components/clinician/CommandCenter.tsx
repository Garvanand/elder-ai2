import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Activity, AlertCircle, Search, Filter, 
  ArrowUpRight, MoreVertical, Phone, Calendar,
  Brain, Heart, Zap, Shield, Eye, Bell
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BrainModel3D } from './BrainModel3D';
import { HealthHeatmap } from './HealthHeatmap';

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
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0]);

  return (
    <div className="space-y-8 p-6 bg-transparent text-white font-sans relative z-10">
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
          <Button variant="outline" className="h-12 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl px-6 group">
            <Bell className="w-4 h-4 mr-2 group-hover:text-rose-500 transition-colors" />
            <span className="bg-rose-500 text-[10px] px-1.5 rounded-full mr-2">3</span>
            Alerts
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Patient List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Active Units</h2>
            <Badge variant="outline" className="border-cyan-400/30 text-cyan-400">{patients.length} ONLINE</Badge>
          </div>
          
          {patients.map((patient) => (
            <motion.div
              key={patient.id}
              whileHover={{ x: 5 }}
              onClick={() => setSelectedPatient(patient)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer group",
                selectedPatient?.id === patient.id 
                  ? "bg-cyan-400/10 border-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
                  : "bg-white/5 border-white/10 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${patient.id}`} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0e27]",
                    patient.status === 'critical' ? "bg-rose-500 animate-ping" : "bg-emerald-500"
                  )} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{patient.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                    <span>PX-{patient.id}00</span>
                    <span>•</span>
                    <span className={patient.status === 'critical' ? "text-rose-500" : "text-emerald-500"}>{patient.status}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-white">{patient.vitals.heartRate} <span className="text-[8px] text-slate-500">BPM</span></p>
                  <p className="text-[10px] font-bold text-cyan-400">{100 - patient.riskScore}% STABLE</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Center/Right Column: Patient Deep Dive */}
        <div className="lg:col-span-8 space-y-8">
          {selectedPatient ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPatient.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* 3D Visualizer & Heatmap Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 border-b border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                          <Brain className="w-4 h-4 text-purple-400" />
                          Neural Mapping
                        </h3>
                      </div>
                      <BrainModel3D />
                    </CardContent>
                  </Card>
                  
                  <HealthHeatmap />
                </div>

                {/* Real-time Telemetry */}
                <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[32px] p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">Biometric Telemetry</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-white/10 bg-white/5">24H</Button>
                      <Button size="sm" variant="outline" className="border-white/10 bg-white/5">7D</Button>
                      <Button size="sm" variant="outline" className="border-cyan-400/30 text-cyan-400 bg-cyan-400/5">LIVE</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Heart Rate', value: selectedPatient.vitals.heartRate, unit: 'BPM', icon: Heart, color: 'text-rose-500' },
                      { label: 'Blood Pressure', value: selectedPatient.vitals.bloodPressure, unit: 'SYS/DIA', icon: Activity, color: 'text-cyan-400' },
                      { label: 'Oxygen Saturation', value: selectedPatient.vitals.oxygen, unit: '%', icon: Zap, color: 'text-amber-400' },
                      { label: 'Cognitive Score', value: selectedPatient.cognitiveScore, unit: 'MMSE', icon: Brain, color: 'text-purple-400' },
                    ].map((metric, i) => (
                      <div key={i} className="p-6 bg-white/5 rounded-3xl border border-white/5 relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-20 transition-all group-hover:opacity-100" />
                        <metric.icon className={cn("w-5 h-5 mb-4", metric.color)} />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
                        <p className="text-2xl font-black text-white">{metric.value}</p>
                        <p className="text-[10px] font-bold text-slate-600 mt-1">{metric.unit}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-[32px]">
              <p className="text-slate-500 font-bold uppercase tracking-widest animate-pulse">Select Unit for Telemetry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

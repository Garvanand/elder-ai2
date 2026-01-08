import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, AlertTriangle, TrendingUp, Search, 
  Activity, Bell, Calendar, Video, Filter,
  Brain, Heart, Smartphone
} from 'lucide-react';
import { HolographicCard } from '../ui/holographic-card';
import { ParticleBackground } from '../ui/particle-background';
import { cn } from '@/lib/utils';

// Mock Alert Data
const mockAlerts = [
  { id: 1, type: 'critical', patient: 'Mrs. Chen', event: 'Fall Detected', time: '2m ago' },
  { id: 2, type: 'warning', patient: 'Mr. Johnson', event: 'Gait Decline (23%)', time: '15m ago' },
  { id: 3, type: 'info', patient: 'Mr. Davis', event: 'Medication Missed', time: '1h ago' },
];

export const CommandCenter = () => {
  const [activeView, setActiveView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="relative min-h-screen text-white p-8">
      <ParticleBackground />
      
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/40">
            <Activity className="h-8 w-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight neon-text">Health Mission Control</h1>
            <p className="text-white/60">NASA-Grade Multi-Patient Monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
            <input 
              type="text"
              placeholder="AI Semantic Search..."
              className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 w-80 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-white/5 border border-white/10 relative"
          >
            <Bell className="h-6 w-6 text-white/80" />
            <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-[#0a0e27]" />
          </motion.button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 border-2 border-white/20" />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="col-span-1 flex flex-col gap-6 items-center py-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <SidebarIcon icon={Users} active={activeView === 'grid'} onClick={() => setActiveView('grid')} label="Patients" />
          <SidebarIcon icon={AlertTriangle} active={activeView === 'alerts'} onClick={() => setActiveView('alerts')} label="Priority" />
          <SidebarIcon icon={TrendingUp} active={activeView === 'trends'} onClick={() => setActiveView('trends')} label="Analytics" />
          <SidebarIcon icon={Video} active={activeView === 'tele'} onClick={() => setActiveView('tele')} label="Rounds" />
          <div className="mt-auto">
            <SidebarIcon icon={Filter} active={false} onClick={() => {}} label="Filters" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="col-span-8">
          <div className="grid grid-cols-2 gap-6">
            <AnimatePresence>
              {[1, 2, 3, 4].map((i) => (
                <PatientCard key={i} />
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Priority Alert System */}
        <aside className="col-span-3 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-red-400" />
            Priority Alerts
          </h3>
          <div className="space-y-4">
            {mockAlerts.map((alert) => (
              <AlertCard key={alert.id} {...alert} />
            ))}
          </div>
          
          <HolographicCard className="mt-8">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-purple-400" />
              AI Insight
            </h4>
            <p className="text-sm text-white/70">
              Gait speed patterns across 3 high-risk patients show correlation with recent weather changes. Recommend PT sessions.
            </p>
          </HolographicCard>
        </aside>
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon: Icon, active, onClick, label }: any) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={cn(
      "p-4 rounded-full transition-all duration-300 relative group",
      active ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "text-white/40 hover:text-white hover:bg-white/10"
    )}
  >
    <Icon className="h-6 w-6" />
    <span className="absolute left-full ml-4 px-3 py-1 rounded bg-cyan-500 text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
      {label}
    </span>
  </motion.button>
);

const PatientCard = () => (
  <HolographicCard className="p-0 overflow-hidden">
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600" />
          <div>
            <h4 className="text-xl font-bold">Mrs. Chen</h4>
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              Stable Monitoring
            </div>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
          ID: 2849
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric icon={Brain} value="84" label="Cognitive" color="text-purple-400" />
        <Metric icon={Activity} value="92%" label="Mobility" color="text-cyan-400" />
        <Metric icon={Smartphone} value="100%" label="Adherence" color="text-green-400" />
      </div>
    </div>
    
    <div className="bg-white/5 border-t border-white/10 p-4 flex justify-between items-center">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0a0e27] bg-white/20" />
        ))}
      </div>
      <button className="text-cyan-400 text-sm font-bold hover:underline">
        View Records →
      </button>
    </div>
  </HolographicCard>
);

const Metric = ({ icon: Icon, value, label, color }: any) => (
  <div className="text-center p-3 rounded-xl bg-white/5 border border-white/5">
    <Icon className={cn("h-5 w-5 mx-auto mb-2", color)} />
    <div className="text-xl font-bold">{value}</div>
    <div className="text-[10px] text-white/40 uppercase tracking-widest">{label}</div>
  </div>
);

const AlertCard = ({ patient, event, time, type }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "p-4 rounded-2xl border backdrop-blur-md transition-all",
      type === 'critical' ? "bg-red-500/10 border-red-500/30" : "bg-orange-500/10 border-orange-500/30"
    )}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        type === 'critical' ? "bg-red-500 text-white" : "bg-orange-500 text-white"
      )}>
        {type}
      </span>
      <span className="text-[10px] text-white/40">{time}</span>
    </div>
    <h5 className="font-bold">{patient}</h5>
    <p className="text-xs text-white/70">{event}</p>
    <div className="flex gap-2 mt-4">
      <button className="flex-1 py-2 rounded-lg bg-white/10 text-[10px] font-bold hover:bg-white/20 transition-all">
        DISMISS
      </button>
      <button className={cn(
        "flex-1 py-2 rounded-lg text-[10px] font-bold transition-all",
        type === 'critical' ? "bg-red-500 hover:bg-red-600" : "bg-orange-500 hover:bg-orange-600"
      )}>
        ACTION
      </button>
    </div>
  </motion.div>
);

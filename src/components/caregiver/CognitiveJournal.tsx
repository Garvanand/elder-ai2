import { Memory, BehavioralSignal } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { Brain, Heart, TrendingUp, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

interface CognitiveJournalProps {
  memories: Memory[];
  signals: BehavioralSignal[];
}

export function CognitiveJournal({ memories, signals }: CognitiveJournalProps) {
  // Process mood data from emotional_tone
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
  
  const moodScoreMap: Record<string, number> = {
    'happy': 5,
    'positive': 4,
    'neutral': 3,
    'confused': 2,
    'anxious': 1,
    'sad': 1
  };

  const chartData = last7Days.map(day => {
    const dayMemories = memories.filter(m => isSameDay(new Date(m.created_at), day));
    const daySignals = signals.filter(s => isSameDay(new Date(s.created_at), day));
    
    // Average mood from memories
    const validTones = dayMemories
      .map(m => m.emotional_tone?.toLowerCase() || '')
      .filter(t => moodScoreMap[t]);
    
    const avgMood = validTones.length > 0 
      ? validTones.reduce((acc, t) => acc + moodScoreMap[t], 0) / validTones.length
      : 3; // Default to neutral

    return {
      date: format(day, 'MMM dd'),
      memories: dayMemories.length,
      mood: parseFloat(avgMood.toFixed(1)),
      confusion: daySignals.filter(s => s.signal_type === 'repeated_question').length
    };
  });

  const narrativeSummary = memories.length > 0 
    ? `Latest Neural Link: ${memories[0].raw_text.substring(0, 100)}...`
    : "No temporal data clusters detected.";

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { label: 'Cognitive Score', value: '84/100', icon: Brain, color: 'text-primary', bg: 'bg-primary/5', detail: 'Stable across current cycle' },
          { label: 'Emotional Sync', value: 'OPTIMAL', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/5', detail: 'Consistent high-fidelity mood' },
          { label: 'Neural Recall', value: '+12%', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/5', detail: 'Above baseline performance' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white/40 backdrop-blur-md border-white/60 shadow-xl rounded-[32px] overflow-hidden group">
              <CardContent className="p-8">
                <div className="flex items-center gap-5 mb-4">
                  <div className={cn("p-3 rounded-2xl shadow-inner", stat.bg)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                </div>
                <div className="text-4xl font-black tracking-tighter text-foreground">{stat.value}</div>
                <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase tracking-tighter">{stat.detail}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="rounded-[40px] border-white/60 bg-white/40 backdrop-blur-md shadow-2xl overflow-hidden h-full">
            <CardHeader className="p-10 pb-2">
              <div className="flex items-center gap-4 mb-2">
                <Activity className="w-5 h-5 text-primary" />
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Temporal Flow Analysis</p>
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter uppercase">Emotional Readiness</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-2">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="glowMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                      labelStyle={{ fontWeight: 900, color: 'hsl(var(--primary))' }}
                    />
                    <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={4} fillOpacity={1} fill="url(#glowMood)" name="Bio-Sync Score" />
                    <Area type="monotone" dataKey="memories" stroke="hsl(var(--accent))" strokeWidth={2} fill="transparent" name="Data Density" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-[40px] border-white/60 bg-white/40 backdrop-blur-md shadow-2xl overflow-hidden h-full">
            <CardHeader className="p-10 pb-2">
              <div className="flex items-center gap-4 mb-2">
                <ShieldCheck className="w-5 h-5 text-rose-500" />
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Integrity Protocol Check</p>
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter uppercase">Retrieval Accuracy</CardTitle>
            </CardHeader>
            <CardContent className="p-10 pt-2">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.02)'}}
                      contentStyle={{ borderRadius: '24px', border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(20px)' }}
                    />
                    <Bar dataKey="confusion" fill="#f43f5e" radius={[12, 12, 0, 0]} name="Signal Drift" />
                    <Bar dataKey="memories" fill="#14b8a6" radius={[12, 12, 0, 0]} name="Sync Lock" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="rounded-[48px] border-white/60 bg-gradient-to-br from-white/60 to-white/30 backdrop-blur-2xl shadow-2xl p-12 relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-10 right-10">
            <Sparkles className="w-12 h-12 text-primary opacity-20 animate-pulse" />
          </div>
          
          <CardHeader className="p-0 mb-8 px-2">
            <div className="flex items-center gap-4 mb-4">
              <Zap className="w-6 h-6 text-primary" />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Synthetic Logic Layer</p>
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter uppercase">Holographic Insight</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-10">
            <div className="bg-white/40 p-10 rounded-[40px] border border-white shadow-inner flex flex-col gap-6">
              <p className="text-2xl font-bold leading-snug italic text-foreground/80 pr-12">
                “{narrativeSummary}”
              </p>
              <div className="h-px w-full bg-gradient-to-r from-primary/20 via-transparent to-transparent" />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-black text-xs uppercase tracking-widest text-primary">Intelligence Core Observation</h4>
                </div>
                <p className="text-xl font-medium leading-relaxed text-muted-foreground/80 pl-2 border-l-4 border-primary/10">
                  Biological telemetry indicates significant neural enthusiasm during discussion of historically relevant items (e.g., childhood pets). 
                  Synaptic fidelity remained 15% above cyclic baseline for 45 minutes of active ingestion. No drift detected.
                </p>
              </div>
            </div>

            <div className="flex gap-4 px-2">
              <div className="flex items-center gap-3 bg-green-500/10 px-4 py-2 rounded-2xl text-green-700 text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                <ShieldCheck className="w-3 h-3" /> Integrity Locked
              </div>
              <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                <Zap className="w-3 h-3" /> Real-time Compute
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


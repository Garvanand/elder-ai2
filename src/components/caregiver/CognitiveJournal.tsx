import { Memory, BehavioralSignal } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { Brain, Heart, TrendingUp, Sparkles, Activity, CheckCircle, Calendar } from 'lucide-react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CognitiveJournalProps {
  memories: Memory[];
  signals: BehavioralSignal[];
}

export function CognitiveJournal({ memories, signals }: CognitiveJournalProps) {
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
    
    const validTones = dayMemories
      .map(m => m.emotional_tone?.toLowerCase() || '')
      .filter(t => moodScoreMap[t]);
    
    const avgMood = validTones.length > 0 
      ? validTones.reduce((acc, t) => acc + moodScoreMap[t], 0) / validTones.length
      : 3;

    return {
      date: format(day, 'MMM dd'),
      memories: dayMemories.length,
      mood: parseFloat(avgMood.toFixed(1)),
      confusion: daySignals.filter(s => s.signal_type === 'repeated_question').length
    };
  });

  const narrativeSummary = memories.length > 0 
    ? `"${memories[0].raw_text.substring(0, 120)}..."`
    : "No stories shared yet today.";

  const totalMemories = memories.length;
  const happyMoments = memories.filter(m => m.emotional_tone === 'happy' || m.emotional_tone === 'positive').length;
  const moodPercentage = totalMemories > 0 ? Math.round((happyMoments / totalMemories) * 100) : 0;

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Overall Wellbeing', value: moodPercentage > 60 ? 'Good' : moodPercentage > 40 ? 'Okay' : 'Needs Care', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', desc: `${moodPercentage}% positive moments` },
          { label: 'Memory Activity', value: totalMemories, icon: Brain, color: 'text-indigo-500', bg: 'bg-indigo-50', desc: 'Stories shared this week' },
          { label: 'Engagement', value: chartData.reduce((a, d) => a + d.memories, 0) > 10 ? 'Active' : 'Moderate', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: 'Based on daily activity' }
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white border-0 shadow-md rounded-2xl overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-4 mb-3">
                  <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
                </div>
                <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-sm text-slate-500 mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="rounded-2xl border-0 bg-white shadow-md overflow-hidden h-full">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Mood Tracker</span>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">How They're Feeling</CardTitle>
              <CardDescription>Emotional wellbeing over the past week</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                    <YAxis domain={[0, 5]} hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number) => {
                        const labels = ['', 'Low', 'Confused', 'Neutral', 'Good', 'Great'];
                        return [labels[Math.round(value)] || 'Neutral', 'Mood'];
                      }}
                    />
                    <Area type="monotone" dataKey="mood" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#moodGradient)" name="Mood Score" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-0 bg-white shadow-md overflow-hidden h-full">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Daily Activity</span>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900">Stories & Interactions</CardTitle>
              <CardDescription>Number of memories shared each day</CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-2">
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                    <Tooltip 
                      cursor={{fill: 'rgba(0,0,0,0.02)'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="memories" fill="#10b981" radius={[6, 6, 0, 0]} name="Memories Shared" />
                    {signals.length > 0 && (
                      <Bar dataKey="confusion" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Confusion Moments" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="rounded-2xl border-0 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-md p-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-100 rounded-full blur-3xl opacity-50" />
          <div className="absolute top-6 right-6">
            <Sparkles className="w-8 h-8 text-indigo-300" />
          </div>
          
          <CardHeader className="p-0 mb-6">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <Brain className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wide">Latest Memory</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Recent Story</CardTitle>
            <CardDescription>The most recent thing they shared</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 space-y-6">
            <div className="bg-white/70 p-6 rounded-xl border border-white/80">
              <p className="text-lg text-slate-700 leading-relaxed italic">
                {narrativeSummary}
              </p>
            </div>
            
            {memories.length > 0 && memories[0].emotional_tone && (
              <div className="flex gap-3">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border",
                  memories[0].emotional_tone === 'happy' || memories[0].emotional_tone === 'positive' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : memories[0].emotional_tone === 'sad' || memories[0].emotional_tone === 'anxious'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                )}>
                  <Heart className="w-4 h-4" />
                  Feeling: {memories[0].emotional_tone}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  {format(new Date(memories[0].created_at), 'MMM d, h:mm a')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

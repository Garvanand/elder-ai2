import { useState, useMemo, useEffect } from 'react';
import { 
  Brain, LogOut, Calendar, Tag, Filter, MessageCircle, 
  Clock, User, Heart, Pill, Star, HelpCircle, 
  TrendingUp, Search, PlusCircle, ArrowUpRight, AlertTriangle,
  BookOpen, UserCircle, CalendarDays, Settings, Activity, Sparkles, Globe, Zap, Database, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Memory, Question, BehavioralSignal, MemoryType } from '@/types';
import { format } from 'date-fns';
import CaregiverInsights from './CaregiverInsights';
import CaregiverSignals from './CaregiverSignals';
import { CognitiveJournal } from './CognitiveJournal';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainModelContainer } from '@/components/BrainModel';
import { cn } from '@/lib/utils';
import { generateCaregiverDailySummary } from '@/lib/ai';

interface CaregiverDashboardProps {
  memories: Memory[];
  questions: Question[];
  signals: BehavioralSignal[];
  onRefresh: (silent?: boolean) => void;
}

const memoryTypeColors: Record<MemoryType, string> = {
  story: 'bg-blue-500 text-white',
  person: 'bg-purple-500 text-white',
  event: 'bg-emerald-500 text-white',
  medication: 'bg-rose-500 text-white',
  routine: 'bg-amber-500 text-white',
  preference: 'bg-indigo-500 text-white',
  other: 'bg-slate-500 text-white'
};

const memoryTypeIcons: Record<MemoryType, React.ReactNode> = {
  story: <Star className="w-3.5 h-3.5" />,
  person: <User className="w-3.5 h-3.5" />,
  event: <Calendar className="w-3.5 h-3.5" />,
  medication: <Pill className="w-3.5 h-3.5" />,
  routine: <Clock className="w-3.5 h-3.5" />,
  preference: <Heart className="w-3.5 h-3.5" />,
  other: <HelpCircle className="w-3.5 h-3.5" />
};

export default function CaregiverDashboard({ memories, questions, signals, onRefresh }: CaregiverDashboardProps) {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'memories' | 'questions' | 'journal'>('overview');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailySummary, setDailySummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  useEffect(() => {
    async function fetchSummary() {
      if (memories.length > 0) {
        setLoadingSummary(true);
        const summary = await generateCaregiverDailySummary(memories[0].elder_id);
        setDailySummary(summary);
        setLoadingSummary(false);
      }
    }
    fetchSummary();
  }, [memories]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    memories.forEach(m => m.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (tagFilter && !m.tags?.includes(tagFilter)) return false;
      if (searchQuery && !m.raw_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [memories, typeFilter, tagFilter, searchQuery]);

  const groupedMemories = useMemo(() => {
    const groups: Record<string, Memory[]> = {};
    filteredMemories.forEach(m => {
      const date = format(new Date(m.created_at), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return groups;
  }, [filteredMemories]);

  return (
    <div className="space-y-12 max-w-7xl mx-auto pt-24 pb-20 px-6">
      {/* Header Info */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4 relative">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4 z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              <ShieldCheck className="w-3 h-3" /> Collective Intelligence Active
            </div>
            <h1 className="text-6xl font-black tracking-tighter">Observatory Hub</h1>
            <p className="text-xl text-muted-foreground font-medium italic">"Monitoring the temporal health of your lineage."</p>
          </motion.div>
          
          {/* 3D Brain Background Integration */}
          <div className="absolute top-[-100px] left-[300px] w-[600px] h-[400px] opacity-40 pointer-events-none">
            <BrainModelContainer />
          </div>

          <div className="flex items-center gap-4 bg-white/40 backdrop-blur-3xl p-4 rounded-3xl border border-white shadow-2xl z-10">

          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <UserCircle className="w-7 h-7 text-white" />
          </div>
          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-tighter text-muted-foreground opacity-60">Operations Officer</p>
            <p className="text-lg font-bold truncate max-w-[150px]">{profile?.full_name}</p>
          </div>
        </div>
      </div>

      {/* Futuristic Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Brain, label: 'Memory Bank', value: memories.length, color: 'text-primary', bg: 'bg-primary/5' },
          { icon: MessageCircle, label: 'Retrieval Logs', value: questions.length, color: 'text-accent', bg: 'bg-accent/5' },
          { icon: Activity, label: 'Bio-Telemetry', value: signals.length, color: 'text-rose-500', bg: 'bg-rose-500/5' },
          { icon: Tag, label: 'Neural Tags', value: allTags.length, color: 'text-purple-500', bg: 'bg-purple-500/5' }
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
          >
            <Card className="bg-white/40 backdrop-blur-3xl border border-white/40 shadow-xl rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-all">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", stat.bg)}>
                    <stat.icon className={cn("w-8 h-8", stat.color)} />
                  </div>
                  <div>
                    <p className="text-3xl font-black tracking-tighter text-foreground">{stat.value}</p>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Interface */}
      <div className="bg-white/30 backdrop-blur-3xl rounded-[48px] border border-white/40 p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
            {[
              { id: 'overview', label: 'Dashboard', icon: Globe },
              { id: 'journal', label: 'Cognitive Log', icon: BookOpen },
              { id: 'signals', label: 'Anomalies', icon: AlertTriangle, count: signals.length },
              { id: 'memories', label: 'Archive Bank', icon: Database },
              { id: 'questions', label: 'Neural Logs', icon: Zap }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 shrink-0",
                  activeTab === tab.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/25 scale-105" 
                    : "bg-white/40 border border-white hover:bg-white/60"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 bg-rose-500 text-[10px] rounded-full animate-pulse ml-1 shadow-lg">
                    {tab.count}
                  </span>
                )}
              </Button>
            ))}
        </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                
                {/* AI Daily Summary Card */}
                <Card className="bg-primary/5 border-primary/20 shadow-xl rounded-[40px] overflow-hidden">
                  <CardHeader className="bg-primary/10 border-b border-primary/10 p-8 flex flex-row items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">Intelligence Protocol</p>
                      <CardTitle className="text-3xl font-black uppercase tracking-tighter">Daily Neural Synthesis</CardTitle>
                    </div>
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </CardHeader>
                  <CardContent className="p-10">
                    {loadingSummary ? (
                      <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 rounded-full bg-primary/20" />
                        <div className="space-y-2">
                          <div className="h-4 w-64 bg-primary/10 rounded" />
                          <div className="h-4 w-48 bg-primary/10 rounded" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative p-8 bg-white/40 rounded-3xl border border-white shadow-inner">
                        <p className="text-2xl font-bold leading-relaxed text-foreground/80 italic whitespace-pre-line">
                          {dailySummary || "Awaiting more data fragments to complete synthesis."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <CaregiverInsights memories={memories} />

              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section className="space-y-6">
                  <div className="flex items-center justify-between ml-2">
                    <h3 className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-3">
                      <Clock className="w-6 h-6 text-primary" />
                      Neural Activity Stream
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {memories.slice(0, 5).map(memory => (
                      <motion.div 
                        whileHover={{ x: 5 }}
                        key={memory.id} 
                        className="p-6 rounded-[32px] bg-white/50 border border-white/60 shadow-xl hover:shadow-2xl transition-all"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className={cn("p-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2", memoryTypeColors[memory.type])}>
                            {memoryTypeIcons[memory.type]} {memory.type}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                            Archived {format(new Date(memory.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-lg font-bold leading-snug text-foreground/80 italic">“{memory.raw_text.slice(0, 160)}...”</p>
                      </motion.div>
                    ))}
                    {memories.length === 0 && (
                      <div className="p-12 text-center bg-white/20 rounded-[40px] border border-dashed border-white/40">
                        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs italic opacity-50">No temporal fragments detected.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                    <Database className="w-6 h-6 text-accent" />
                    Archive Indexer
                  </h3>
                  <div className="bg-white/40 backdrop-blur-xl p-10 rounded-[40px] border border-white shadow-inner">
                    <div className="flex flex-wrap gap-3">
                      {allTags.map(tag => (
                        <span key={tag} className="px-5 py-3 rounded-2xl bg-white/60 text-primary text-xs font-black uppercase tracking-widest border border-white shadow-sm hover:bg-primary hover:text-white transition-all cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                      {allTags.length === 0 && (
                        <div className="text-center w-full py-10">
                          <p className="text-muted-foreground font-black uppercase tracking-widest text-xs opacity-50 italic">Indexing system idle.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div key="journal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="animate-slide-up">
              <CognitiveJournal memories={memories} signals={signals} />
            </motion.div>
          )}

          {activeTab === 'signals' && (
            <motion.div key="signals" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <CaregiverSignals signals={signals} onRefresh={() => onRefresh(true)} />
            </motion.div>
          )}

          {activeTab === 'memories' && (
            <motion.div key="memories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              <div className="flex flex-col md:flex-row gap-6 p-8 rounded-[40px] bg-white/20 border border-white shadow-xl backdrop-blur-md">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
                  <Input
                    placeholder="Search neural bank..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 bg-white/50 border-white rounded-2xl text-lg font-bold"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-6 h-14 rounded-2xl border border-white bg-white/50 text-xs font-black uppercase tracking-widest focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="all">Protocol: All</option>
                    <option value="story">Fragment: Story</option>
                    <option value="person">Neural: Person</option>
                    <option value="event">Temporal: Event</option>
                  </select>
                </div>
              </div>

              <div className="space-y-16">
                {Object.entries(groupedMemories)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dayMemories], i) => (
                    <div key={date} className="relative pl-12 border-l-2 border-white/20">
                      <div className="absolute left-[-11px] top-2 w-5 h-5 rounded-full bg-primary ring-8 ring-primary/5 shadow-lg" />
                      
                      <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 text-primary flex items-center gap-4">
                        <CalendarDays className="w-6 h-6" />
                        Temporal Block: {format(new Date(date), 'MMMM dd, yyyy')}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {dayMemories.map(memory => (
                          <Card key={memory.id} className="group hover:bg-white/80 transition-all duration-500 border-white/60 bg-white/40 backdrop-blur-md shadow-xl rounded-[32px] overflow-hidden">
                            <CardContent className="p-0">
                              <div className={cn("h-2 w-full", memoryTypeColors[memory.type].split(' ')[0])} />
                              <div className="p-8">
                                <div className="flex items-center gap-3 mb-6">
                                  <span className={cn("p-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2", memoryTypeColors[memory.type])}>
                                    {memoryTypeIcons[memory.type]} {memory.type}
                                  </span>
                                  <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/50">
                                    Log: {format(new Date(memory.created_at), 'h:mm a')}
                                  </span>
                                </div>
                                <p className="text-xl font-bold leading-tight text-foreground/80 italic group-hover:text-foreground transition-colors">“{memory.raw_text}”</p>
                                {memory.tags && memory.tags.length > 0 && (
                                  <div className="mt-8 flex flex-wrap gap-2">
                                    {memory.tags.map(tag => (
                                      <span key={tag} className="text-[10px] px-3 py-1.5 rounded-xl bg-primary/5 text-primary font-black uppercase tracking-widest border border-primary/10">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {questions.map(q => (
                <Card key={q.id} className="border-white/60 bg-white/30 backdrop-blur-md shadow-xl rounded-[40px] overflow-hidden hover:bg-white/50 transition-all">
                  <CardHeader className="p-10 pb-6 border-b border-white/20">
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center shadow-inner">
                          <Zap className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Query Protocol Trace</p>
                          <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{q.question_text}</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50 pt-2 tracking-widest">
                        Data Cycle: {format(new Date(q.created_at), 'MM/dd')}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 pt-8">
                    {q.answer_text ? (
                      <div className="relative p-8 rounded-[32px] bg-white/40 border border-white shadow-inner">
                        <p className="text-xl font-bold leading-relaxed text-foreground/90 italic">“{q.answer_text}”</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 text-rose-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse p-6 bg-rose-500/5 rounded-3xl border border-rose-500/20">
                        <Activity className="w-5 h-5" />
                        Awaiting Bio-Response Connection...
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {questions.length === 0 && (
                <div className="p-20 text-center bg-white/20 rounded-[60px] border border-dashed border-white/40">
                  <HelpCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-sm opacity-50 italic">No retrieval queries indexed.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


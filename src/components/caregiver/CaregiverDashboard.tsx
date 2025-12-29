import { useState, useMemo, useEffect } from 'react';
import { 
  Brain, LogOut, Calendar, Tag, Filter, MessageCircle, 
  Clock, User, Heart, Pill, Star, HelpCircle, 
  TrendingUp, Search, PlusCircle, ArrowUpRight, AlertTriangle,
  BookOpen, UserCircle, CalendarDays, Settings, Activity, Sparkles, 
  Phone, Bell, CheckCircle, Send, Camera, Mic, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Memory, Question, BehavioralSignal, MemoryType } from '@/types';
import { format } from 'date-fns';
import CaregiverInsights from './CaregiverInsights';
import CaregiverSignals from './CaregiverSignals';
import { CognitiveJournal } from './CognitiveJournal';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { generateCaregiverDailySummary } from '@/lib/ai';
import { toast } from 'sonner';

interface CaregiverDashboardProps {
  memories: Memory[];
  questions: Question[];
  signals: BehavioralSignal[];
  onRefresh: (silent?: boolean) => void;
}

const memoryTypeColors: Record<MemoryType, string> = {
  story: 'bg-blue-100 text-blue-700 border-blue-200',
  person: 'bg-purple-100 text-purple-700 border-purple-200',
  event: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medication: 'bg-rose-100 text-rose-700 border-rose-200',
  routine: 'bg-amber-100 text-amber-700 border-amber-200',
  preference: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200'
};

const memoryTypeIcons: Record<MemoryType, React.ReactNode> = {
  story: <Star className="w-4 h-4" />,
  person: <User className="w-4 h-4" />,
  event: <Calendar className="w-4 h-4" />,
  medication: <Pill className="w-4 h-4" />,
  routine: <Clock className="w-4 h-4" />,
  preference: <Heart className="w-4 h-4" />,
  other: <HelpCircle className="w-4 h-4" />
};

const friendlyTypeNames: Record<MemoryType, string> = {
  story: 'Story',
  person: 'Family/Friend',
  event: 'Life Event',
  medication: 'Health Note',
  routine: 'Daily Routine',
  preference: 'Favorite Thing',
  other: 'Memory'
};

export default function CaregiverDashboard({ memories, questions, signals, onRefresh }: CaregiverDashboardProps) {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'memories' | 'questions' | 'journal' | 'communicate'>('overview');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dailySummary, setDailySummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [messageToElder, setMessageToElder] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminderTime, setReminderTime] = useState('');

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

  const handleSendReminder = async () => {
    if (!reminderText.trim()) {
      toast.error('Please enter a reminder message');
      return;
    }
    
    try {
      const elderId = memories[0]?.elder_id;
      if (!elderId) {
        toast.error('No elder connected');
        return;
      }

      const { error } = await supabase.from('reminders').insert({
        elder_id: elderId,
        title: reminderText,
        scheduled_time: reminderTime || new Date().toISOString(),
        is_recurring: false,
        status: 'pending'
      });

      if (error) throw error;
      
      toast.success('Reminder sent successfully!');
      setReminderText('');
      setReminderTime('');
    } catch (err) {
      console.error('Error sending reminder:', err);
      toast.error('Could not send reminder');
    }
  };

  const handleSendMessage = async () => {
    if (!messageToElder.trim()) return;
    setSendingMessage(true);
    
    try {
      const elderId = memories[0]?.elder_id;
      if (!elderId) {
        toast.error('No elder connected');
        return;
      }

      const { error } = await supabase.from('activity_logs').insert({
        elder_id: elderId,
        activity_type: 'caregiver_message',
        description: messageToElder,
        metadata: { from: profile?.full_name || 'Caregiver' }
      });

      if (error) throw error;
      
      toast.success('Message sent to your loved one!');
      setMessageToElder('');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Could not send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const recentMoodTrend = useMemo(() => {
    const moods = memories.slice(0, 10).map(m => m.emotional_tone).filter(Boolean);
    const happy = moods.filter(m => m === 'happy' || m === 'positive').length;
    const sad = moods.filter(m => m === 'sad' || m === 'anxious').length;
    if (happy > sad + 2) return { status: 'Great', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    if (sad > happy + 2) return { status: 'Needs Attention', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { status: 'Stable', color: 'text-blue-600', bg: 'bg-blue-50' };
  }, [memories]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div data-tour="caregiver-header" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Heart className="w-3.5 h-3.5" /> Family Care Dashboard
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Welcome back, {profile?.full_name?.split(' ')[0] || 'Caregiver'}</h1>
          <p className="text-slate-500">Here's how your loved one is doing today</p>
        </motion.div>
        
        <Card className="bg-white shadow-lg border-0 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserCircle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Logged in as</p>
              <p className="font-semibold text-slate-900">{profile?.full_name}</p>
            </div>
          </div>
        </Card>
      </div>

      <div data-tour="caregiver-stats" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Memories Saved', value: memories.length, color: 'text-primary', bg: 'bg-primary/10', desc: 'Stories & moments' },
          { icon: MessageCircle, label: 'Questions Asked', value: questions.length, color: 'text-violet-600', bg: 'bg-violet-50', desc: 'Things they wondered' },
          { icon: AlertTriangle, label: 'Alerts', value: signals.length, color: signals.length > 0 ? 'text-amber-600' : 'text-emerald-600', bg: signals.length > 0 ? 'bg-amber-50' : 'bg-emerald-50', desc: signals.length > 0 ? 'Needs attention' : 'All good!' },
          { icon: Heart, label: 'Mood Today', value: recentMoodTrend.status, color: recentMoodTrend.color, bg: recentMoodTrend.bg, desc: 'Overall wellbeing' }
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
          >
            <Card className="bg-white shadow-md border-0 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-lg border-0 p-6">
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'communicate', label: 'Send Message', icon: Send },
            { id: 'journal', label: 'Health Journal', icon: BookOpen },
            { id: 'signals', label: 'Alerts', icon: Bell, count: signals.length },
            { id: 'memories', label: 'All Memories', icon: Star },
            { id: 'questions', label: 'Questions Asked', icon: HelpCircle }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "rounded-xl h-11 px-5 font-medium text-sm transition-all flex items-center gap-2",
                activeTab === tab.id 
                  ? "bg-primary text-white shadow-md" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="flex items-center justify-center w-5 h-5 bg-amber-500 text-white text-[10px] font-bold rounded-full ml-1">
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <Card className="bg-gradient-to-br from-primary/5 to-violet-50 border-0 shadow-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-primary mb-1">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">AI Summary</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900">Today's Update</CardTitle>
                  <CardDescription>A brief summary of your loved one's day</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  {loadingSummary ? (
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-primary/20" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-primary/10 rounded" />
                        <div className="h-4 w-1/2 bg-primary/10 rounded" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 bg-white/60 rounded-xl border border-white/80">
                      <p className="text-lg text-slate-700 leading-relaxed">
                        {dailySummary || "No activity recorded yet today. Check back later for updates!"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white border-0 shadow-md rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-amber-500" />
                      <CardTitle className="text-lg font-bold">Quick Reminder</CardTitle>
                    </div>
                    <CardDescription>Send a gentle reminder to your loved one</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="e.g., Take your medication at 2pm"
                      value={reminderText}
                      onChange={(e) => setReminderText(e.target.value)}
                      className="rounded-xl border-slate-200 h-12"
                    />
                    <Input
                      type="datetime-local"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="rounded-xl border-slate-200 h-12"
                    />
                    <Button 
                      onClick={handleSendReminder}
                      className="w-full h-12 rounded-xl font-semibold"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Reminder
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white border-0 shadow-md rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-emerald-500" />
                      <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                    </div>
                    <CardDescription>Common tasks at your fingertips</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="h-20 rounded-xl flex-col gap-2 hover:bg-primary/5 hover:border-primary/30">
                      <Phone className="w-6 h-6 text-emerald-500" />
                      <span className="text-xs font-medium">Video Call</span>
                    </Button>
                    <Button variant="outline" className="h-20 rounded-xl flex-col gap-2 hover:bg-primary/5 hover:border-primary/30">
                      <Camera className="w-6 h-6 text-blue-500" />
                      <span className="text-xs font-medium">View Photos</span>
                    </Button>
                    <Button variant="outline" className="h-20 rounded-xl flex-col gap-2 hover:bg-primary/5 hover:border-primary/30">
                      <Pill className="w-6 h-6 text-rose-500" />
                      <span className="text-xs font-medium">Medications</span>
                    </Button>
                    <Button variant="outline" className="h-20 rounded-xl flex-col gap-2 hover:bg-primary/5 hover:border-primary/30">
                      <CalendarDays className="w-6 h-6 text-violet-500" />
                      <span className="text-xs font-medium">Schedule</span>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <CaregiverInsights memories={memories} />

              <section className="space-y-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Memories
                </h3>
                <div className="grid gap-4">
                  {memories.slice(0, 5).map(memory => (
                    <motion.div 
                      whileHover={{ x: 3 }}
                      key={memory.id} 
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border", memoryTypeColors[memory.type])}>
                          {memoryTypeIcons[memory.type]} {friendlyTypeNames[memory.type]}
                        </span>
                        <span className="text-xs text-slate-400">
                          {format(new Date(memory.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">"{memory.raw_text.slice(0, 200)}{memory.raw_text.length > 200 ? '...' : ''}"</p>
                      {memory.tags && memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {memory.tags.map(tag => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {memories.length === 0 && (
                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No memories recorded yet. They'll appear here as your loved one shares stories.</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'communicate' && (
            <motion.div key="communicate" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-md rounded-2xl">
                <CardHeader>
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <Heart className="w-5 h-5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Stay Connected</span>
                  </div>
                  <CardTitle className="text-2xl font-bold text-slate-900">Send a Loving Message</CardTitle>
                  <CardDescription>Your message will be read aloud to your loved one with a warm tone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Write something heartfelt... e.g., 'Hi Mom! Just wanted to say I love you and I'm thinking of you today. The kids say hi too!'"
                    value={messageToElder}
                    onChange={(e) => setMessageToElder(e.target.value)}
                    className="min-h-[150px] rounded-xl border-emerald-200 bg-white/80 text-lg"
                  />
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageToElder.trim()}
                      className="flex-1 h-14 rounded-xl font-semibold text-lg bg-emerald-600 hover:bg-emerald-700"
                    >
                      {sendingMessage ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="h-14 w-14 rounded-xl border-emerald-200">
                      <Mic className="w-6 h-6 text-emerald-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-24 rounded-2xl flex-col gap-2 bg-white hover:bg-blue-50 border-slate-200">
                  <span className="text-3xl">👋</span>
                  <span className="font-medium text-slate-700">Quick "Hello!"</span>
                </Button>
                <Button variant="outline" className="h-24 rounded-2xl flex-col gap-2 bg-white hover:bg-rose-50 border-slate-200">
                  <span className="text-3xl">❤️</span>
                  <span className="font-medium text-slate-700">"I Love You"</span>
                </Button>
                <Button variant="outline" className="h-24 rounded-2xl flex-col gap-2 bg-white hover:bg-amber-50 border-slate-200">
                  <span className="text-3xl">🌅</span>
                  <span className="font-medium text-slate-700">"Good Morning!"</span>
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'journal' && (
            <motion.div key="journal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <CognitiveJournal memories={memories} signals={signals} />
            </motion.div>
          )}

          {activeTab === 'signals' && (
            <motion.div key="signals" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <CaregiverSignals signals={signals} onRefresh={() => onRefresh(true)} />
            </motion.div>
          )}

          {activeTab === 'memories' && (
            <motion.div key="memories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-12 bg-white border-slate-200 rounded-xl text-base"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 h-12 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:ring-primary/20 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="story">Stories</option>
                  <option value="person">Family & Friends</option>
                  <option value="event">Life Events</option>
                  <option value="medication">Health Notes</option>
                  <option value="routine">Daily Routines</option>
                  <option value="preference">Favorites</option>
                </select>
              </div>

              <div className="space-y-8">
                {Object.entries(groupedMemories)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dayMemories]) => (
                    <div key={date} className="relative pl-8 border-l-2 border-primary/20">
                      <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/10" />
                      
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                      </h3>
                      
                      <div className="grid gap-4">
                        {dayMemories.map(memory => (
                          <Card key={memory.id} className="border-slate-100 bg-white shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                              <div className="flex items-center gap-3 mb-3">
                                <span className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border", memoryTypeColors[memory.type])}>
                                  {memoryTypeIcons[memory.type]} {friendlyTypeNames[memory.type]}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {format(new Date(memory.created_at), 'h:mm a')}
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">"{memory.raw_text}"</p>
                              {memory.tags && memory.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {memory.tags.map(tag => (
                                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
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
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <p className="text-slate-500 mb-6">These are questions your loved one asked the AI assistant. They help us understand what's on their mind.</p>
              
              {questions.map(q => (
                <Card key={q.id} className="border-slate-100 bg-white shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-5 h-5 text-violet-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{q.question_text}</h4>
                          <span className="text-xs text-slate-400">
                            {format(new Date(q.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        {q.answer_text ? (
                          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-slate-600">{q.answer_text}</p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-600 text-sm">
                            <Activity className="w-4 h-4 animate-pulse" />
                            Waiting for response...
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {questions.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No questions asked yet. When your loved one asks something, it will appear here.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

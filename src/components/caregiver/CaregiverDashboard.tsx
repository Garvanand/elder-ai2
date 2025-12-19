import { useState, useMemo, useEffect } from 'react';
import { 
  Brain, LogOut, Calendar, Tag, Filter, MessageCircle, 
  Clock, User, Heart, Pill, Star, HelpCircle, 
  TrendingUp, Search, PlusCircle, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Memory, Question, BehavioralSignal } from '@/types';
import { format } from 'date-fns';
import CaregiverInsights from './CaregiverInsights';
import CaregiverSignals from './CaregiverSignals';

interface CaregiverDashboardProps {
  memories: Memory[];
  questions: Question[];
  signals: BehavioralSignal[];
  onRefresh: () => void;
}

const memoryTypeIcons: Record<string, React.ReactNode> = {
  story: <Star className="w-5 h-5" />,
  person: <User className="w-5 h-5" />,
  event: <Calendar className="w-5 h-5" />,
  medication: <Pill className="w-5 h-5" />,
  routine: <Clock className="w-5 h-5" />,
  preference: <Heart className="w-5 h-5" />,
  other: <HelpCircle className="w-5 h-5" />,
};

const memoryTypeColors: Record<string, string> = {
  story: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  person: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  event: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  medication: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  routine: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  preference: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

export default function CaregiverDashboard({ memories, questions, onRefresh }: CaregiverDashboardProps) {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'signals' | 'memories' | 'questions'>('overview');
  const [signals, setSignals] = useState<BehavioralSignal[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSignals();
  }, [profile]);

  const fetchSignals = async () => {
    if (!profile?.elder_id) return;
    const { data } = await supabase
      .from('behavioral_signals')
      .select('*')
      .eq('elder_id', profile.elder_id)
      .order('created_at', { ascending: false });
    
    if (data) setSignals(data as BehavioralSignal[]);
  };

  // Get unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    memories.forEach(m => m.tags?.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [memories]);

  // Filter memories
  const filteredMemories = useMemo(() => {
    return memories.filter(m => {
      if (typeFilter !== 'all' && m.type !== typeFilter) return false;
      if (tagFilter && !m.tags?.includes(tagFilter)) return false;
      if (searchQuery && !m.raw_text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [memories, typeFilter, tagFilter, searchQuery]);

  // Group memories by date
  const groupedMemories = useMemo(() => {
    const groups: Record<string, Memory[]> = {};
    filteredMemories.forEach(m => {
      const date = format(new Date(m.created_at), 'yyyy-MM-dd');
      if (!groups[date]) groups[date] = [];
      groups[date].push(m);
    });
    return groups;
  }, [filteredMemories]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/10 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{memories.length}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/10 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{questions.length}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/10 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">
                  {Object.keys(groupedMemories).length}
                </p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Days Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 to-purple-500/10 border-purple-500/10 shadow-soft">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight">{allTags.length}</p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Unique Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-white/20 p-8 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl h-12 px-6 ${activeTab === 'overview' ? 'shadow-button' : ''}`}
            >
              <Star className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'signals' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('signals')}
              className={`rounded-xl h-12 px-6 ${activeTab === 'signals' ? 'shadow-button' : ''}`}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Signals
              {signals.length > 0 && (
                <span className="ml-2 flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </Button>
            <Button
              variant={activeTab === 'memories' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('memories')}
              className={`rounded-xl h-12 px-6 ${activeTab === 'memories' ? 'shadow-button' : ''}`}
            >
              <Brain className="w-4 h-4 mr-2" />
              Memories
            </Button>

          <Button
            variant={activeTab === 'questions' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('questions')}
            className={`rounded-xl h-12 px-6 ${activeTab === 'questions' ? 'shadow-button' : ''}`}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Questions
          </Button>
        </div>

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-slide-up">
              <CaregiverInsights memories={memories} />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                      <Clock className="w-5 h-5" />
                      Recent Activity
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('memories')} className="text-primary hover:text-primary/80">
                      View all <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {memories.slice(0, 4).map(memory => (
                      <div key={memory.id} className="p-4 rounded-2xl bg-white/60 border border-primary/5 shadow-sm hover:shadow-md transition-all hover:translate-x-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`p-1.5 rounded-lg ${memoryTypeColors[memory.type]}`}>
                            {memoryTypeIcons[memory.type]}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {format(new Date(memory.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2 font-medium">{memory.raw_text}</p>
                      </div>
                    ))}
                    {memories.length === 0 && (
                      <div className="p-8 text-center bg-white/40 rounded-2xl border border-dashed border-primary/20">
                        <p className="text-muted-foreground italic">No memories captured yet.</p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-accent-foreground">
                    <Tag className="w-5 h-5" />
                    Popular Topics
                  </h3>
                  <div className="bg-white/40 backdrop-blur-sm p-6 rounded-2xl border border-primary/5">
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <span key={tag} className="px-4 py-2 rounded-xl bg-primary/5 text-primary text-sm font-semibold border border-primary/10 hover:bg-primary/10 transition-colors cursor-default">
                          #{tag}
                        </span>
                      ))}
                      {allTags.length === 0 && (
                        <div className="text-center w-full py-4">
                          <p className="text-muted-foreground italic">No topics identified yet.</p>
                          <p className="text-xs text-muted-foreground mt-1">Tags will appear as memories are added.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'signals' && (
            <div className="animate-slide-up">
              <CaregiverSignals signals={signals} onRefresh={fetchSignals} />
            </div>
          )}


        {activeTab === 'memories' && (
          <div className="animate-slide-up">
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 rounded-2xl bg-muted/30">
              <div className="flex-1">
                <Input
                  placeholder="Search memories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-xl border-white/40 bg-white/50 h-11"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 h-11 rounded-xl border border-white/40 bg-white/50 text-sm focus:ring-primary/20"
                >
                  <option value="all">All Types</option>
                  <option value="story">Stories</option>
                  <option value="person">People</option>
                  <option value="event">Events</option>
                </select>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-4 h-11 rounded-xl border border-white/40 bg-white/50 text-sm focus:ring-primary/20"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-12">
              {Object.entries(groupedMemories)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, dayMemories]) => (
                  <div key={date} className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-transparent to-transparent" />
                    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-primary ring-4 ring-primary/10" />
                    
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                      {format(new Date(date), 'EEEE, MMMM d')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dayMemories.map(memory => (
                        <Card key={memory.id} className="group hover:scale-[1.02] transition-all duration-300 border-primary/5 shadow-sm overflow-hidden">
                          <CardContent className="p-0">
                            <div className={`h-1.5 w-full ${memoryTypeColors[memory.type].split(' ')[0]}`} />
                            <div className="p-5">
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`p-1 rounded-lg ${memoryTypeColors[memory.type]}`}>
                                  {memoryTypeIcons[memory.type]}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                  {memory.type} • {format(new Date(memory.created_at), 'h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/80">{memory.raw_text}</p>
                              {memory.tags && memory.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-1.5">
                                  {memory.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
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
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-4 animate-slide-up">
            {questions.map(q => (
              <Card key={q.id} className="border-primary/5 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/5 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageCircle className="w-4 h-4 text-primary" />
                      </div>
                      {q.question_text}
                    </CardTitle>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap pt-2">
                      {format(new Date(q.created_at), 'MMM d')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-5">
                  {q.answer_text ? (
                    <div className="relative pl-6">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 rounded-full" />
                      <p className="text-sm leading-relaxed text-foreground/90 font-medium italic">"{q.answer_text}"</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground italic text-sm">
                      <Clock className="w-4 h-4" />
                      Awaiting answer from elder...
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

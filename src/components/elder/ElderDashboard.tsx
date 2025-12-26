import { useEffect, useState } from 'react';
import { Plus, MessageCircleQuestion, History, LogOut, Brain, Clock, CheckCircle2, ListTodo, Mic, MicOff, Volume2, VolumeX, Image as ImageIcon, Sparkles, Zap, ShieldCheck, ArrowRight, Users, AlertCircle, Gamepad2, CalendarDays, Settings, Type, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSpeech } from '@/hooks/useSpeech';
import { supabase } from '@/integrations/supabase/client';
import { extractMemoryIntelligence, answerQuestion, generateWeeklyRecap } from '@/lib/ai';
import type { Question, Routine, Reminder, Memory } from '@/types';
import { format } from 'date-fns';
import { MemoryWall } from './MemoryWall';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainModelContainer } from '@/components/BrainModel';
import { cn } from '@/lib/utils';
import { PeopleScanner } from './PeopleScanner';
import { generateAdaptiveQuestion } from '@/lib/ai';
import { PanicButton } from './PanicButton';
import { MemoryMatchingGame } from './CognitiveGames';
import { MemoryTimeline } from './MemoryTimeline';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ElderDashboardProps {
  recentQuestions: Question[];
  onRefresh: (silent?: boolean) => void;
}

export default function ElderDashboard({ recentQuestions, onRefresh }: ElderDashboardProps) {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
    const { isListening, isSpeaking, supported, startListening, speak, stopSpeaking } = useSpeech();
    const [view, setView] = useState<'home' | 'addMemory' | 'askQuestion' | 'recap' | 'routines' | 'memoryWall' | 'peopleScanner' | 'matchingGame' | 'lifeTimeline' | 'settings'>('home');
    const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('large');
    const [highContrast, setHighContrast] = useState(false);
    const [memoryText, setMemoryText] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [adaptiveQuestion, setAdaptiveQuestion] = useState('');

  const [answer, setAnswer] = useState('');
  const [recap, setRecap] = useState('');
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const handleTriggerConversation = (memory: Memory) => {
    setQuestionText(`Tell me more about ${memory.raw_text}`);
    setView('askQuestion');
  };

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('elder_id', user.id)
      .gte('due_at', today.toISOString())
      .lt('due_at', tomorrow.toISOString())
      .order('due_at', { ascending: true });
    
    if (data) setReminders(data as Reminder[]);
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      fetchReminders();
      toast({ title: "Task Optimized!", description: "Daily routine synchronized." });
    } catch (error) {
      toast({ title: "Error", description: "Could not sync routine.", variant: "destructive" });
    }
  };

  const handleAddMemory = async () => {
    if (!memoryText.trim() || !user) return;
    
    setLoading(true);
    try {
      const intel = await extractMemoryIntelligence(memoryText);
      const { error } = await supabase
        .from('memories')
        .insert({
          elder_id: user.id,
          raw_text: memoryText,
          type: intel.type as any,
          tags: intel.tags,
          structured_json: intel.structured,
          emotional_tone: intel.emotional_tone,
          confidence_score: intel.confidence_score,
        });

        if (error) throw error;

        // Generate adaptive question
        const adaptive = await generateAdaptiveQuestion(memoryText, user.id);
        setAdaptiveQuestion(adaptive);

        toast({
          title: 'Neural Link Established!',
          description: 'Memory successfully archived in secure storage.',
        });
        
        setMemoryText('');

      setView('home');
      onRefresh(true);
    } catch (error) {
      console.error('Error saving memory:', error);
      toast({
        title: 'Sync Failed',
        description: 'Connection interrupted. Please retry.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowRecap = async () => {
    if (!user) return;
    setLoading(true);
    setView('recap');
    try {
      const text = await generateWeeklyRecap(user.id);
      setRecap(text);
    } catch (error) {
      setRecap("Your recent temporal data signals show strong positive engagement! You've shared many valuable stories.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim() || !user) return;
    
    setLoading(true);
    setAnswer('');
    
    try {
        const response = await answerQuestion(questionText, user.id);
        setAnswer(response.answer);
        onRefresh(true);
      } catch (error) {
      console.error('Error getting answer:', error);
      toast({
        title: 'Neural Engine Timeout',
        description: 'Could not retrieve data from the memory bank. Re-linking...',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

    const breadcrumbs = (
      <div className="flex items-center gap-2 mb-8 text-sm font-black uppercase tracking-widest text-muted-foreground/60 overflow-x-auto whitespace-nowrap pb-2">
        <button onClick={() => setView('home')} className="hover:text-primary transition-colors">Core</button>
        {view !== 'home' && (
          <>
            <ArrowRight className="w-3 h-3" />
            <span className="text-primary">
              {view === 'memoryWall' ? 'Visual Wall' : 
               view === 'addMemory' ? 'Neural Capture' : 
               view === 'askQuestion' ? 'Information Retrieval' : 
               view === 'matchingGame' ? 'Brain Training' :
               view === 'lifeTimeline' ? 'Life Timeline' :
               view === 'settings' ? 'System Settings' :
               'Temporal Recap'}
            </span>
          </>
        )}
        <div className="flex-1" />
        <button onClick={() => setView('settings')} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    );


    return (
      <div className={cn(
        "min-h-screen p-6 relative z-0 max-w-4xl mx-auto pt-24 transition-all",
        fontSize === 'large' ? 'text-lg' : fontSize === 'extra-large' ? 'text-2xl' : 'text-base',
        highContrast ? 'contrast-150 grayscale-0' : ''
      )}>
        {breadcrumbs}
        
        <PanicButton elderId={user?.id} />


      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* User Greeting Card */}
            <div className="relative p-10 rounded-[48px] bg-white/40 backdrop-blur-3xl border border-white shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Brain className="w-40 h-40 text-primary" />
              </div>
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <ShieldCheck className="w-3 h-3" /> Identity Verified
                  </div>
                  <h1 className="text-5xl font-black tracking-tighter">Welcome Back, {profile?.full_name?.split(' ')[0]}</h1>
                  <p className="text-xl text-muted-foreground font-medium italic">"Every memory is a bridge to the future."</p>
                </div>
                
                {/* 3D Brain Background Integration */}
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-60 pointer-events-none">
                  <BrainModelContainer />
                </div>
              </div>


            <div className="grid md:grid-cols-2 gap-8">
              {/* Daily Checklist */}
              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 ml-2">
                  <ListTodo className="w-6 h-6 text-primary" />
                  Routine Protocol
                </h2>
                <div className="space-y-4">
                  {reminders.length > 0 ? (
                    reminders.map((reminder) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={reminder.id}
                      >
                        <Card 
                          className={cn(
                            "p-5 flex items-center justify-between rounded-3xl border border-white/40 transition-all duration-500 shadow-xl",
                            reminder.status === 'completed' ? 'bg-green-50/30' : 'bg-white/40 backdrop-blur-md'
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-inner",
                              reminder.status === 'completed' ? 'bg-green-100' : 'bg-primary/5'
                            )}>
                              {reminder.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Clock className="w-6 h-6 text-primary" />}
                            </div>
                            <div>
                              <p className={cn(
                                "text-lg font-bold transition-all",
                                reminder.status === 'completed' ? 'line-through text-muted-foreground opacity-50' : 'text-foreground'
                              )}>
                                {reminder.title}
                              </p>
                              <p className="text-xs font-black uppercase tracking-tighter text-muted-foreground/60">
                                Schedule: {format(new Date(reminder.due_at), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                          {reminder.status === 'pending' && (
                            <Button 
                              variant="ghost"
                              size="sm" 
                              onClick={() => handleCompleteReminder(reminder.id)}
                              className="rounded-xl px-6 h-10 border-2 border-primary/20 hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest text-[10px]"
                            >
                              Complete
                            </Button>
                          )}
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <Card className="p-10 text-center border-dashed rounded-[40px] bg-white/20 backdrop-blur-sm">
                      <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-4 animate-pulse" />
                      <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">All Systems Synchronized</p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Action Hub */}
              <div className="space-y-6">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 ml-2">
                  <Zap className="w-6 h-6 text-primary" />
                  Active Modules
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {[
                        { label: 'Neural Capture', icon: Plus, view: 'addMemory', color: 'bg-primary', secondary: 'Record new temporal data' },
                        { label: 'Brain Training', icon: Gamepad2, view: 'matchingGame', color: 'bg-orange-500', secondary: 'Engage cognitive modules' },
                        { label: 'Life Timeline', icon: CalendarDays, view: 'lifeTimeline', color: 'bg-purple-600', secondary: 'Visualize life events' },
                        { label: 'Visual Wall', icon: ImageIcon, view: 'memoryWall', color: 'bg-accent', secondary: 'Review interactive archives' },

                      { label: 'Identify Friend', icon: Users, view: 'peopleScanner', color: 'bg-rose-600', secondary: 'Identify individuals' },
                      { label: 'Retrieval Engine', icon: MessageCircleQuestion, view: 'askQuestion', color: 'bg-indigo-600', secondary: 'Recall specific datasets' },
                      { label: 'Life Synthesis', icon: Brain, view: 'recap', color: 'bg-emerald-600', secondary: 'Generate weekly summary' }

                  ].map((btn, i) => (
                    <motion.button
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      key={btn.label}
                      onClick={() => btn.view === 'recap' ? handleShowRecap() : setView(btn.view as any)}
                      className="group flex items-center gap-6 p-6 rounded-[32px] bg-white/40 backdrop-blur-xl border border-white shadow-2xl hover:bg-white/60 transition-all text-left"
                    >
                      <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-lg", btn.color)}>
                        <btn.icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-black tracking-tighter uppercase mb-0.5">{btn.label}</p>
                        <p className="text-xs text-muted-foreground font-medium opacity-70 italic">{btn.secondary}</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-primary transition-all mr-2" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent History Horizontal Stream */}
            {recentQuestions.length > 0 && (
              <div className="space-y-6 pt-8 pb-12">
                <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-3 ml-2">
                  <History className="w-6 h-6 text-primary" />
                  Neural Stream
                </h2>
                <div className="flex gap-6 overflow-x-auto pb-6 -mx-6 px-6 snap-x no-scrollbar">
                  {recentQuestions.slice(0, 8).map((q, i) => (
                    <motion.div 
                      key={q.id}
                      className="snap-center flex-shrink-0 w-[400px]"
                    >
                      <Card className="h-full bg-white/30 backdrop-blur-md rounded-3xl p-8 border border-white/40 shadow-xl hover:bg-white/50 transition-all cursor-pointer group">
                        <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 opacity-60">Log ID: {q.id.slice(0,8)}</div>
                        <p className="text-xl font-bold text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
                          “{q.question_text}”
                        </p>
                        {q.answer_text && (
                          <div className="pt-4 border-t border-white/20">
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed italic">
                              {q.answer_text.slice(0, 140)}...
                            </p>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === 'memoryWall' && (
          <motion.div key="memoryWall" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="space-y-8">
              <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Temporal Archive</h1>
              <MemoryWall elderId={user!.id} onTriggerConversation={handleTriggerConversation} />
            </div>
          </motion.div>
        )}

        {(view === 'addMemory' || view === 'askQuestion') && (
          <motion.div 
            key={view}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="pt-12"
          >
            <Card className="rounded-[80px] bg-white/40 backdrop-blur-3xl border border-white p-16 shadow-[0_50px_100px_rgba(0,0,0,0.1)]">
              <div className="max-w-xl mx-auto space-y-12">
                <div className="space-y-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-inner shadow-primary/20">
                    {view === 'addMemory' ? <Plus className="w-12 h-12 text-primary" /> : <MessageCircleQuestion className="w-12 h-12 text-primary" />}
                  </div>
                  <h2 className="text-5xl font-black tracking-tighter">
                    {view === 'addMemory' ? 'Capture Neural Data' : 'Retrieve Archives'}
                  </h2>
                  <p className="text-2xl text-muted-foreground font-medium leading-relaxed">
                    {view === 'addMemory' 
                      ? "Describe your experience. My AI core will categorize and secure the temporal details."
                      : "Engage the search matrix. Ask anything regarding your indexed memories."}
                  </p>
                </div>

                <div className="relative">
                  <Textarea
                    className="min-h-[250px] p-10 rounded-[48px] bg-white/50 border-white text-2xl font-medium shadow-inner focus:ring-primary/20 transition-all resize-none"
                    placeholder={view === 'addMemory' ? "Synthesize memory..." : "Define search parameters..."}
                    value={view === 'addMemory' ? memoryText : questionText}
                    onChange={(e) => view === 'addMemory' ? setMemoryText(e.target.value) : setQuestionText(e.target.value)}
                  />
                  {supported.stt && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => startListening((text) => {
                        if (view === 'addMemory') setMemoryText(prev => prev ? `${prev} ${text}` : text);
                        else setQuestionText(prev => prev ? `${prev} ${text}` : text);
                      })}
                      className={cn(
                        "absolute right-8 bottom-8 rounded-full w-20 h-20 shadow-2xl transition-all flex items-center justify-center",
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-primary text-white'
                      )}
                    >
                      {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </motion.button>
                  )}
                </div>

                <div className="space-y-6">
                  <Button
                    onClick={view === 'addMemory' ? handleAddMemory : handleAskQuestion}
                    disabled={loading || !(view === 'addMemory' ? memoryText.trim() : questionText.trim())}
                    className="w-full h-24 rounded-[32px] text-2xl font-black bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 uppercase tracking-[0.2em] transition-all"
                  >
                    {loading ? 'Processing System...' : view === 'addMemory' ? 'Archive Data' : 'Initialize Query'}
                  </Button>
                  
                  {answer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-10 bg-slate-100/50 backdrop-blur-md rounded-[48px] border border-white shadow-2xl relative"
                    >
                      <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Neural Response Generated</p>
                      <p className="text-3xl font-bold leading-tight italic">“{answer}”</p>
                      {supported.tts && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute bottom-6 right-6 w-14 h-14 bg-white/80 rounded-full shadow-lg"
                          onClick={() => isSpeaking ? stopSpeaking() : speak(answer)}
                        >
                          {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </Button>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        )}

          {view === 'recap' && (
            <motion.div key="recap" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="pt-12">
               <Card className="rounded-[80px] bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-3xl border border-white p-20 shadow-2xl">
                <div className="max-w-2xl mx-auto space-y-12">
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl">
                      <Brain className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-6xl font-black tracking-tighter">Life Synthesis Report</h2>
                    <p className="text-xl font-bold uppercase tracking-widest text-primary/60 italic">Temporal analysis for current cycle</p>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center py-20 space-y-8">
                      <div className="w-20 h-20 border-8 border-primary/20 border-t-primary rounded-full animate-spin shadow-inner" />
                      <p className="text-3xl text-muted-foreground font-black uppercase tracking-tighter animate-pulse">Scanning Memory Spires...</p>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-12 bg-white/60 backdrop-blur-2xl rounded-[60px] border border-white shadow-2xl relative"
                    >
                      <div className="absolute top-8 right-8">
                        {supported.tts && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-16 h-16 rounded-full bg-primary/10 text-primary shadow-lg"
                            onClick={() => isSpeaking ? stopSpeaking() : speak(recap)}
                          >
                            {isSpeaking ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                          </Button>
                        )}
                      </div>
                      <p className="text-4xl font-black leading-tight tracking-tight italic bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/60">
                        “{recap}”
                      </p>
                    </motion.div>
                  )}
                  
                  <Button variant="outline" className="w-full h-20 rounded-[32px] text-xl font-black uppercase tracking-widest border-2" onClick={() => setView('home')}>Close Portal</Button>
                </div>
              </Card>
            </motion.div>
          )}
          {view === 'matchingGame' && (
            <MemoryMatchingGame elderId={user!.id} onClose={() => setView('home')} />
          )}
          {view === 'lifeTimeline' && (
            <MemoryTimeline elderId={user!.id} onClose={() => setView('home')} />
          )}

          {view === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="pt-12">
              <Card className="rounded-[80px] bg-white/40 backdrop-blur-3xl border border-white p-16 shadow-2xl">
                <div className="max-w-xl mx-auto space-y-12">
                  <div className="text-center">
                    <h2 className="text-5xl font-black tracking-tighter mb-4">Accessibility</h2>
                    <p className="text-xl text-muted-foreground font-medium italic">Adjust the system to your comfort</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-xl font-black flex items-center gap-3">
                        <Type className="h-6 w-6 text-primary" /> Font Size
                      </Label>
                      <div className="grid grid-cols-3 gap-4">
                        {(['normal', 'large', 'extra-large'] as const).map((size) => (
                          <Button
                            key={size}
                            variant={fontSize === size ? 'default' : 'outline'}
                            className="h-16 rounded-2xl font-bold capitalize text-lg"
                            onClick={() => setFontSize(size)}
                          >
                            {size === 'extra-large' ? 'Huge' : size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-white/40 rounded-[32px] border border-white">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white">
                          <Palette className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-xl font-black">High Contrast</p>
                          <p className="text-sm text-muted-foreground italic">Enhance visibility for easier reading</p>
                        </div>
                      </div>
                      <Switch 
                        checked={highContrast} 
                        onCheckedChange={setHighContrast}
                        className="scale-150"
                      />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full h-20 rounded-[32px] text-xl font-black uppercase tracking-widest border-2" onClick={() => setView('home')}>Save & Close</Button>
                </div>
              </Card>
            </motion.div>
          )}
          {view === 'peopleScanner' && (
            <PeopleScanner elderId={user!.id} onClose={() => setView('home')} />
          )}
        </AnimatePresence>

    </div>
  );
}


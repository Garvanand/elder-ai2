import { useEffect, useState } from 'react';
import { Plus, MessageCircleQuestion, History, LogOut, Brain, Clock, CheckCircle2, ListTodo, Mic, MicOff, Volume2, VolumeX, Image as ImageIcon, Sparkles, Zap, ShieldCheck, ArrowRight, Users, AlertCircle, Gamepad2, CalendarDays, Settings, Type, Palette, HelpCircle, Video, Stethoscope, Phone, X, Loader2, Heart, MessageSquare, Sun, BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { useTour } from '@/contexts/TourContext';
import { TourTriggerButton } from '@/components/TourOverlay';
import { useToast } from '@/hooks/use-toast';
import { useSpeech } from '@/hooks/useSpeech';
import { supabase } from '@/integrations/supabase/client';
import { extractMemoryIntelligence, answerQuestion, generateWeeklyRecap } from '@/lib/ai';
import type { Question, Routine, Reminder, Memory } from '@/types';
import { format, differenceInMinutes } from 'date-fns';
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
import { VideoRoom, ConsultationScheduler, UpcomingConsultations } from '@/components/teleconsultation';
import { toast as sonnerToast } from 'sonner';
import { MemoryCompanion } from './MemoryCompanion';
import { MoodTracker } from './MoodTracker';
import { FamilyMessages } from './FamilyMessages';
import { DailyPrompts } from './DailyPrompts';
import { CognitiveHealthDashboard } from './CognitiveHealthDashboard';
import { TimeCapsuleFeature } from './TimeCapsule';

interface ElderDashboardProps {
  recentQuestions: Question[];
  onRefresh: (silent?: boolean) => void;
}

export default function ElderDashboard({ recentQuestions, onRefresh }: ElderDashboardProps) {
  const { user, profile, signOut } = useAuth();
  const { isGuestMode, demoProfile, demoReminders, addDemoMemory, addDemoQuestion, completeDemoReminder, demoMemories } = useDemo();
  const { toast } = useToast();
  const { isListening, isSpeaking, supported, startListening, speak, stopSpeaking } = useSpeech();
  const [view, setView] = useState<'home' | 'addMemory' | 'askQuestion' | 'recap' | 'routines' | 'memoryWall' | 'peopleScanner' | 'matchingGame' | 'lifeTimeline' | 'settings' | 'videoCall'>('home');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('large');
  const [highContrast, setHighContrast] = useState(false);
  const [memoryText, setMemoryText] = useState('');
  const [memoryImage, setMemoryImage] = useState<File | null>(null);
  const [memoryImageUrl, setMemoryImageUrl] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [adaptiveQuestion, setAdaptiveQuestion] = useState('');
  const [showVideoRoom, setShowVideoRoom] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [upcomingConsultation, setUpcomingConsultation] = useState<any>(null);

  const [showCompanion, setShowCompanion] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showFamilyMessages, setShowFamilyMessages] = useState(false);
  const [showDailyPrompts, setShowDailyPrompts] = useState(false);
  const [showCognitiveHealth, setShowCognitiveHealth] = useState(false);
  const [showTimeCapsule, setShowTimeCapsule] = useState(false);

  const [answer, setAnswer] = useState('');
  const [recap, setRecap] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const activeProfile = isGuestMode ? demoProfile : profile;
  const activeUserId = isGuestMode ? 'demo-elder-001' : user?.id;

  const handleTriggerConversation = (memory: Memory) => {
    setQuestionText(`Tell me more about ${memory.raw_text}`);
    setView('askQuestion');
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { greeting: 'Good Morning', icon: '🌅', color: 'from-amber-400 to-orange-400' };
    if (hour < 17) return { greeting: 'Good Afternoon', icon: '☀️', color: 'from-blue-400 to-cyan-400' };
    return { greeting: 'Good Evening', icon: '🌙', color: 'from-indigo-400 to-purple-400' };
  };

  const timeOfDay = getTimeOfDay();

  useEffect(() => {
    document.body.classList.toggle('contrast-150', highContrast);
    document.body.classList.toggle('grayscale-0', highContrast);
    
    const html = document.documentElement;
    if (fontSize === 'large') {
      html.style.fontSize = '18px';
    } else if (fontSize === 'extra-large') {
      html.style.fontSize = '22px';
    } else {
      html.style.fontSize = '16px';
    }

    return () => {
      document.body.classList.remove('contrast-150', 'grayscale-0');
      html.style.fontSize = '16px';
    };
  }, [fontSize, highContrast]);

  useEffect(() => {
    if (isGuestMode) {
      setReminders(demoReminders);
      setUpcomingConsultation({
        id: 'demo-call-1',
        scheduled_at: new Date(Date.now() + 1000 * 60 * 10).toISOString(),
        status: 'scheduled',
        room_name: 'demo-room-123',
        metadata: { clinician_name: 'Sarah Mitchell' }
      });
      return;
    }
    if (user) {
      fetchReminders();
      fetchUpcomingConsultation();
    }
  }, [user, isGuestMode, demoReminders]);

  const fetchUpcomingConsultation = async () => {
    if (isGuestMode) return;
    if (!user) return;
    try {
      const { data } = await supabase
        .from('teleconsultations')
        .select('*')
        .eq('elder_id', user.id)
        .in('status', ['scheduled', 'in_progress'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(1)
        .single();
      
      if (data) {
        setUpcomingConsultation(data);
        const scheduledTime = new Date(data.scheduled_at);
        const minutesBefore = differenceInMinutes(scheduledTime, new Date());
        if (minutesBefore <= 5 && minutesBefore > 0) {
          sonnerToast.info('Your video consultation starts soon!', {
            description: `In ${minutesBefore} minutes with Dr. ${data.metadata?.clinician_name}`,
            duration: 10000
          });
        }
      }
    } catch (err) {
    }
  };

  const handleJoinVideoCall = (consultation?: any) => {
    const consult = consultation || upcomingConsultation;
    if (consult) {
      setActiveConsultation(consult);
      setShowVideoRoom(true);
    } else {
      sonnerToast.error('No scheduled consultation found');
    }
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('memory-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memory-images')
        .getPublicUrl(filePath);

      setMemoryImageUrl(publicUrl);
      toast({ title: "Photo Uploaded", description: "Your photo is ready to be saved with the memory." });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Upload Failed", description: "Could not upload photo. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteReminder = async (id: string) => {
    if (isGuestMode) {
      completeDemoReminder(id);
      toast({ title: "Well done!", description: "Activity completed." });
      return;
    }

    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      fetchReminders();
      toast({ title: "Well done!", description: "Activity completed." });
    } catch (error) {
      toast({ title: "Error", description: "Could not complete activity.", variant: "destructive" });
    }
  };

  const handleAddMemory = async () => {
    if (!memoryText.trim()) return;
    
    if (isGuestMode) {
      setLoading(true);
      setTimeout(() => {
        addDemoMemory({
          raw_text: memoryText,
          image_url: memoryImageUrl,
          type: 'story',
          emotional_tone: 'happy'
        });
        setAdaptiveQuestion("That's a lovely memory. What else do you remember about that day?");
        setMemoryText('');
        setMemoryImageUrl(null);
        setView('home');
        setLoading(false);
        toast({ title: 'Memory Saved!', description: 'Your story has been added to your album.' });
      }, 800);
      return;
    }

    if (!user) return;
    
    setLoading(true);
    try {
      const intel = await extractMemoryIntelligence(memoryText);
      const { error } = await supabase
        .from('memories')
        .insert({
          elder_id: user.id,
          raw_text: memoryText,
          image_url: memoryImageUrl,
          type: (intel.type || 'experience') as any,
          tags: intel.tags || [],
          structured_json: intel.structured || {},
          emotional_tone: intel.emotional_tone || 'neutral',
          confidence_score: intel.confidence_score || 0.8,
        });

        if (error) throw error;

        const adaptive = await generateAdaptiveQuestion(memoryText, user.id);
        setAdaptiveQuestion(adaptive);

        toast({
          title: 'Memory Saved!',
          description: 'Your story has been added to your album.',
        });
        
        setMemoryText('');
        setMemoryImageUrl(null);

      setView('home');
      onRefresh(true);
    } catch (error) {
      console.error('Error saving memory:', error);
      toast({
        title: 'Error',
        description: 'Could not save memory. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShowRecap = async () => {
    setLoading(true);
    setView('recap');

    if (isGuestMode) {
      setTimeout(() => {
        setRecap("This week has been full of warmth and connection. You've shared beautiful stories about Sarah's visit and your cherished wedding memories. Your commitment to your morning routines and garden walks shows great strength. It's wonderful to see you so engaged with your life's journey!");
        setLoading(false);
      }, 1000);
      return;
    }

    if (!user) return;
    try {
      const text = await generateWeeklyRecap(user.id);
      setRecap(text);
    } catch (error) {
      setRecap("You've had a wonderful week! You've shared some beautiful memories and stayed active with your daily routines.");
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) return;
    
    setLoading(true);
    setAnswer('');
    
    if (isGuestMode) {
      setTimeout(() => {
        addDemoQuestion(questionText);
        setAnswer("That sounds like a wonderful memory. From what I recall, it was a very special moment for you and your family.");
        setLoading(false);
      }, 1000);
      return;
    }

    if (!user) return;
    try {
        const response = await answerQuestion(questionText, user.id);
        setAnswer(response.answer);
        onRefresh(true);
      } catch (error) {
      console.error('Error getting answer:', error);
      toast({
        title: 'Search Failed',
        description: 'Could not find that information. Please try asking in a different way.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePromptSelected = (prompt: string) => {
    setMemoryText(prompt);
    setView('addMemory');
  };

  return (
    <div className={cn(
      "min-h-screen relative z-0 transition-all",
      fontSize === 'large' ? 'text-lg' : fontSize === 'extra-large' ? 'text-2xl' : 'text-base'
    )}>
      <div className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 -z-10" />
      
      <PanicButton elderId={user?.id} />

      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-8 max-w-5xl mx-auto pt-20 pb-32 space-y-8"
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "relative p-8 md:p-12 rounded-[40px] overflow-hidden",
                "bg-gradient-to-r", timeOfDay.color
              )}
            >
              <div className="absolute top-0 right-0 w-40 h-40 opacity-20">
                <span className="text-[120px]">{timeOfDay.icon}</span>
              </div>
              <div className="relative z-10 text-white">
                <p className="text-lg md:text-xl font-medium opacity-90 mb-2">{timeOfDay.greeting}</p>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {activeProfile?.full_name?.split(' ')[0] || 'Friend'}
                </h1>
                <p className="text-lg md:text-xl opacity-90 italic">
                  "Every day is a new page in your story"
                </p>
              </div>
              {isGuestMode && (
                <div className="absolute top-4 right-4 bg-white/20 px-4 py-2 rounded-full text-white text-sm font-medium">
                  Demo Mode
                </div>
              )}
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCompanion(true)}
                className="relative p-6 rounded-[32px] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl overflow-hidden group"
              >
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <Heart className="w-10 h-10 mb-3" />
                <p className="text-xl font-bold">Talk to Me</p>
                <p className="text-sm opacity-80">Your Memory Friend</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowFamilyMessages(true)}
                className="relative p-6 rounded-[32px] bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-xl overflow-hidden group"
              >
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <div className="relative">
                  <MessageSquare className="w-10 h-10 mb-3" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">2</span>
                </div>
                <p className="text-xl font-bold">Family</p>
                <p className="text-sm opacity-80">Messages for you</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowMoodTracker(true)}
                className="relative p-6 rounded-[32px] bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-xl overflow-hidden group"
              >
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <Sun className="w-10 h-10 mb-3" />
                <p className="text-xl font-bold">My Mood</p>
                <p className="text-sm opacity-80">How are you?</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDailyPrompts(true)}
                className="relative p-6 rounded-[32px] bg-gradient-to-br from-violet-400 to-purple-500 text-white shadow-xl overflow-hidden group"
              >
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                <Sparkles className="w-10 h-10 mb-3" />
                <p className="text-xl font-bold">Memory Prompts</p>
                <p className="text-sm opacity-80">Start a story</p>
              </motion.button>
            </div>

            <div className="bg-white/60 backdrop-blur-xl rounded-[32px] p-6 border border-white shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  Today's Activities
                </h2>
                <span className="text-sm text-gray-500">
                  {reminders.filter(r => r.status === 'completed').length} of {reminders.length} done
                </span>
              </div>
              
              <div className="space-y-3">
                {reminders.length > 0 ? (
                  reminders.map((reminder, index) => (
                    <motion.div 
                      key={reminder.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl transition-all",
                        reminder.status === 'completed' 
                          ? 'bg-green-50 border-2 border-green-200' 
                          : 'bg-white border-2 border-gray-100 hover:border-amber-300'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center",
                          reminder.status === 'completed' ? 'bg-green-200' : 'bg-amber-100'
                        )}>
                          {reminder.status === 'completed' 
                            ? <CheckCircle2 className="w-7 h-7 text-green-600" />
                            : <Clock className="w-7 h-7 text-amber-600" />
                          }
                        </div>
                        <div>
                          <p className={cn(
                            "text-xl font-bold",
                            reminder.status === 'completed' && 'line-through opacity-60'
                          )}>
                            {reminder.title}
                          </p>
                          <p className="text-gray-500">
                            {format(new Date(reminder.due_at), 'h:mm a')}
                          </p>
                        </div>
                      </div>
                      {reminder.status === 'pending' && (
                        <Button 
                          onClick={() => handleCompleteReminder(reminder.id)}
                          className="h-14 px-8 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg"
                        >
                          Done
                        </Button>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-500">No activities scheduled</p>
                    <p className="text-gray-400">Enjoy your free time!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('addMemory')}
                className="flex items-center gap-5 p-6 rounded-[24px] bg-white/80 backdrop-blur-xl border-2 border-amber-200 hover:border-amber-400 shadow-lg transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                  <Plus className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">Save a Memory</p>
                  <p className="text-gray-500">Record your story</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setView('memoryWall')}
                className="flex items-center gap-5 p-6 rounded-[24px] bg-white/80 backdrop-blur-xl border-2 border-rose-200 hover:border-rose-400 shadow-lg transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white shadow-lg">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold">Photo Album</p>
                  <p className="text-gray-500">View your memories</p>
                </div>
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Video Call', icon: Video, onClick: () => upcomingConsultation ? handleJoinVideoCall() : setShowScheduler(true), color: 'from-emerald-400 to-teal-500' },
                { label: 'Who is this?', icon: Users, onClick: () => setView('peopleScanner'), color: 'from-cyan-400 to-blue-500' },
                { label: 'Memory Game', icon: Gamepad2, onClick: () => setView('matchingGame'), color: 'from-purple-400 to-violet-500' },
                { label: 'My Journey', icon: BookOpen, onClick: () => setView('lifeTimeline'), color: 'from-indigo-400 to-blue-500' },
                { label: 'Ask Memory', icon: MessageCircleQuestion, onClick: () => setView('askQuestion'), color: 'from-teal-400 to-cyan-500' },
                { label: 'Weekly Review', icon: Brain, onClick: handleShowRecap, color: 'from-slate-400 to-gray-500' },
                { label: 'Settings', icon: Settings, onClick: () => setView('settings'), color: 'from-gray-400 to-slate-500' },
                { label: 'Help', icon: HelpCircle, onClick: () => {}, color: 'from-amber-400 to-yellow-500' },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.onClick}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white shadow-lg hover:shadow-xl transition-all"
                >
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br", item.color)}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <p className="font-bold text-gray-700">{item.label}</p>
                </motion.button>
              ))}
            </div>

            {recentQuestions.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-3 px-2">
                  <History className="w-6 h-6 text-gray-400" />
                  Recent Conversations
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x">
                  {recentQuestions.slice(0, 5).map((q, i) => (
                    <motion.div 
                      key={q.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="snap-center flex-shrink-0 w-[320px]"
                    >
                      <Card className="h-full bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white shadow-lg">
                        <p className="text-lg font-bold text-gray-800 mb-3 line-clamp-2">
                          "{q.question_text}"
                        </p>
                        {q.answer_text && (
                          <p className="text-gray-500 text-sm line-clamp-3 italic">
                            {q.answer_text}
                          </p>
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
          <motion.div key="memoryWall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-8 max-w-5xl mx-auto pt-20 pb-32">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setView('home')} className="rounded-full">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </Button>
              <h1 className="text-4xl font-bold">Photo Album</h1>
            </div>
            <MemoryWall elderId={activeUserId!} onTriggerConversation={handleTriggerConversation} />
          </motion.div>
        )}

        {(view === 'addMemory' || view === 'askQuestion') && (
          <motion.div 
            key={view}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 md:p-8 max-w-2xl mx-auto pt-20 pb-32"
          >
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setView('home')} className="rounded-full">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </Button>
              <h1 className="text-4xl font-bold">
                {view === 'addMemory' ? 'Save a Memory' : 'Search Memories'}
              </h1>
            </div>

            <Card className="rounded-[40px] bg-white/80 backdrop-blur-xl border-2 border-amber-200 p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white mb-4">
                    {view === 'addMemory' ? <Plus className="w-10 h-10" /> : <MessageCircleQuestion className="w-10 h-10" />}
                  </div>
                  <p className="text-xl text-gray-600">
                    {view === 'addMemory' 
                      ? "Share what's on your mind or tell me about a special moment."
                      : "What would you like to remember?"}
                  </p>
                </div>

                <div className="relative">
                  <Textarea
                    className="min-h-[180px] p-6 rounded-3xl bg-white border-2 border-gray-200 focus:border-amber-400 text-xl resize-none"
                    placeholder={view === 'addMemory' ? "Start typing your story..." : "Type your question..."}
                    value={view === 'addMemory' ? memoryText : questionText}
                    onChange={(e) => view === 'addMemory' ? setMemoryText(e.target.value) : setQuestionText(e.target.value)}
                  />
                  {supported.stt && (
                    <button
                      onClick={() => startListening((text) => {
                        if (view === 'addMemory') setMemoryText(prev => prev ? `${prev} ${text}` : text);
                        else setQuestionText(prev => prev ? `${prev} ${text}` : text);
                      })}
                      className={cn(
                        "absolute right-4 bottom-4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all",
                        isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-500 text-white hover:bg-amber-600'
                      )}
                    >
                      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                  )}
                </div>

                {view === 'addMemory' && (
                  <div>
                    {memoryImageUrl ? (
                      <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                        <img src={memoryImageUrl} alt="Uploaded" className="w-full h-48 object-cover" />
                        <button 
                          onClick={() => setMemoryImageUrl(null)}
                          className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                        <Label 
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center h-32 border-3 border-dashed border-amber-300 rounded-3xl hover:border-amber-500 hover:bg-amber-50 cursor-pointer transition-all"
                        >
                          {uploading ? (
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                          ) : (
                            <>
                              <ImageIcon className="w-8 h-8 text-amber-500 mb-2" />
                              <span className="text-lg font-bold text-amber-600">Add a Photo</span>
                            </>
                          )}
                        </Label>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={view === 'addMemory' ? handleAddMemory : handleAskQuestion}
                  disabled={loading || uploading || !(view === 'addMemory' ? memoryText.trim() : questionText.trim())}
                  className="w-full h-16 rounded-2xl text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-xl"
                >
                  {loading ? 'Processing...' : view === 'addMemory' ? 'Save Memory' : 'Search'}
                </Button>

                {answer && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border-2 border-amber-200 relative"
                  >
                    <p className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-3">Memory Friend says:</p>
                    <p className="text-xl text-gray-800 leading-relaxed">"{answer}"</p>
                    {supported.tts && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white shadow-md"
                        onClick={() => isSpeaking ? stopSpeaking() : speak(answer)}
                      >
                        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </Button>
                    )}
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {view === 'recap' && (
          <motion.div key="recap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-8 max-w-2xl mx-auto pt-20 pb-32">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setView('home')} className="rounded-full">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </Button>
              <h1 className="text-4xl font-bold">Weekly Review</h1>
            </div>

            <Card className="rounded-[40px] bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-200 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white mb-4">
                  <Brain className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-violet-800">Your Week at a Glance</h2>
              </div>

              {loading ? (
                <div className="flex flex-col items-center py-16">
                  <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4" />
                  <p className="text-xl text-violet-600 font-medium">Preparing your review...</p>
                </div>
              ) : (
                <div className="p-6 bg-white/80 rounded-3xl border border-violet-200 relative">
                  <p className="text-2xl text-gray-800 leading-relaxed italic">"{recap}"</p>
                  {supported.tts && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 w-12 h-12 rounded-full bg-violet-100 text-violet-600"
                      onClick={() => isSpeaking ? stopSpeaking() : speak(recap)}
                    >
                      {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {view === 'matchingGame' && (
          <div className="p-4 pt-20">
            <div className="flex items-center gap-4 mb-4 max-w-5xl mx-auto">
              <Button variant="ghost" onClick={() => setView('home')} className="rounded-full">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </Button>
              <h1 className="text-4xl font-bold">Memory Game</h1>
            </div>
            <MemoryMatchingGame elderId={activeUserId!} onClose={() => setView('home')} />
          </div>
        )}

        {view === 'lifeTimeline' && (
          <MemoryTimeline elderId={activeUserId!} onClose={() => setView('home')} />
        )}

        {view === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 md:p-8 max-w-2xl mx-auto pt-20 pb-32">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" onClick={() => setView('home')} className="rounded-full">
                <ArrowRight className="w-6 h-6 rotate-180" />
              </Button>
              <h1 className="text-4xl font-bold">Settings</h1>
            </div>

            <Card className="rounded-[40px] bg-white/80 backdrop-blur-xl border border-gray-200 p-8 shadow-xl space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <Type className="w-6 h-6 text-gray-500" />
                  Text Size
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {(['normal', 'large', 'extra-large'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? 'default' : 'outline'}
                      className={cn(
                        "h-14 rounded-2xl font-bold capitalize",
                        fontSize === size && 'bg-gradient-to-r from-amber-500 to-orange-500'
                      )}
                      onClick={() => setFontSize(size)}
                    >
                      {size === 'extra-large' ? 'Huge' : size}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">High Contrast</p>
                    <p className="text-gray-500">Easier to see</p>
                  </div>
                </div>
                <Switch 
                  checked={highContrast} 
                  onCheckedChange={setHighContrast}
                  className="scale-125"
                />
              </div>

              {!isGuestMode && (
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="w-full h-14 rounded-2xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-bold"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>
              )}
            </Card>
          </motion.div>
        )}

        {view === 'peopleScanner' && (
          <PeopleScanner elderId={activeUserId!} onClose={() => setView('home')} />
        )}
      </AnimatePresence>

      {showCompanion && (
        <MemoryCompanion 
          elderId={activeUserId!} 
          elderName={activeProfile?.full_name || 'Friend'}
          onClose={() => setShowCompanion(false)} 
        />
      )}

      {showMoodTracker && (
        <MoodTracker 
          elderId={activeUserId!} 
          onClose={() => setShowMoodTracker(false)} 
        />
      )}

      {showFamilyMessages && (
        <FamilyMessages 
          elderId={activeUserId!} 
          onClose={() => setShowFamilyMessages(false)} 
        />
      )}

      {showDailyPrompts && (
        <DailyPrompts 
          onSelectPrompt={handlePromptSelected}
          onClose={() => setShowDailyPrompts(false)} 
        />
      )}

      {!isGuestMode && <TourTriggerButton tourId="elder-tour" />}

      {showVideoRoom && activeConsultation && (
        <VideoRoom
          roomName={activeConsultation.room_name}
          userName={activeProfile?.full_name || 'Patient'}
          userRole="elder"
          consultationId={activeConsultation.id}
          onClose={() => {
            setShowVideoRoom(false);
            setActiveConsultation(null);
          }}
          onCallEnd={() => {
            fetchUpcomingConsultation();
            onRefresh(true);
          }}
        />
      )}

      {showScheduler && activeUserId && (
        <ConsultationScheduler
          elderId={activeUserId}
          elderName={activeProfile?.full_name || 'Patient'}
          userRole="elder"
          onScheduled={() => {
            setShowScheduler(false);
            fetchUpcomingConsultation();
            onRefresh(true);
          }}
          onClose={() => setShowScheduler(false)}
        />
      )}
    </div>
  );
}

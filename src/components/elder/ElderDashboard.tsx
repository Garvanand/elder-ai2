import { useEffect, useState } from 'react';
import { Plus, MessageCircleQuestion, History, LogOut, Brain, Clock, CheckCircle2, ListTodo, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSpeech } from '@/hooks/useSpeech';
import { supabase } from '@/integrations/supabase/client';
import { extractMemoryIntelligence, answerQuestion, generateWeeklyRecap } from '@/lib/ai';
import type { Question, Routine, Reminder } from '@/types';
import { format } from 'date-fns';

interface ElderDashboardProps {
  recentQuestions: Question[];
  onRefresh: () => void;
}

export default function ElderDashboard({ recentQuestions, onRefresh }: ElderDashboardProps) {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const { isListening, isSpeaking, supported, startListening, speak, stopSpeaking } = useSpeech();
  const [view, setView] = useState<'home' | 'addMemory' | 'askQuestion' | 'recap' | 'routines'>('home');
  const [memoryText, setMemoryText] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answer, setAnswer] = useState('');
  const [recap, setRecap] = useState('');
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);

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
      toast({ title: "Reminder completed!", description: "Great job!" });
    } catch (error) {
      toast({ title: "Error", description: "Could not update reminder.", variant: "destructive" });
    }
  };

  const handleAddMemory = async () => {
    if (!memoryText.trim() || !user) return;
    
    setLoading(true);
    try {
      // Extract metadata using AI
      const intel = await extractMemoryIntelligence(memoryText);
      
      // Save memory to database
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

      toast({
        title: 'Memory saved!',
        description: 'Your memory has been recorded safely.',
      });
      
      setMemoryText('');
      setView('home');
      onRefresh();
    } catch (error) {
      console.error('Error saving memory:', error);
      toast({
        title: 'Could not save',
        description: 'Please try again.',
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
      setRecap("You've shared some wonderful moments recently!");
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
      onRefresh();
    } catch (error) {
      console.error('Error getting answer:', error);
      toast({
        title: 'Could not get answer',
        description: 'Please try again in a moment.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (view === 'recap') {
    return (
      <div className="min-h-screen bg-background p-6 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="elderOutline"
            onClick={() => setView('home')}
            className="mb-6"
          >
            ← Go Back
          </Button>
          
          <Card variant="elder" className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle elder className="text-3xl flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                Your Life Recap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center py-12 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-xl text-muted-foreground italic">Thinking about your wonderful stories...</p>
                  </div>
                ) : (
                  <div className="relative p-8 bg-white/50 rounded-3xl border border-white shadow-inner animate-slide-up">
                    <div className="absolute top-4 right-4 flex gap-2">
                      {supported.tts && (
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full w-12 h-12"
                          onClick={() => isSpeaking ? stopSpeaking() : speak(recap)}
                        >
                          {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </Button>
                      )}
                    </div>
                    <p className="text-2xl leading-relaxed text-foreground font-medium">
                      {recap}
                    </p>
                  </div>
                )}
              
              {!loading && (
                <Button
                  variant="elder"
                  size="elderLg"
                  onClick={() => setView('home')}
                  className="w-full mt-4"
                >
                  That's lovely!
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'addMemory') {
    return (
      <div className="min-h-screen bg-background p-6 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="elderOutline"
            onClick={() => setView('home')}
            className="mb-6"
          >
            ← Go Back
          </Button>
          
          <Card variant="elder">
            <CardHeader>
              <CardTitle elder className="text-3xl flex items-center gap-3">
                <Plus className="w-8 h-8 text-primary" />
                Add a Memory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xl text-muted-foreground">
                Share something you'd like to remember. It could be a story, a person's name, 
                an important event, or anything else.
              </p>
              
                <div className="relative">
                  <Textarea
                    elder
                    placeholder="Type your memory here..."
                    value={memoryText}
                    onChange={(e) => setMemoryText(e.target.value)}
                    rows={6}
                    className="pr-16"
                  />
                  {supported.stt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute right-4 bottom-4 rounded-full w-12 h-12 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-primary/10 text-primary'}`}
                      onClick={() => startListening((text) => setMemoryText(prev => prev ? `${prev} ${text}` : text))}
                    >
                      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>
                  )}
                </div>
              
              <Button
                variant="elderSuccess"
                size="elderLg"
                onClick={handleAddMemory}
                disabled={loading || !memoryText.trim()}
                className="w-full"
              >
                {loading ? 'Saving...' : 'Save Memory'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (view === 'askQuestion') {
    return (
      <div className="min-h-screen bg-background p-6 animate-fade-in">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="elderOutline"
            onClick={() => {
              setView('home');
              setQuestionText('');
              setAnswer('');
            }}
            className="mb-6"
          >
            ← Go Back
          </Button>
          
          <Card variant="elder">
            <CardHeader>
              <CardTitle elder className="text-3xl flex items-center gap-3">
                <MessageCircleQuestion className="w-8 h-8 text-primary" />
                Ask a Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-xl text-muted-foreground">
                Ask me anything about your memories. I'll help you remember!
              </p>
              
                <div className="relative">
                  <Textarea
                    elder
                    placeholder="What would you like to know?"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    rows={4}
                    className="pr-16"
                  />
                  {supported.stt && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute right-4 bottom-4 rounded-full w-12 h-12 ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-primary/10 text-primary'}`}
                      onClick={() => startListening((text) => setQuestionText(prev => prev ? `${prev} ${text}` : text))}
                    >
                      {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="elder"
                  size="elderLg"
                  onClick={handleAskQuestion}
                  disabled={loading || !questionText.trim()}
                  className="w-full"
                >
                  {loading ? 'Thinking...' : 'Get Answer'}
                </Button>
                
                {answer && (
                  <div className="mt-6 p-6 bg-secondary rounded-2xl animate-slide-up relative group">
                    <div className="absolute top-4 right-4 flex gap-2">
                      {supported.tts && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full w-10 h-10 bg-white/50 hover:bg-white"
                          onClick={() => isSpeaking ? stopSpeaking() : speak(answer)}
                        >
                          {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </Button>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-secondary-foreground">Answer:</h3>
                    <p className="text-xl leading-relaxed text-secondary-foreground pr-12">{answer}</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Daily Checklist */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-display font-semibold mb-4 flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-primary" />
            Today's Checklist
          </h2>
          <div className="space-y-3">
            {reminders.length > 0 ? (
              reminders.map((reminder) => (
                <Card 
                  key={reminder.id} 
                  variant="memory" 
                  className={`p-4 flex items-center justify-between transition-all ${reminder.status === 'completed' ? 'opacity-50 bg-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reminder.status === 'completed' ? 'bg-green-100' : 'bg-primary/10'}`}>
                      {reminder.status === 'completed' ? <CheckCircle2 className="w-6 h-6 text-green-600" /> : <Clock className="w-6 h-6 text-primary" />}
                    </div>
                    <div>
                      <p className={`text-xl font-medium ${reminder.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {reminder.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(reminder.due_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                  {reminder.status === 'pending' && (
                    <Button 
                      variant="elderSuccess" 
                      size="sm" 
                      onClick={() => handleCompleteReminder(reminder.id)}
                      className="rounded-xl px-6"
                    >
                      Done
                    </Button>
                  )}
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center border-dashed bg-slate-50/50">
                <CheckCircle2 className="w-10 h-10 text-green-500/30 mx-auto mb-2" />
                <p className="text-muted-foreground italic text-lg">You've finished everything for now! Great job.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-4 mb-12">
          <Button
            variant="elder"
            size="elderLg"
            onClick={() => setView('addMemory')}
            className="w-full justify-start gap-4 shadow-xl hover:scale-[1.02] transition-transform"
          >
            <Plus className="w-8 h-8" />
            Add a Memory
          </Button>
          
          <Button
            variant="elderSecondary"
            size="elderLg"
            onClick={() => setView('askQuestion')}
            className="w-full justify-start gap-4 shadow-xl hover:scale-[1.02] transition-transform"
          >
            <MessageCircleQuestion className="w-8 h-8" />
            Ask a Question
          </Button>

          <Button
            variant="elderOutline"
            size="elderLg"
            onClick={handleShowRecap}
            className="w-full justify-start gap-4 border-2 border-primary/20 bg-primary/5 shadow-lg hover:scale-[1.02] transition-transform"
          >
            <Brain className="w-8 h-8 text-primary" />
            Your Life Recap
          </Button>
        </div>

          {/* Recent Questions */}
          {recentQuestions.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>

            <h2 className="text-2xl font-display font-semibold mb-4 flex items-center gap-2">
              <History className="w-6 h-6 text-primary" />
              Recent Questions
            </h2>
            <div className="space-y-3">
              {recentQuestions.slice(0, 5).map((q) => (
                <Card key={q.id} variant="memory" className="p-4">
                  <p className="text-lg font-medium text-foreground mb-2">
                    Q: {q.question_text}
                  </p>
                  {q.answer_text && (
                    <p className="text-muted-foreground">
                      A: {q.answer_text.slice(0, 100)}...
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

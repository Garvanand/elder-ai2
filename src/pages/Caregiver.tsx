import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CaregiverDashboard from '@/components/caregiver/CaregiverDashboard';
import { supabase } from '@/integrations/supabase/client';
import type { Memory, Question } from '@/types';
import { Loader2, Brain, User, Calendar, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CaregiverPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [elderId, setElderId] = useState<string | null>(null);
  const [linkEmail, setLinkEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
    if (!authLoading && profile && profile.role !== 'caregiver') {
      navigate('/elder');
    }
  }, [user, profile, authLoading, navigate]);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find elders linked to this caregiver via join table
      const { data: links, error: linksError } = await supabase
        .from('caregiver_elder_links')
        .select('*')
        .eq('caregiver_user_id', user.id);

      if (linksError) {
        console.error('Error fetching caregiver links:', linksError);
        setError('Could not load linked elders. Please try again.');
        setLoading(false);
        return;
      }

      if (!links || links.length === 0) {
        setElderId(null);
        setMemories([]);
        setQuestions([]);
        setLoading(false);
        return;
      }

      const currentElderId = links[0].elder_user_id as string;
      setElderId(currentElderId);

      const [memoriesRes, questionsRes, signalsRes] = await Promise.all([
        supabase
          .from('memories')
          .select('*')
          .eq('elder_id', currentElderId)
          .order('created_at', { ascending: false }),
        supabase
          .from('questions')
          .select('*')
          .eq('elder_id', currentElderId)
          .order('created_at', { ascending: false }),
        supabase
          .from('behavioral_signals')
          .select('*')
          .eq('elder_id', currentElderId)
          .order('created_at', { ascending: false }),
      ]);

      if (memoriesRes.data) {
        setMemories(memoriesRes.data as Memory[]);
      }
      if (questionsRes.data) {
        setQuestions(questionsRes.data as Question[]);
      }
      if (signalsRes.data) {
        setSignals(signalsRes.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Something went wrong while loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkElder = async () => {
    if (!user || !linkEmail.trim()) {
      return;
    }
    setLinking(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('link_caregiver_to_elder_by_email', {
        caregiver_uid: user.id,
        elder_email: linkEmail.trim(),
      } as any);

      if (rpcError) {
        console.error('Error linking elder:', rpcError);
        setError(rpcError.message || 'Failed to link elder. Please check the email and try again.');
        setLinking(false);
        return;
      }

      setLinkEmail('');
      await fetchData();
    } catch (err) {
      console.error('Error linking elder:', err);
      setError('Failed to link elder. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchData();
    }
  }, [user, profile]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== 'caregiver') {
    return null;
  }

    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 py-8 relative z-10">
          <section className="relative overflow-hidden mb-12 p-1 animate-slide-up">

          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-[2rem] blur-2xl" />
          <div className="relative memory-card bg-white/70 backdrop-blur-xl border-white/20 shadow-xl rounded-[2rem] p-8 md:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="space-y-4 lg:max-w-md">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  <User className="w-3 h-3" />
                  Family Connection
                </div>
                <h2 className="text-3xl font-display font-bold leading-tight">
                  Connect with your loved one
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Enter the email address of the elder you're caring for. Once linked, you'll gain access to their memory timeline and daily activity summaries.
                </p>
              </div>
              
              <div className="flex flex-col gap-4 w-full lg:max-w-sm">
                <div className="space-y-2">
                  <div className="relative group">
                    <Input
                      type="email"
                      placeholder="elder@example.com"
                      value={linkEmail}
                      onChange={(e) => setLinkEmail(e.target.value)}
                      className="pl-4 h-14 rounded-2xl border-primary/10 bg-white/50 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                    />
                  </div>
                  <Button 
                    onClick={handleLinkElder} 
                    disabled={linking} 
                    className="w-full h-14 rounded-2xl shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90 text-lg font-bold transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {linking ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Linking Account...
                      </>
                    ) : (
                      <>
                        Connect Now
                        <PlusCircle className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest">
                  Secure encrypted connection
                </p>
              </div>
            </div>
          
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
              {error}
            </div>
          )}
          
            {!elderId && !loading && !error && (
              <div className="mt-6 p-8 text-center border-2 border-dashed border-muted rounded-2xl">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground">Waiting for connection</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Once linked, you'll be able to see their daily activities and memories.
                </p>
              </div>
            )}
          </div>
        </section>


        {elderId && (
          <div className="animate-fade-in delay-200">
            <CaregiverDashboard
              memories={memories}
              questions={questions}
              signals={signals}
              onRefresh={fetchData}
            />
          </div>
        )}
      </div>
    </div>
  );
}

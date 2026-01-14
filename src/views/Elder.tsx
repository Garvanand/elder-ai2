import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import ElderDashboard from '@/components/elder/ElderDashboard';
import CaregiverDashboard from '@/components/caregiver/CaregiverDashboard';
import { supabase } from '@/integrations/supabase/client';
import type { Memory, Question, BehavioralSignal } from '@/types';
import { Loader2 } from 'lucide-react';

export default function ElderPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { isGuestMode, demoPortal, demoMemories, demoQuestions, demoSignals, demoProfile } = useDemo();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [signals, setSignals] = useState<BehavioralSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuestMode && demoPortal === 'elder') {
      setMemories(demoMemories);
      setQuestions(demoQuestions);
      setSignals(demoSignals);
      setLoading(false);
      return;
    }
    
    if (!authLoading && !user && !isGuestMode) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate, isGuestMode, demoPortal, demoMemories, demoQuestions, demoSignals]);

  const fetchData = async (silent = false) => {
    if (!user) return;

    if (!silent) setLoading(true);
    try {
      // Get the elder ID (self if elder, elder_id from profile if caregiver)
      const elderId = profile?.role === 'caregiver' && profile?.elder_id 
        ? profile.elder_id 
        : user.id;

      const [memoriesRes, questionsRes, signalsRes] = await Promise.all([
        supabase
          .from('memories')
          .select('*')
          .eq('elder_id', elderId)
          .order('created_at', { ascending: false }),
        supabase
          .from('questions')
          .select('*')
          .eq('elder_id', elderId)
          .order('created_at', { ascending: false }),
        supabase
          .from('behavioral_signals')
          .select('*')
          .eq('elder_id', elderId)
          .order('created_at', { ascending: false }),
      ]);

      if (memoriesRes.data) {
        setMemories(memoriesRes.data as Memory[]);
      }
      if (questionsRes.data) {
        setQuestions(questionsRes.data as Question[]);
      }
      if (signalsRes.data) {
        setSignals(signalsRes.data as BehavioralSignal[]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

    useEffect(() => {
      if (user && profile) {
        fetchData();

        // Subscribe to real-time changes
        const channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'memories',
              filter: `elder_id=eq.${user.id}`
            },
            () => fetchData(true)
          )
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'questions',
              filter: `elder_id=eq.${user.id}`
            },
            () => fetchData(true)
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }, [user, profile]);


  if (authLoading || loading || (!profile && !isGuestMode && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuestMode) {
    navigate('/auth');
    return null;
  }
  
  if (!profile && !isGuestMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-2">Profile not found</p>
          <button 
            onClick={() => navigate('/auth')}
            className="text-primary underline"
          >
            Please sign in again
          </button>
        </div>
      </div>
    );
  }

  const activeProfile = isGuestMode ? demoProfile : profile;
  const activeUser = isGuestMode ? { id: 'demo-elder-001' } : user;

  if (activeProfile?.role === 'caregiver') {
    return (
      <CaregiverDashboard
        memories={memories}
        questions={questions}
        signals={signals}
        onRefresh={isGuestMode ? () => {} : fetchData}
      />
    );
  }

  return (
    <ElderDashboard
      recentQuestions={questions}
      onRefresh={isGuestMode ? () => {} : fetchData}
    />
  );
}

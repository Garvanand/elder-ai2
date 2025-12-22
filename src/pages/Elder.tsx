import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ElderDashboard from '@/components/elder/ElderDashboard';
import CaregiverDashboard from '@/components/caregiver/CaregiverDashboard';
import { supabase } from '@/integrations/supabase/client';
import type { Memory, Question, BehavioralSignal } from '@/types';
import { Loader2 } from 'lucide-react';

export default function ElderPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [signals, setSignals] = useState<BehavioralSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

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

  if (!user || !profile) {
    return null;
  }

  // Render appropriate dashboard based on user role
  if (profile.role === 'caregiver') {
    return (
      <CaregiverDashboard
        memories={memories}
        questions={questions}
        signals={signals}
        onRefresh={fetchData}
      />
    );
  }

  return (
    <ElderDashboard
      recentQuestions={questions}
      onRefresh={fetchData}
    />
  );
}

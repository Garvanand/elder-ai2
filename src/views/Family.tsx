import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Memory, Question, Profile } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut, Heart, Users, Brain } from 'lucide-react';
import FamilyDashboard from '@/components/caregiver/FamilyDashboard';

export default function FamilyPage() {
  const { user, profile, signOut } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [elderProfile, setElderProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.elder_id) {
      fetchElderData();
    }
  }, [profile]);

  const fetchElderData = async () => {
    if (!profile?.elder_id) return;
    
    setLoading(true);
    try {
      // Fetch elder's profile
      const { data: elderData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profile.elder_id)
        .single();
      
      if (elderData) setElderProfile(elderData as Profile);

      // Fetch elder's memories
      const { data: memData } = await supabase
        .from('memories')
        .select('*')
        .eq('elder_id', profile.elder_id)
        .order('created_at', { ascending: false });
      
      if (memData) setMemories(memData as Memory[]);
    } catch (error) {
      console.error('Error fetching elder data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="px-6 py-6 border-b border-black/5 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Family Portal</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Emotional Connection</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => signOut()} className="text-muted-foreground hover:text-rose-500">
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="px-6 py-12">
        {!profile?.elder_id ? (
          <div className="max-w-md mx-auto text-center space-y-8 py-20">
            <div className="w-24 h-24 rounded-[32px] bg-rose-50 flex items-center justify-center mx-auto">
              <Users className="w-12 h-12 text-rose-500" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">Connect to your loved one</h2>
              <p className="text-muted-foreground leading-relaxed">
                To see memories and updates, you need to be linked to an elder's account. 
                Please ask the primary caregiver to link your email.
              </p>
            </div>
            <Button className="w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20">
              Learn How to Link
            </Button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground font-medium italic">Gathering beautiful moments...</p>
          </div>
        ) : (
          <FamilyDashboard elderProfile={elderProfile} memories={memories} />
        )}
      </main>
    </div>
  );
}

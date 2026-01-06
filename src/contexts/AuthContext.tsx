import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Profile, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string, faceDescriptor?: number[]) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, extraData?: any) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile | null;
  };

  useEffect(() => {
    // Check if Supabase is properly configured (support Next + Vite, avoid process in browser)
    const nextEnv = typeof process !== 'undefined' && process.env ? process.env : {};
    const supabaseUrl =
      nextEnv.NEXT_PUBLIC_SUPABASE_URL ||
      (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_SUPABASE_URL : '');
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetch with setTimeout
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id).then(setProfile);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // Check for native auth token from mobile app bridge
    const checkNativeAuth = async () => {
      const nativeToken = (window as any).nativeAuthToken;
      if (nativeToken && !session) {
        console.log('Syncing session from native token...');
        const { data, error } = await supabase.auth.setSession({
          access_token: nativeToken,
          refresh_token: '', // We don't have the refresh token but setSession often works with just access_token for immediate sync
        });
        if (!error && data.session) {
          setSession(data.session);
          setUser(data.session.user);
          const p = await fetchProfile(data.session.user.id);
          setProfile(p);
        }
      }
    };

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then((p) => {
          setProfile(p);
          setLoading(false);
        });
      } else {
        // If no regular session, check for native token
        checkNativeAuth().finally(() => {
          setLoading(false);
        });
      }
    }).catch((error) => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, faceDescriptor?: number[]) => {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && session?.user && faceDescriptor) {
      // Auto-link face descriptor upon successful password login if provided
      await supabase
        .from('profiles')
        .update({ face_descriptor: faceDescriptor })
        .eq('user_id', session.user.id);
    }

    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole, extraData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          ...extraData
        },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signInWithOAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

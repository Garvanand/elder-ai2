import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, Brain, Users, Camera, Sparkles, ShieldCheck } from 'lucide-react';
import type { UserRole } from '@/types';
import { FaceRecognitionModal } from '@/components/FaceRecognitionModal';
import { supabase } from '@/integrations/supabase/client';
import { compareFaceDescriptors } from '@/lib/face-recognition';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('elder');
  const [loading, setLoading] = useState(false);
  const [showFaceModal, setShowFaceModal] = useState(false);
    const [faceDescriptor, setFaceDescriptor] = useState<number[] | null>(null);
    const [pin, setPin] = useState('');
    const [signupPin, setSignupPin] = useState('');
    const [showPinInput, setShowPinInput] = useState(false);

  
    const handlePinLogin = async () => {
      if (!email || !pin) return;
      setLoading(true);
      try {
        const { data: profiles, error } = await supabase
          .rpc('get_profile_by_email', { email_input: email });

        if (error) throw error;
        const profile = profiles && profiles.length > 0 ? profiles[0] : null;

        if (profile?.pin_code === pin) {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (!error) {
           toast({ title: 'PIN Verified!', description: 'Check email for login link.' });
        }
      } else {
        toast({ title: 'Invalid PIN', description: 'The PIN you entered is incorrect.', variant: 'destructive' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const { error } = await signInWithOAuth(provider);
      if (error) {
        toast({
          title: 'OAuth Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFaceLogin = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email first so we can find your face profile.',
        variant: 'destructive',
      });
      return;
    }
    setShowFaceModal(true);
  };

    const onFaceCapture = async (capturedDescriptor: number[]) => {
      console.log("Auth: onFaceCapture triggered with descriptor length:", capturedDescriptor.length);
      setShowFaceModal(false);
      setLoading(true);
      console.log("Auth: Modal hidden, loading state set to true");

      try {
          if (isLogin) {
            console.log("Auth: Attempting face login for", email);
            
            // Use RPC to bypass RLS for pre-auth profile lookup
            const { data: profiles, error: profileError } = await supabase
              .rpc('get_profile_by_email', { email_input: email });

            if (profileError) {
              console.error("Auth: Profile fetch error via RPC:", profileError);
              throw profileError;
            }

            const profile = profiles && profiles.length > 0 ? profiles[0] : null;

            if (!profile) {
            console.warn("Auth: No profile found for", email);
            toast({
              title: 'Account not found',
              description: 'We couldn\'t find a profile for this email.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }

          if (!profile.face_descriptor) {
            console.warn("Auth: No face descriptor found for", email);
            toast({
              title: 'Face Login unavailable',
              description: 'No face profile found for this email. Please use your password.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }

          console.log("Auth: Found face profile, comparing descriptors...");
          // Ensure stored descriptor is treated as an array of numbers
          let storedDescriptor: number[];
          if (Array.isArray(profile.face_descriptor)) {
            storedDescriptor = profile.face_descriptor;
          } else if (typeof profile.face_descriptor === 'object' && profile.face_descriptor !== null) {
            storedDescriptor = Object.values(profile.face_descriptor);
          } else {
            console.error("Auth: Invalid face_descriptor format in DB:", profile.face_descriptor);
            throw new Error("Invalid biometric data in records.");
          }

            console.log("Auth: Comparing descriptors of lengths:", capturedDescriptor.length, storedDescriptor.length);
            
            // Validate descriptor lengths match
            if (capturedDescriptor.length !== storedDescriptor.length) {
              console.error("Auth: Descriptor length mismatch:", capturedDescriptor.length, "vs", storedDescriptor.length);
              toast({
                title: 'Data mismatch',
                description: 'Your biometric data is in an incompatible format. Please re-register your face.',
                variant: 'destructive',
              });
              setLoading(false);
              return;
            }

            const isMatch = compareFaceDescriptors(capturedDescriptor, storedDescriptor);
          console.log("Auth: Face match result:", isMatch);

        
        if (isMatch) {
          toast({
            title: 'Face Verified!',
            description: 'Signing you in...',
          });
          
          console.log("Auth: Requesting Magic Link...");
          const { error } = await supabase.auth.signInWithOtp({ 
            email,
            options: {
              emailRedirectTo: window.location.origin,
            }
          });
          
          if (error) {
            console.error("Auth: Magic Link error:", error);
            let description = error.message;
            
            // Handle Supabase 429 Rate Limit error specifically
            if (error.message.includes("security purposes") || error.message.includes("Too Many Requests")) {
              const seconds = error.message.match(/\d+/)?.[0] || "60";
              description = `Security cooldown active. Please wait ${seconds} seconds before trying face login again. You can also use your password instead.`;
            }

            toast({
              title: 'Verification paused',
              description: description,
              variant: 'destructive',
            });
          } else {
            console.log("Auth: Magic Link sent successfully.");
            toast({
              title: 'Success!',
              description: 'Check your email for the login link.',
            });
          }
        } else {
          toast({
            title: 'Recognition failed',
            description: 'The face does not match our records.',
            variant: 'destructive',
          });
        }
      } else {
        console.log("Auth: Face captured for registration.");
        setFaceDescriptor(capturedDescriptor);
        toast({
          title: 'Face captured!',
          description: 'Your face data will be saved when you complete the registration.',
        });
      }
    } catch (err) {
      console.error("Auth: onFaceCapture Exception:", err);
      toast({
        title: 'Error',
        description: 'An error occurred during face recognition.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log("Auth: onFaceCapture process complete.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password, faceDescriptor || undefined);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          // Success! User is authenticated.
          // The faceDescriptor link happened inside AuthContext.signIn already.
          if (faceDescriptor) {
            toast({
              title: 'Identity Linked',
              description: 'Your biometric signature has been added to your profile.',
            });
          } else {
            toast({
              title: 'Welcome back!',
              description: 'You have been signed in successfully.',
            });
          }
          navigate('/');
        }
      } else {
        if (!fullName.trim()) {
          toast({
            title: 'Name required',
            description: 'Please enter your full name.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }
        
        const { error } = await signUp(email, password, fullName, role, {
          face_descriptor: faceDescriptor,
          pin_code: signupPin
        });
        if (error) {
          toast({
            title: 'Sign up failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to Memory Friend.',
          });
          navigate('/');
        }
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-0">
      <AnimatePresence>
        {showFaceModal && (
          <FaceRecognitionModal
            key="face-modal"
            onClose={() => setShowFaceModal(false)}
            onCapture={onFaceCapture}
            onUsePin={() => {
              setShowFaceModal(false);
              setShowPinInput(true);
            }}
            title={isLogin ? "Neural Identity Check" : "Scan Neutral Map"}
            description={isLogin ? "Scanning biometric signatures to confirm access" : "Map your facial contours for future identity verification"}
          />
        )}
        {showPinInput && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <Card className="w-full max-w-md bg-slate-900 border-white/10 text-white rounded-[40px] p-8 space-y-6">
              <div className="text-center space-y-2">
                <ShieldCheck className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-black uppercase tracking-widest">Enter Access PIN</h2>
                <p className="text-sm text-white/40">Provide your 4-6 digit security code</p>
              </div>
              <Input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="h-20 text-center text-4xl font-black tracking-[0.5em] bg-white/5 border-white/10 rounded-2xl"
                autoFocus
              />
              <div className="grid grid-cols-2 gap-4">
                <Button variant="ghost" onClick={() => setShowPinInput(false)} className="h-14 rounded-xl uppercase font-bold">Cancel</Button>
                <Button onClick={handlePinLogin} className="h-14 rounded-xl bg-primary text-white uppercase font-black tracking-widest">Verify PIN</Button>
              </div>
            </Card>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-10 pb-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-3 mb-6 relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg relative border border-white/20">
              <Brain className="w-12 h-12 text-white animate-pulse-soft" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 mb-2">
            Memory Hub
          </h1>
          <p className="text-muted-foreground text-xl flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Empowering your cognitive journey
          </p>
        </div>

        <Card className="border-white/20 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden relative border">
          <div className="absolute top-0 right-0 p-4">
            <ShieldCheck className="w-6 h-6 text-primary/40" />
          </div>
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {isLogin ? 'Welcome Home' : 'Begin Journey'}
            </CardTitle>
            <CardDescription className="text-lg">
              {isLogin ? 'Access your digital memory palace' : 'Create your unique identity profile'}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 py-2"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                      <Input
                        className="h-14 bg-white/50 border-white/30 rounded-2xl text-lg focus:ring-primary/20"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Identity Role</label>
                      <div className="grid grid-cols-3 gap-3">
                        {(['elder', 'caregiver', 'family'] as const).map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setRole(r)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${
                              role === r
                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                                : 'bg-white/30 border-white/40 text-muted-foreground hover:bg-white/50'
                            }`}
                          >
                            {r === 'elder' && <Heart className="w-6 h-6 mb-2" />}
                            {r === 'caregiver' && <Users className="w-6 h-6 mb-2" />}
                            {r === 'family' && <Sparkles className="w-6 h-6 mb-2" />}
                            <span className="text-xs font-bold uppercase tracking-tighter">
                              {r}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Digital Mailbox</label>
                  <Input
                    className="h-14 bg-white/50 border-white/30 rounded-2xl text-lg focus:ring-primary/20"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                  {!isLogin && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground ml-1">Access PIN (Quick Login)</label>
                      <Input
                        className="h-14 bg-white/50 border-white/30 rounded-2xl text-lg focus:ring-primary/20"
                        placeholder="4-6 digit code"
                        type="password"
                        maxLength={6}
                        value={signupPin}
                        onChange={(e) => setSignupPin(e.target.value.replace(/\D/g, ''))}
                        required={!isLogin}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Security Phrase</label>

                    {isLogin && <button type="button" className="text-xs text-primary/70 hover:text-primary underline">Forgot?</button>}
                  </div>
                  <Input
                    className="h-14 bg-white/50 border-white/30 rounded-2xl text-lg focus:ring-primary/20"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-4">
                <Button
                  type="submit"
                  className="w-full h-16 rounded-2xl text-xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  ) : (
                    isLogin ? 'Enter Hub' : 'Initialize Profile'
                  )}
                </Button>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/30" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-bold text-muted-foreground bg-transparent transition-all">
                      <span className="px-4 bg-[#f8fafc]/30 backdrop-blur-md italic">Neural Link Layer</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthLogin('google')}
                      disabled={loading}
                      className="h-14 rounded-2xl border-white/40 bg-white/30 hover:bg-white/50 flex items-center gap-3 font-bold"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOAuthLogin('github')}
                      disabled={loading}
                      className="h-14 rounded-2xl border-white/40 bg-white/30 hover:bg-white/50 flex items-center gap-3 font-bold"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                      </svg>
                      GitHub
                    </Button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleFaceLogin}
                  disabled={loading}
                  variant="outline"
                  className={`w-full h-16 rounded-2xl flex items-center justify-center gap-4 text-lg font-bold border-2 transition-all duration-300 active:scale-[0.98] ${
                    faceDescriptor 
                      ? 'bg-green-50/50 border-green-200 text-green-700' 
                      : 'bg-white/50 border-white text-foreground hover:bg-white/80'
                  }`}
                >
                  {faceDescriptor ? (
                    <>
                      <ShieldCheck className="h-7 w-7 text-green-600 animate-pulse" />
                      Face Map Locked
                    </>
                  ) : (
                    <>
                      <Camera className="h-7 w-7 text-primary" />
                      {isLogin ? 'Biometric Access' : 'Register Bio-Key'}
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-10 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="group relative inline-flex flex-col items-center"
              >
                <span className="text-muted-foreground text-sm font-medium">
                  {isLogin ? "No digital presence yet?" : "Already part of the collective?"}
                </span>
                <span className="text-primary font-bold text-lg group-hover:underline decoration-2 underline-offset-4">
                  {isLogin ? 'Initialize New Account' : 'Return to Gate'}
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


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
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    setShowFaceModal(false);
    setLoading(true);

    try {
      if (isLogin) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('face_descriptor, email')
          .eq('email', email)
          .maybeSingle();

        if (profileError || !profile?.face_descriptor) {
          toast({
            title: 'Face Login unavailable',
            description: 'No face profile found for this email. Please use your password.',
            variant: 'destructive',
          });
          setLoading(false);
          return;
        }

        const isMatch = compareFaceDescriptors(capturedDescriptor, profile.face_descriptor as number[]);
        
        if (isMatch) {
          toast({
            title: 'Face Verified!',
            description: 'Signing you in...',
          });
          
          const { error } = await supabase.auth.signInWithOtp({ email });
          
          if (error) {
            toast({
              title: 'Verification failed',
              description: error.message,
              variant: 'destructive',
            });
          } else {
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
        setFaceDescriptor(capturedDescriptor);
        toast({
          title: 'Face captured!',
          description: 'Your face data will be saved when you complete the registration.',
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: 'An error occurred during face recognition.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Sign in failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have been signed in successfully.',
          });
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
          face_descriptor: faceDescriptor
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
            onClose={() => setShowFaceModal(false)}
            onCapture={onFaceCapture}
            title={isLogin ? "Neural Identity Check" : "Scan Neutral Map"}
            description={isLogin ? "Scanning biometric signatures to confirm access" : "Map your facial contours for future identity verification"}
          />
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


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Heart, Brain, Users, Camera } from 'lucide-react';
import type { UserRole } from '@/types';
import { FaceRecognitionModal } from '@/components/FaceRecognitionModal';
import { supabase } from '@/integrations/supabase/client';
import { compareFaceDescriptors } from '@/lib/face-recognition';

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
        // Find profile by email
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
          
          // Using a bypass for demo purposes if configured, or just normal sign in
          // Realistic approach: signInWithOtp
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
        // Registration mode
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
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
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
    <div className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-4">
      {showFaceModal && (
        <FaceRecognitionModal
          onClose={() => setShowFaceModal(false)}
          onCapture={onFaceCapture}
          title={isLogin ? "Sign In with Face" : "Register Face"}
          description={isLogin ? "Look at the camera to verify your identity" : "Capture your face to enable faster logins later"}
        />
      )}
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-button">
              <Brain className="w-9 h-9 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold text-foreground">Memory Friend</h1>
          <p className="text-muted-foreground text-lg mt-2">Your caring memory companion</p>
        </div>

        <Card variant="elder" className="animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle elder className="text-2xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <CardDescription elder>
              {isLogin ? 'Sign in to continue' : 'Join Memory Friend today'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-lg font-medium">Your Name</label>
                    <Input
                      elder
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  
                    <div className="space-y-3">
                      <label className="text-lg font-medium">I am a...</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRole('elder')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            role === 'elder'
                              ? 'border-primary bg-primary/10 shadow-soft'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Heart className={`w-8 h-8 mx-auto mb-2 ${role === 'elder' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-bold ${role === 'elder' ? 'text-primary' : 'text-foreground'}`}>
                            Elder
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('caregiver')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            role === 'caregiver'
                              ? 'border-primary bg-primary/10 shadow-soft'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Users className={`w-8 h-8 mx-auto mb-2 ${role === 'caregiver' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-bold ${role === 'caregiver' ? 'text-primary' : 'text-foreground'}`}>
                            Caregiver
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('family')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            role === 'family'
                              ? 'border-primary bg-primary/10 shadow-soft'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Heart className={`w-8 h-8 mx-auto mb-2 ${role === 'family' ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-bold ${role === 'family' ? 'text-primary' : 'text-foreground'}`}>
                            Family
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

              <div className="space-y-2">
                <label className="text-lg font-medium">Email</label>
                <Input
                  elder
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-lg font-medium">Password</label>
                <Input
                  elder
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

                <Button
                  type="submit"
                  variant="elder"
                  size="elderLg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  elder
                  size="elderLg"
                  className="w-full gap-3 py-6"
                  onClick={handleFaceLogin}
                  disabled={loading}
                >
                  <Camera className={`h-6 w-6 ${faceDescriptor ? 'text-green-500' : 'text-primary'}`} />
                  {faceDescriptor ? 'Face Captured ✓' : isLogin ? 'Sign in with Face' : 'Register Face ID'}
                </Button>
              </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-lg text-primary hover:underline"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

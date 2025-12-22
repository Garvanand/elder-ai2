import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera, RefreshCw, X, ShieldCheck, Zap, Sparkles, Scan, Loader2 } from 'lucide-react';
import { loadModels, getFaceDescriptor } from '@/lib/face-recognition';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface FaceRecognitionModalProps {
  onCapture: (descriptor: number[]) => void;
  onClose: () => void;
  onUsePin?: () => void;
  title: string;
  description: string;
}

export function FaceRecognitionModal({ onCapture, onClose, onUsePin, title, description }: FaceRecognitionModalProps) {
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'analyzing' | 'verifying'>('initializing');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: any;

    async function setup() {
      try {
        setStatus('initializing');
        
        // Start loading models and camera in parallel
        const modelsPromise = loadModels();
        const cameraPromise = navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, // Lower resolution for speed
            height: { ideal: 480 },
            facingMode: "user"
          } 
        });

        // Set a timeout to catch hanging connections
        timeoutId = setTimeout(() => {
          if (loading && isMounted) {
            console.warn("Neural Link initialization taking too long, forcing ready...");
            setLoading(false);
            setStatus('ready');
          }
        }, 8000);

        const [_, stream] = await Promise.all([modelsPromise, cameraPromise]);
        
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Clear any previous plays
          videoRef.current.onloadedmetadata = async () => {
            if (videoRef.current && isMounted) {
              try {
                await videoRef.current.play();
                setLoading(false);
                setStatus('ready');
                clearTimeout(timeoutId);
              } catch (e) {
                console.error("Auto-play failed:", e);
                // Fallback for some browsers
                setLoading(false);
                setStatus('ready');
              }
            }
          };
        }
      } catch (error) {
        console.error('Face recognition setup failed:', error);
        if (isMounted) {
          toast({
            title: 'Neural Link Error',
            description: 'Could not establish visual connection. Ensure camera access is enabled.',
            variant: 'destructive',
          });
          onClose();
        }
      }
    }
    setup();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose, toast]);

  const handleCapture = async () => {
    if (!videoRef.current || capturing) return;
    setCapturing(true);
    setStatus('analyzing');
    try {
      // Small visual pause for impact but reduced for "quickness"
      await new Promise(r => setTimeout(r, 100));
      
      const descriptor = await getFaceDescriptor(videoRef.current);
      if (descriptor) {
        setStatus('verifying');
        // Very small delay before confirming
        await new Promise(r => setTimeout(r, 300));
        onCapture(descriptor);
      } else {
        toast({
          title: 'Signature Not found',
          description: 'Ensure your face is within the scanner frame and well-lit.',
          variant: 'destructive',
        });
        setStatus('ready');
      }
    } catch (error) {
      toast({
        title: 'Neural Engine Error',
        description: 'Failed to synthesize facial map.',
        variant: 'destructive',
      });
      setStatus('ready');
    } finally {
      if (status !== 'verifying') {
        setCapturing(false);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl relative"
      >
        <Card className="bg-slate-900/90 border-white/10 text-white rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(var(--primary-rgb),0.3)]">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-[shimmer_2s_infinite]" />
          
          <CardHeader className="relative pt-12 pb-6 px-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-6 top-6 rounded-full h-12 w-12 hover:bg-white/10 text-white/60" 
              onClick={onClose}
            >
              <X className="h-8 w-8" />
            </Button>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-primary/20 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Biometric Protocol 0x44</p>
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter uppercase">{title}</CardTitle>
            <CardDescription className="text-lg text-white/50">{description}</CardDescription>
          </CardHeader>

          <CardContent className="px-10 pb-12 space-y-8">
            <div className="relative aspect-video bg-black rounded-[32px] overflow-hidden border border-white/10 group shadow-inner">
              {/* Dynamic Scanner Lines */}
              {!loading && status === 'ready' && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  <motion.div 
                    animate={{ y: ['0%', '100%', '0%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-full h-[2px] bg-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.8)]"
                  />
                  {/* Corner brackets */}
                  <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-primary/40 rounded-tl-xl" />
                  <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-primary/40 rounded-tr-xl" />
                  <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-primary/40 rounded-bl-xl" />
                  <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-primary/40 rounded-br-xl" />
                </div>
              )}

              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-slate-900/50 backdrop-blur-md">
                  <div className="relative">
                    <RefreshCw className="h-16 w-16 animate-spin text-primary opacity-50" />
                    <Loader2 className="h-16 w-16 animate-spin text-primary absolute inset-0" style={{ animationDirection: 'reverse', animationDuration: '3s' }} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-xl font-black uppercase tracking-widest animate-pulse">Initializing Neural Link</p>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter">Establishing optical stream...</p>
                  </div>
                </div>
              ) : (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover mirror grayscale brightness-110 active:grayscale-0 transition-all duration-700"
                />
              )}
              
              <AnimatePresence>
                {status === 'analyzing' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm z-20"
                  >
                    <div className="text-center space-y-4">
                      <Scan className="w-20 h-20 text-white animate-pulse mx-auto" />
                      <p className="text-2xl font-black uppercase tracking-[0.3em] text-white">Synthesizing Mask</p>
                    </div>
                  </motion.div>
                )}
                {status === 'verifying' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-md z-20"
                  >
                    <div className="text-center space-y-4">
                      <ShieldCheck className="w-20 h-20 text-emerald-400 animate-bounce mx-auto" />
                      <p className="text-2xl font-black uppercase tracking-[0.3em] text-emerald-400">Identity Confirmed</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 px-8">
                <div className="bg-black/80 backdrop-blur-xl px-6 py-3 rounded-2xl text-white border border-white/10 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${status === 'ready' ? 'bg-emerald-500' : 'bg-primary'} animate-pulse`} />
                  <p className="text-xs font-black uppercase tracking-widest opacity-80">
                    {status === 'ready' ? 'System Ready: Align Face' : 'Neural Stream Busy...'}
                  </p>
                </div>
              </div>
            </div>

              <div className="grid grid-cols-2 gap-6">
                {(onUsePin && status === 'ready') ? (
                  <Button 
                    variant="outline" 
                    size="elderLg" 
                    onClick={onUsePin}
                    className="h-20 rounded-[24px] border-primary/20 bg-white/5 hover:bg-white/10 text-primary font-black uppercase tracking-widest transition-all gap-3"
                  >
                    <ShieldCheck className="w-6 h-6" />
                    Use PIN
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="elderLg" 
                    onClick={onClose}
                    className="h-20 rounded-[24px] border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest transition-all"
                  >
                    Abort Link
                  </Button>
                )}
                <Button 
                  onClick={handleCapture}
                disabled={loading || capturing}
                className="h-20 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 gap-4 group transition-all active:scale-95"
              >
                {capturing ? (
                  <RefreshCw className="h-8 w-8 animate-spin" />
                ) : (
                  <Zap className="h-8 w-8 group-hover:fill-current" />
                )}
                {capturing ? 'Analyzing...' : 'Execute Scan'}
              </Button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 p-6 rounded-[32px] border border-white/5 flex items-start gap-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-primary">Biometric Tips</p>
                <p className="text-sm text-white/60 font-medium leading-relaxed italic">
                  Neural fidelity is highest in uniform lighting. Maintain stability and gaze into the optical input.
                </p>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Camera, Users, ShieldCheck, Search, Loader2 } from 'lucide-react';
import { loadModels, getFaceDescriptor, compareFaceDescriptors } from '@/lib/face-recognition';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PeopleScannerProps {
  elderId: string;
  onClose: () => void;
}

export function PeopleScanner({ elderId, onClose }: PeopleScannerProps) {
  const [initializing, setInitializing] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [recognizedPerson, setRecognizedPerson] = useState<{ name: string; relationship: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function setup() {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setInitializing(false);
      } catch (err) {
        console.error(err);
        toast({ title: 'Scanner Error', description: 'Could not access camera.', variant: 'destructive' });
        onClose();
      }
    }
    setup();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleScan = async () => {
    if (!videoRef.current || scanning) return;
    setScanning(true);
    setRecognizedPerson(null);

    try {
      const descriptor = await getFaceDescriptor(videoRef.current);
      if (!descriptor) {
        toast({ title: 'No person detected', description: 'Please ensure someone is in front of the camera.' });
        setScanning(false);
        return;
      }

      // Fetch family profiles
      const { data: profiles } = await supabase
        .from('family_face_profiles' as any)
        .select('*')
        .eq('elder_id', elderId);

      if (profiles) {
        for (const profile of profiles) {
          const isMatch = compareFaceDescriptors(descriptor, profile.face_descriptor as number[]);
          if (isMatch) {
            setRecognizedPerson({ name: profile.name, relationship: profile.relationship });
            toast({ title: `Link Established: ${profile.name}`, description: `Identified as your ${profile.relationship}.` });
            break;
          }
        }
      }

      if (!recognizedPerson && !recognizedPerson) {
        // We'll check again after the loop if nothing was found
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6">
      <Card className="w-full max-w-3xl bg-slate-900 border-white/10 text-white rounded-[48px] overflow-hidden shadow-2xl">
        <CardContent className="p-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-primary">Neural Proximity Scan</p>
              <h2 className="text-4xl font-black tracking-tighter uppercase">Identify Friend</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
              <Users className="w-8 h-8 opacity-60" />
            </Button>
          </div>

          <div className="relative aspect-video bg-black rounded-[40px] overflow-hidden border border-white/10">
            {initializing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Warming Sensors...</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale brightness-125" />
            )}

            <AnimatePresence>
              {scanning && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-sm"
                >
                  <Search className="w-20 h-20 text-white animate-pulse" />
                </motion.div>
              )}
              {recognizedPerson && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-md"
                >
                  <div className="text-center space-y-4">
                    <ShieldCheck className="w-24 h-24 text-emerald-400 mx-auto animate-bounce" />
                    <p className="text-4xl font-black uppercase tracking-tighter">{recognizedPerson.name}</p>
                    <p className="text-lg font-bold text-emerald-400/80 uppercase tracking-[0.2em]">{recognizedPerson.relationship}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <Button 
              onClick={handleScan}
              disabled={initializing || scanning}
              className="h-24 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
            >
              {scanning ? 'Analyzing Signature...' : 'Execute Identify Scan'}
            </Button>
            <Button variant="ghost" onClick={onClose} className="text-white/60 uppercase font-black tracking-widest">
              Deactivate Scanner
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

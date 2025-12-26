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

  const [mode, setMode] = useState<'scan' | 'register'>('scan');
  const [registerName, setRegisterName] = useState('');
  const [registerRelationship, setRegisterRelationship] = useState('');
  const [capturedDescriptor, setCapturedDescriptor] = useState<number[] | null>(null);

  const handleScan = async () => {
    if (!videoRef.current || scanning) return;
    setScanning(true);
    setRecognizedPerson(null);

    try {
      const descriptorArray = await getFaceDescriptor(videoRef.current);
      if (!descriptorArray) {
        toast({ title: 'No person detected', description: 'Please ensure someone is in front of the camera.' });
        setScanning(false);
        return;
      }
      
      const descriptor = Array.from(descriptorArray);

      if (mode === 'register') {
        setCapturedDescriptor(descriptor);
        toast({ title: 'Face Captured', description: 'Now please enter the name and relationship.' });
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
          const isMatch = compareFaceDescriptors(new Float32Array(descriptor), profile.face_descriptor as number[]);
          if (isMatch) {
            setRecognizedPerson({ name: profile.name, relationship: profile.relationship });
            toast({ title: `Found: ${profile.name}`, description: `This is your ${profile.relationship}.` });
            break;
          }
        }
      }

      if (!recognizedPerson) {
        toast({ title: 'Unknown Person', description: 'I do not recognize this face. You can register them below.' });
      }
      
    } catch (err) {
      console.error(err);
      toast({ title: 'Scan Failed', description: 'Could not process the face scan.', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

    const handleRegister = async () => {
      if (!capturedDescriptor || !registerName) return;
      
      setScanning(true);
      try {
        const { error } = await supabase
          .from('family_face_profiles')
          .insert({
            elder_id: elderId,
            name: registerName,
            relationship: registerRelationship,
            face_descriptor: capturedDescriptor,
          });

      if (error) throw error;

      toast({ title: 'Person Registered', description: `${registerName} has been added to your circle.` });
      setMode('scan');
      setRegisterName('');
      setRegisterRelationship('');
      setCapturedDescriptor(null);
    } catch (err) {
      console.error(err);
      toast({ title: 'Registration Failed', description: 'Could not save the identity.', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6">
      <Card className="w-full max-w-3xl bg-white text-slate-900 rounded-[48px] overflow-hidden shadow-2xl">
        <CardContent className="p-12 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Identity Check</p>
              <h2 className="text-4xl font-black tracking-tighter uppercase">
                {mode === 'scan' ? 'Who is this?' : 'Register Friend'}
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
              <Users className="w-8 h-8 opacity-60" />
            </Button>
          </div>

          <div className="relative aspect-video bg-slate-100 rounded-[40px] overflow-hidden border-4 border-slate-100 shadow-inner">
            {initializing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-40">Opening Camera...</p>
              </div>
            ) : (
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            )}

            <AnimatePresence>
              {scanning && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm"
                >
                  <Search className="w-20 h-20 text-primary animate-pulse" />
                </motion.div>
              )}
              {recognizedPerson && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-green-500/10 backdrop-blur-md"
                >
                  <div className="text-center space-y-4">
                    <ShieldCheck className="w-24 h-24 text-green-600 mx-auto" />
                    <p className="text-5xl font-black uppercase tracking-tighter">{recognizedPerson.name}</p>
                    <p className="text-xl font-bold text-green-700 uppercase tracking-widest">{recognizedPerson.relationship}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            {mode === 'register' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest ml-4">Name</label>
                    <input 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary transition-all text-lg font-bold"
                      placeholder="e.g. Garv"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest ml-4">Relationship</label>
                    <input 
                      className="w-full h-16 px-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-primary transition-all text-lg font-bold"
                      placeholder="e.g. Grandson"
                      value={registerRelationship}
                      onChange={(e) => setRegisterRelationship(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 gap-4">
              {mode === 'scan' ? (
                <>
                  <Button 
                    onClick={handleScan}
                    disabled={initializing || scanning}
                    className="h-24 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black uppercase tracking-widest shadow-xl"
                  >
                    {scanning ? 'Looking...' : 'Identify Person'}
                  </Button>
                  <Button variant="outline" onClick={() => setMode('register')} className="h-16 rounded-2xl font-bold uppercase tracking-widest">
                    Add a New Person
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    onClick={capturedDescriptor ? handleRegister : handleScan}
                    disabled={initializing || scanning || (capturedDescriptor && !registerName)}
                    className="h-24 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black uppercase tracking-widest shadow-xl"
                  >
                    {!capturedDescriptor ? 'Capture Face' : 'Save Identity'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setMode('scan'); setCapturedDescriptor(null); }} className="h-12 font-bold uppercase tracking-widest">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

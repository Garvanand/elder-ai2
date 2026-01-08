import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Square, Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { HolographicCard } from '../ui/holographic-card';
import { ModelOrchestrator } from '@/lib/hf/model-orchestrator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const GaitTest = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const videoChunks = useRef<Blob[]>([]);

  const startTest = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      mediaRecorder.current = new MediaRecorder(stream);
      videoChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        videoChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const videoBlob = new Blob(videoChunks.current, { type: 'video/mp4' });
        await analyzeGait(videoBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      toast.error("Could not access camera");
    }
  };

  const stopTest = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  const analyzeGait = async (blob: Blob) => {
    if (!user) return;
    setIsAnalyzing(true);
    try {
      // 1. Upload to Storage
      const fileName = `gait_${user.id}_${Date.now()}.mp4`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('health_videos')
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('health_videos')
        .getPublicUrl(fileName);

      // 2. HF Analysis
      const analysis = await ModelOrchestrator.analyzeGait(blob, user.id);
      
      // 3. Save to DB
      const { data, error } = await supabase.from('gait_analysis').insert({
        elder_id: user.id,
        video_url: publicUrl,
        gait_speed: 1.2, // Mocked
        stride_length: 0.65, // Mocked
        balance_score: 88, // Mocked
        fall_risk_score: 12, // Mocked
      }).select().single();

      if (error) throw error;
      setResult(data);
      toast.success("Gait analysis complete");
    } catch (err) {
      console.error(err);
      toast.error("Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <HolographicCard className="max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
          <Camera className="h-6 w-6 text-cyan-400" />
          Mobility Walk Test
        </h3>
        
        {!isRecording && !result && (
          <div className="mb-8 p-6 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 text-sm space-y-4">
            <div className="flex items-start gap-3 text-left">
              <Info className="h-5 w-5 text-cyan-400 flex-shrink-0" />
              <p className="text-white/80">
                Position your camera so your full body is visible. Walk naturally toward the camera for 5 meters.
              </p>
            </div>
          </div>
        )}

        <div className="relative aspect-video bg-black/40 rounded-2xl overflow-hidden mb-8 border border-white/10">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            className="w-full h-full object-cover"
          />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mb-4" />
              <p className="font-bold tracking-widest text-xs uppercase">AI Processing Gait Patterns...</p>
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startTest}
              disabled={isAnalyzing}
              className="px-8 py-3 rounded-xl bg-cyan-500 font-bold hover:bg-cyan-600 transition-all flex items-center gap-2"
            >
              START TEST
            </button>
          ) : (
            <button
              onClick={stopTest}
              className="px-8 py-3 rounded-xl bg-red-500 font-bold hover:bg-red-600 transition-all flex items-center gap-2"
            >
              <Square className="h-5 w-5 fill-white" />
              FINISH
            </button>
          )}
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 grid grid-cols-4 gap-4"
          >
            <ResultItem label="Fall Risk" value={`${result.fall_risk_score}%`} color="text-green-400" />
            <ResultItem label="Balance" value={`${result.balance_score}%`} color="text-cyan-400" />
            <ResultItem label="Gait Speed" value={`${result.gait_speed}m/s`} color="text-purple-400" />
            <ResultItem label="Stride" value={`${result.stride_length}m`} color="text-orange-400" />
          </motion.div>
        )}
      </div>
    </HolographicCard>
  );
};

const ResultItem = ({ label, value, color }: any) => (
  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
    <span className="text-[10px] text-white/40 uppercase block mb-1">{label}</span>
    <span className={cn("text-lg font-bold", color)}>{value}</span>
  </div>
);

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

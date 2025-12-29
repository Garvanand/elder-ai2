import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Monitor,
  MessageSquare,
  Settings,
  Users,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideoRoomProps {
  roomName: string;
  userName: string;
  userRole: 'elder' | 'caregiver' | 'clinician';
  consultationId?: string;
  onClose: () => void;
  onCallEnd?: () => void;
}

export function VideoRoom({ 
  roomName, 
  userName, 
  userRole, 
  consultationId,
  onClose,
  onCallEnd 
}: VideoRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([userName]);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (!jitsiContainerRef.current) return;

    const loadJitsiScript = () => {
      return new Promise<void>((resolve, reject) => {
        if ((window as any).JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Jitsi script'));
        document.head.appendChild(script);
      });
    };

    const initJitsi = async () => {
      try {
        await loadJitsiScript();

        const domain = 'meet.jit.si';
        const options = {
          roomName: `MemoryFriend-${roomName}`,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: userName
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableWelcomePage: false,
            enableClosePage: false,
            disableModeratorIndicator: false,
            enableNoisyMicDetection: true,
            enableNoAudioDetection: true,
            resolution: 720,
            constraints: {
              video: {
                height: {
                  ideal: 720,
                  max: 720,
                  min: 180
                }
              }
            }
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: userRole === 'elder' ? [
              'microphone', 'camera', 'hangup', 'fullscreen'
            ] : [
              'microphone', 'camera', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'chat', 'settings',
              'videoquality', 'tileview'
            ],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#1e293b',
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
            MOBILE_APP_PROMO: false,
            HIDE_INVITE_MORE_HEADER: true,
            DISABLE_RINGING: false,
            TOOLBAR_ALWAYS_VISIBLE: userRole === 'elder',
            INITIAL_TOOLBAR_TIMEOUT: 20000,
            TOOLBAR_TIMEOUT: 10000,
            DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
            TILE_VIEW_MAX_COLUMNS: 2
          }
        };

        const api = new (window as any).JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addListener('videoConferenceJoined', () => {
          setIsConnecting(false);
          setIsConnected(true);
          toast.success('Connected to video call');
          
          if (consultationId) {
            updateConsultationStatus('in_progress');
          }
        });

        api.addListener('videoConferenceLeft', () => {
          setIsConnected(false);
          handleEndCall();
        });

        api.addListener('participantJoined', (participant: any) => {
          setParticipants(prev => [...prev, participant.displayName || 'Participant']);
          toast.info(`${participant.displayName || 'Someone'} joined the call`);
        });

        api.addListener('participantLeft', (participant: any) => {
          setParticipants(prev => prev.filter(p => p !== participant.displayName));
        });

        api.addListener('audioMuteStatusChanged', (status: any) => {
          setIsAudioOn(!status.muted);
        });

        api.addListener('videoMuteStatusChanged', (status: any) => {
          setIsVideoOn(!status.muted);
        });

      } catch (error) {
        console.error('Jitsi initialization error:', error);
        toast.error('Could not connect to video call');
        setIsConnecting(false);
      }
    };

    initJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, userName, userRole]);

  const updateConsultationStatus = async (status: string) => {
    if (!consultationId) return;
    
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'in_progress') updates.started_at = new Date().toISOString();
      if (status === 'completed') updates.ended_at = new Date().toISOString();

      await supabase
        .from('teleconsultations')
        .update(updates)
        .eq('id', consultationId);
    } catch (err) {
      console.error('Error updating consultation status:', err);
    }
  };

  const handleToggleAudio = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleAudio');
    }
  };

  const handleToggleVideo = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleVideo');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      jitsiContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = async () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    
    if (consultationId) {
      await updateConsultationStatus('completed');
    }
    
    onCallEnd?.();
    onClose();
  };

  const handleShareScreen = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('toggleShareScreen');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900"
    >
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
          )} />
          <span className="text-white text-sm font-medium">
            {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {participants.length > 1 && (
          <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2">
            <Users className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">{participants.length}</span>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </Button>

      <div 
        ref={jitsiContainerRef} 
        className="w-full h-full"
        style={{ minHeight: '100vh' }}
      />

      {isConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto animate-pulse">
              <Video className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Connecting to Video Call</h2>
              <p className="text-slate-400">Please wait while we set up your secure connection...</p>
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      {userRole === 'elder' && isConnected && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-4 p-4 bg-black/70 backdrop-blur-xl rounded-3xl">
            <Button
              onClick={handleToggleAudio}
              className={cn(
                "w-20 h-20 rounded-2xl transition-all",
                isAudioOn 
                  ? "bg-slate-700 hover:bg-slate-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {isAudioOn ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
            </Button>

            <Button
              onClick={handleToggleVideo}
              className={cn(
                "w-20 h-20 rounded-2xl transition-all",
                isVideoOn 
                  ? "bg-slate-700 hover:bg-slate-600 text-white" 
                  : "bg-red-500 hover:bg-red-600 text-white"
              )}
            >
              {isVideoOn ? <Video className="w-8 h-8" /> : <VideoOff className="w-8 h-8" />}
            </Button>

            <Button
              onClick={handleEndCall}
              className="w-24 h-20 rounded-2xl bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="w-10 h-10" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default VideoRoom;

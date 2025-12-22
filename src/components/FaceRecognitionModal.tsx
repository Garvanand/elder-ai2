import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Camera, RefreshCw, X } from 'lucide-react';
import { loadModels, getFaceDescriptor } from '@/lib/face-recognition';
import { useToast } from '@/hooks/use-toast';

interface FaceRecognitionModalProps {
  onCapture: (descriptor: number[]) => void;
  onClose: () => void;
  title: string;
  description: string;
}

export function FaceRecognitionModal({ onCapture, onClose, title, description }: FaceRecognitionModalProps) {
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function setup() {
      try {
        await loadModels();
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setLoading(false);
      } catch (error) {
        console.error('Face recognition setup failed:', error);
        toast({
          title: 'Camera error',
          description: 'Could not access camera or load models.',
          variant: 'destructive',
        });
        onClose();
      }
    }
    setup();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose, toast]);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setCapturing(true);
    try {
      const descriptor = await getFaceDescriptor(videoRef.current);
      if (descriptor) {
        onCapture(descriptor);
      } else {
        toast({
          title: 'Face not detected',
          description: 'Please ensure your face is clearly visible and try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image.',
        variant: 'destructive',
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-sm">
      <Card variant="elder" className="w-full max-w-lg shadow-2xl">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 rounded-full h-10 w-10" 
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
          <CardTitle elder className="text-2xl pt-2">{title}</CardTitle>
          <CardDescription elder>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden shadow-inner border-4 border-primary/20">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <RefreshCw className="h-10 w-10 animate-spin text-primary" />
                <p className="font-medium animate-pulse">Initializing camera...</p>
              </div>
            ) : (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover mirror"
              />
            )}
            
            {!loading && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                <div className="bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium border border-white/20">
                  Align your face in the center
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              elder 
              size="elderLg" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              variant="elder" 
              elder 
              size="elderLg"
              onClick={handleCapture}
              disabled={loading || capturing}
              className="gap-2"
            >
              {capturing ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Camera className="h-6 w-6" />
              )}
              {capturing ? 'Analyzing...' : 'Capture Face'}
            </Button>
          </div>
          
          <div className="bg-secondary/30 p-4 rounded-xl space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs">i</span>
              Quick Tips for Elders:
            </p>
            <ul className="text-xs space-y-1 ml-8 list-disc text-muted-foreground">
              <li>Make sure there's enough light on your face</li>
              <li>Remove glasses if they're reflecting light</li>
              <li>Keep a neutral expression and look at the lens</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

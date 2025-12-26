import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, PhoneCall, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEmergency } from '@/hooks/useEmergency';

interface PanicButtonProps {
  elderId: string | undefined;
}

export const PanicButton: React.FC<PanicButtonProps> = ({ elderId }) => {
  const { triggerEmergency } = useEmergency(elderId);
  const [isPressing, setIsPressing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const startPanic = () => {
    setIsPressing(true);
    setCountdown(3);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          triggerEmergency('panic');
          setIsPressing(false);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelPanic = () => {
    setIsPressing(false);
    setCountdown(null);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isPressing && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute bottom-24 right-0 bg-white p-6 rounded-2xl shadow-2xl border-4 border-red-500 w-64 text-center"
          >
            <h3 className="text-2xl font-bold text-red-600 mb-2">EMERGENCY!</h3>
            <p className="text-gray-600 mb-4">Notifying help in...</p>
            <div className="text-6xl font-black text-red-500 mb-4">{countdown}</div>
            <Button 
              variant="outline" 
              className="w-full text-lg h-12 border-2"
              onClick={cancelPanic}
            >
              CANCEL
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={!isPressing ? {
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 0 0px rgba(239, 68, 68, 0)",
            "0 0 0 20px rgba(239, 68, 68, 0.2)",
            "0 0 0 0px rgba(239, 68, 68, 0)"
          ]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Button
          onClick={!isPressing ? startPanic : cancelPanic}
          className={`h-24 w-24 rounded-full shadow-2xl ${
            isPressing ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'
          } flex flex-col items-center justify-center gap-1 border-4 border-white`}
        >
          {isPressing ? (
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          ) : (
            <>
              <AlertTriangle className="h-10 w-10 text-white" />
              <span className="font-bold text-xs text-white">PANIC</span>
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

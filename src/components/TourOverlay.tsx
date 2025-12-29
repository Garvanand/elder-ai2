'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '@/contexts/TourContext';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';
import { 
  X, ChevronLeft, ChevronRight, SkipForward, Pause, Play, 
  RotateCcw, Volume2, VolumeX, Gauge, HelpCircle, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TooltipPosition {
  top: number;
  left: number;
  arrowPosition: 'top' | 'bottom' | 'left' | 'right';
}

interface HighlightPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const {
    isActive,
    isPaused,
    currentStep,
    currentTour,
    tourSpeed,
    voiceEnabled,
    nextStep,
    prevStep,
    endTour,
    pauseTour,
    resumeTour,
    restartTour,
    setTourSpeed,
    setVoiceEnabled,
    getCurrentStepData
  } = useTour();

  const { isGuestMode } = useDemo();
  
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [highlightPosition, setHighlightPosition] = useState<HighlightPosition | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const stepData = getCurrentStepData();

  const calculatePositions = useCallback(() => {
    if (!stepData) return;

    const targetEl = document.querySelector(stepData.target);
    
    if (!targetEl || stepData.placement === 'center') {
      setHighlightPosition(null);
      setTooltipPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
        arrowPosition: 'top'
      });
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const padding = stepData.highlightPadding || 8;
    
    setHighlightPosition({
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    });

    const tooltipWidth = 400;
    const tooltipHeight = 200;
    const gap = 16;
    
    let top = 0;
    let left = 0;
    let arrowPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

    switch (stepData.placement) {
      case 'bottom':
        top = rect.bottom + gap + window.scrollY;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = 'top';
        break;
      case 'top':
        top = rect.top - tooltipHeight - gap + window.scrollY;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = 'bottom';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        left = rect.left - tooltipWidth - gap;
        arrowPosition = 'right';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
        left = rect.right + gap;
        arrowPosition = 'left';
        break;
      default:
        top = rect.bottom + gap + window.scrollY;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        arrowPosition = 'top';
    }

    left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));
    top = Math.max(20, top);

    setTooltipPosition({ top, left, arrowPosition });

    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [stepData]);

  useEffect(() => {
    if (isActive && stepData) {
      const timer = setTimeout(calculatePositions, 100);
      
      window.addEventListener('resize', calculatePositions);
      window.addEventListener('scroll', calculatePositions);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', calculatePositions);
        window.removeEventListener('scroll', calculatePositions);
      };
    }
  }, [isActive, stepData, calculatePositions]);

  if (!isActive || !currentTour || !stepData) return null;

  const progress = ((currentStep + 1) / currentTour.steps.length) * 100;

  const overlay = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={endTour} />
        
        {highlightPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute z-[9999] rounded-2xl ring-4 ring-primary ring-offset-4 ring-offset-transparent pointer-events-none"
            style={{
              top: highlightPosition.top,
              left: highlightPosition.left,
              width: highlightPosition.width,
              height: highlightPosition.height,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 40px 10px rgba(var(--primary-rgb), 0.3)'
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl border-2 border-primary/50"
            />
          </motion.div>
        )}

        {tooltipPosition && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
              "fixed z-[10000] w-[400px] max-w-[calc(100vw-40px)]",
              "bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            )}
            style={{
              top: tooltipPosition.top,
              left: tooltipPosition.left
            }}
          >
            <div 
              className={cn(
                "absolute w-4 h-4 bg-white transform rotate-45 border border-white/20",
                tooltipPosition.arrowPosition === 'top' && "top-[-8px] left-1/2 -translate-x-1/2 border-b-0 border-r-0",
                tooltipPosition.arrowPosition === 'bottom' && "bottom-[-8px] left-1/2 -translate-x-1/2 border-t-0 border-l-0",
                tooltipPosition.arrowPosition === 'left' && "left-[-8px] top-1/2 -translate-y-1/2 border-t-0 border-r-0",
                tooltipPosition.arrowPosition === 'right' && "right-[-8px] top-1/2 -translate-y-1/2 border-b-0 border-l-0"
              )}
            />

            <div className="h-1 bg-slate-100">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">
                      Step {currentStep + 1} of {currentTour.steps.length}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">{stepData.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={endTour}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <p className="text-slate-600 text-lg leading-relaxed">
                {stepData.content}
              </p>

              {isGuestMode && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700 font-medium">
                    This is demo data - try interacting with it!
                  </span>
                </div>
              )}
            </div>

            <div className="px-6 pb-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="h-10 px-3 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={isPaused ? resumeTour : pauseTour}
                    className="h-10 px-3 rounded-xl"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={restartTour}
                    className="h-10 px-3 rounded-xl"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={cn("h-10 px-3 rounded-xl", voiceEnabled && "bg-primary/10 text-primary")}
                  >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn("h-10 px-3 rounded-xl", showSettings && "bg-primary/10 text-primary")}
                  >
                    <Gauge className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={endTour}
                    className="h-10 px-4 rounded-xl text-slate-500"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip
                  </Button>
                  
                  <Button
                    onClick={nextStep}
                    className="h-10 px-6 rounded-xl bg-primary hover:bg-primary/90 font-bold"
                  >
                    {currentStep === currentTour.steps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep < currentTour.steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tour Speed</p>
                      <div className="flex gap-2">
                        {(['slow', 'normal', 'fast'] as const).map((speed) => (
                          <button
                            key={speed}
                            onClick={() => setTourSpeed(speed)}
                            className={cn(
                              "flex-1 py-2 px-4 rounded-xl text-sm font-bold capitalize transition-all",
                              tourSpeed === speed 
                                ? "bg-primary text-white" 
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            )}
                          >
                            {speed}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-6 pb-4">
              <div className="flex gap-1">
                {currentTour.steps.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      i === currentStep ? "bg-primary" : i < currentStep ? "bg-primary/40" : "bg-slate-200"
                    )}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );

  if (typeof window === 'undefined') return null;
  
  return createPortal(overlay, document.body);
}

export function GuestModeBadge() {
  const { isGuestMode, exitGuestMode, demoPortal } = useDemo();
  
  if (!isGuestMode) return null;

  const portalLabels = {
    elder: 'Elder Portal',
    caregiver: 'Caregiver Dashboard',
    clinician: 'Clinician Portal'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-24 left-4 z-[100] flex items-center gap-3"
    >
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/30">
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-bold">Guest Mode</span>
        {demoPortal && (
          <>
            <span className="text-amber-200">•</span>
            <span className="text-sm font-medium text-amber-100">
              {portalLabels[demoPortal]}
            </span>
          </>
        )}
      </div>
      <button
        onClick={exitGuestMode}
        className="p-2 bg-white rounded-xl shadow-lg hover:bg-slate-50 transition-colors"
      >
        <X className="w-4 h-4 text-slate-600" />
      </button>
    </motion.div>
  );
}

export function TourTriggerButton({ tourId, className }: { tourId: string; className?: string }) {
  const { startTour, isActive } = useTour();
  
  if (isActive) return null;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => startTour(tourId)}
      className={cn(
        "fixed bottom-6 right-6 z-[90] flex items-center gap-2 px-5 py-3",
        "bg-primary text-white rounded-2xl shadow-lg shadow-primary/30",
        "font-bold text-sm hover:bg-primary/90 transition-colors",
        className
      )}
    >
      <HelpCircle className="w-5 h-5" />
      Take a Tour
    </motion.button>
  );
}

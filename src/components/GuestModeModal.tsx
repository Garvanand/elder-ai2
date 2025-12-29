'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDemo, DemoPortal } from '@/contexts/DemoContext';
import { useTour } from '@/contexts/TourContext';
import { cn } from '@/lib/utils';
import { 
  X, User, Heart, Stethoscope, Sparkles, ArrowRight, 
  Brain, Play, Eye, CheckCircle2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GuestModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const portalOptions = [
  {
    id: 'elder' as DemoPortal,
    title: 'Elder Portal',
    subtitle: 'Experience as a senior',
    description: 'Save memories, view photos, play brain games, and get help remembering important things.',
    icon: User,
    color: 'bg-primary',
    route: '/elder',
    tourId: 'elder-tour',
    features: ['Memory Wall', 'Brain Games', 'AI Assistant', 'Daily Reminders']
  },
  {
    id: 'caregiver' as DemoPortal,
    title: 'Caregiver Dashboard',
    subtitle: 'Experience as a family member',
    description: 'Stay connected with your loved one, monitor their wellbeing, and send loving messages.',
    icon: Heart,
    color: 'bg-rose-500',
    route: '/caregiver',
    tourId: 'caregiver-tour',
    features: ['Health Insights', 'Send Messages', 'View Memories', 'Activity Tracking']
  },
  {
    id: 'clinician' as DemoPortal,
    title: 'Clinician Portal',
    subtitle: 'Experience as a healthcare provider',
    description: 'Access clinical dashboards, patient records, risk assessments, and treatment plans.',
    icon: Stethoscope,
    color: 'bg-emerald-500',
    route: '/clinician',
    tourId: 'clinician-tour',
    features: ['Patient Directory', 'Risk Scores', 'Clinical Notes', 'Treatment Plans']
  }
];

export function GuestModeModal({ isOpen, onClose }: GuestModeModalProps) {
  const navigate = useNavigate();
  const { enterGuestMode } = useDemo();
  const { startTour } = useTour();
  const [selectedPortal, setSelectedPortal] = useState<DemoPortal>(null);
  const [startWithTour, setStartWithTour] = useState(true);

  const handleEnterGuestMode = () => {
    if (!selectedPortal) return;
    
    const portal = portalOptions.find(p => p.id === selectedPortal);
    if (!portal) return;

    enterGuestMode(selectedPortal);
    navigate(portal.route);
    onClose();
    
    if (startWithTour) {
      setTimeout(() => {
        startTour(portal.tourId);
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        >
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            
            <div className="relative p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-3 hover:bg-slate-100 rounded-2xl transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>

              <div className="text-center mb-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl mb-4"
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary uppercase tracking-widest">Guest Mode</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                  Explore Memory Friend
                </h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                  Experience the platform from different perspectives. All data is simulated - feel free to explore!
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {portalOptions.map((portal, i) => (
                  <motion.button
                    key={portal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    onClick={() => setSelectedPortal(portal.id)}
                    className={cn(
                      "relative p-6 rounded-3xl border-2 text-left transition-all duration-300 group",
                      selectedPortal === portal.id
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                        : "border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50"
                    )}
                  >
                    {selectedPortal === portal.id && (
                      <motion.div
                        layoutId="selected-indicator"
                        className="absolute top-4 right-4"
                      >
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </motion.div>
                    )}

                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                      portal.color
                    )}>
                      <portal.icon className="w-7 h-7 text-white" />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-1">{portal.title}</h3>
                    <p className="text-sm text-primary font-medium mb-3">{portal.subtitle}</p>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">{portal.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {portal.features.map((feature) => (
                        <span 
                          key={feature}
                          className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-medium"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStartWithTour(!startWithTour)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 rounded-2xl transition-all",
                    startWithTour 
                      ? "bg-primary/10 text-primary" 
                      : "bg-slate-100 text-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    startWithTour ? "bg-primary border-primary" : "border-slate-300"
                  )}>
                    {startWithTour && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Start with Interactive Tour</p>
                    <p className="text-xs opacity-70">Recommended for first-time visitors</p>
                  </div>
                </button>

                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="h-14 px-8 rounded-2xl font-bold"
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    onClick={handleEnterGuestMode}
                    disabled={!selectedPortal}
                    className={cn(
                      "h-14 px-8 rounded-2xl font-bold transition-all",
                      selectedPortal 
                        ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" 
                        : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {startWithTour ? (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start Tour
                      </>
                    ) : (
                      <>
                        <Eye className="w-5 h-5 mr-2" />
                        Explore Demo
                      </>
                    )}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GuestModeOnboarding() {
  const [step, setStep] = useState(0);
  const { isGuestMode, demoPortal } = useDemo();
  const { startTour } = useTour();
  const [show, setShow] = useState(true);

  if (!isGuestMode || !show) return null;

  const tourId = demoPortal === 'elder' ? 'elder-tour' 
    : demoPortal === 'caregiver' ? 'caregiver-tour' 
    : 'clinician-tour';

  return (
    <AnimatePresence>
      {step === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-[40px] p-10 text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-4">Welcome to Demo Mode!</h2>
            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
              You're now exploring with sample data. Feel free to interact with everything - 
              your changes won't be saved permanently.
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setShow(false);
                  startTour(tourId);
                }}
                className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Guided Tour
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShow(false)}
                className="w-full h-14 rounded-2xl font-bold"
              >
                <Eye className="w-5 h-5 mr-2" />
                Explore on My Own
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightPadding?: number;
  action?: 'click' | 'hover' | 'none';
  nextOnAction?: boolean;
  disableInteraction?: boolean;
}

export interface TourConfig {
  id: string;
  name: string;
  steps: TourStep[];
}

interface TourContextType {
  isActive: boolean;
  isPaused: boolean;
  currentStep: number;
  currentTour: TourConfig | null;
  tourSpeed: 'slow' | 'normal' | 'fast';
  voiceEnabled: boolean;
  startTour: (tourId: string) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  pauseTour: () => void;
  resumeTour: () => void;
  restartTour: () => void;
  setTourSpeed: (speed: 'slow' | 'normal' | 'fast') => void;
  setVoiceEnabled: (enabled: boolean) => void;
  registerTour: (config: TourConfig) => void;
  availableTours: TourConfig[];
  getCurrentStepData: () => TourStep | null;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

const ELDER_TOUR: TourConfig = {
  id: 'elder-tour',
  name: 'Elder Portal Tour',
  steps: [
    {
      id: 'welcome',
      target: '[data-tour="elder-greeting"]',
      title: 'Welcome to Memory Friend!',
      content: 'This is your personal memory companion. Here you can save stories, look at photos, and get help remembering important things.',
      placement: 'bottom'
    },
    {
      id: 'activities',
      target: '[data-tour="daily-activities"]',
      title: "Today's Activities",
      content: 'Your daily reminders and tasks appear here. Just tap "Done" when you complete each one!',
      placement: 'right'
    },
    {
      id: 'save-memory',
      target: '[data-tour="save-memory"]',
      title: 'Save a Story',
      content: 'Tap here to record a new memory. You can type or speak, and add photos too!',
      placement: 'left'
    },
    {
      id: 'photo-album',
      target: '[data-tour="photo-album"]',
      title: 'Your Photo Album',
      content: 'View all your saved photos and memories in one beautiful place.',
      placement: 'left'
    },
    {
      id: 'find-memory',
      target: '[data-tour="find-memory"]',
      title: 'Ask Questions',
      content: "Can't remember something? Just ask! I'll search through your memories to help you find the answer.",
      placement: 'left'
    },
    {
      id: 'brain-games',
      target: '[data-tour="brain-games"]',
      title: 'Brain Games',
      content: 'Fun memory games to keep your mind sharp. Try matching photos from your memories!',
      placement: 'left'
    },
    {
      id: 'complete',
      target: '[data-tour="elder-greeting"]',
      title: "You're All Set!",
      content: "That's everything! Feel free to explore at your own pace. Tap the help button anytime to see this tour again.",
      placement: 'center'
    }
  ]
};

const CAREGIVER_TOUR: TourConfig = {
  id: 'caregiver-tour',
  name: 'Caregiver Dashboard Tour',
  steps: [
    {
      id: 'welcome',
      target: '[data-tour="caregiver-header"]',
      title: 'Welcome, Caregiver!',
      content: 'This dashboard helps you stay connected with your loved one and monitor their wellbeing.',
      placement: 'bottom'
    },
    {
      id: 'stats',
      target: '[data-tour="caregiver-stats"]',
      title: 'Quick Overview',
      content: "See at a glance how your loved one is doing - memories saved, questions asked, and today's mood.",
      placement: 'bottom'
    },
    {
      id: 'ai-summary',
      target: '[data-tour="ai-summary"]',
      title: 'AI Daily Summary',
      content: "Our AI creates a brief summary of your loved one's day, so you can stay informed even when apart.",
      placement: 'bottom'
    },
    {
      id: 'send-message',
      target: '[data-tour="send-message"]',
      title: 'Send Love Notes',
      content: 'Send heartfelt messages that will be read aloud to your loved one. A simple "I love you" can brighten their day!',
      placement: 'right'
    },
    {
      id: 'quick-actions',
      target: '[data-tour="quick-actions"]',
      title: 'Quick Actions',
      content: 'Start a video call, view their photos, check medications, or manage schedules - all with one tap.',
      placement: 'left'
    },
    {
      id: 'memories',
      target: '[data-tour="recent-memories"]',
      title: 'Recent Memories',
      content: "See the stories and memories your loved one has been sharing. It's a window into their daily life.",
      placement: 'top'
    },
    {
      id: 'complete',
      target: '[data-tour="caregiver-header"]',
      title: 'Ready to Care!',
      content: "You're all set to use the caregiver dashboard. Check back regularly to stay connected!",
      placement: 'center'
    }
  ]
};

const CLINICIAN_TOUR: TourConfig = {
  id: 'clinician-tour',
  name: 'Clinician Portal Tour',
  steps: [
    {
      id: 'welcome',
      target: '[data-tour="clinician-header"]',
      title: 'Welcome, Doctor',
      content: 'This clinical dashboard provides comprehensive insights into patient cognitive health.',
      placement: 'bottom'
    },
    {
      id: 'patient-list',
      target: '[data-tour="patient-list"]',
      title: 'Patient Directory',
      content: 'View and manage all your patients. Quick access to their profiles and risk assessments.',
      placement: 'right'
    },
    {
      id: 'risk-scores',
      target: '[data-tour="risk-scores"]',
      title: 'Risk Assessment',
      content: 'AI-generated risk scores help identify patients who may need immediate attention.',
      placement: 'left'
    },
    {
      id: 'clinical-notes',
      target: '[data-tour="clinical-notes"]',
      title: 'Clinical Notes',
      content: 'Document observations and track patient progress over time.',
      placement: 'bottom'
    },
    {
      id: 'treatment-plans',
      target: '[data-tour="treatment-plans"]',
      title: 'Treatment Plans',
      content: 'Create and manage personalized treatment plans for each patient.',
      placement: 'bottom'
    },
    {
      id: 'complete',
      target: '[data-tour="clinician-header"]',
      title: 'Ready to Practice',
      content: 'The clinical portal is ready for use. All patient data is secure and HIPAA compliant.',
      placement: 'center'
    }
  ]
};

const DEFAULT_TOURS = [ELDER_TOUR, CAREGIVER_TOUR, CLINICIAN_TOUR];

export function TourProvider({ children }: { children: ReactNode }) {
  const [availableTours, setAvailableTours] = useState<TourConfig[]>(DEFAULT_TOURS);
  const [currentTour, setCurrentTour] = useState<TourConfig | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [tourSpeed, setTourSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = tourSpeed === 'slow' ? 0.8 : tourSpeed === 'fast' ? 1.2 : 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female')) 
      || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, tourSpeed]);

  const startTour = useCallback((tourId: string) => {
    const tour = availableTours.find(t => t.id === tourId);
    if (tour) {
      setCurrentTour(tour);
      setCurrentStep(0);
      setIsActive(true);
      setIsPaused(false);
      
      if (voiceEnabled && tour.steps[0]) {
        setTimeout(() => {
          speak(`${tour.steps[0].title}. ${tour.steps[0].content}`);
        }, 500);
      }
    }
  }, [availableTours, voiceEnabled, speak]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentTour(null);
    setCurrentStep(0);
    setIsPaused(false);
    window.speechSynthesis.cancel();
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTour) return;
    
    if (currentStep < currentTour.steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      
      if (voiceEnabled && currentTour.steps[nextIdx]) {
        speak(`${currentTour.steps[nextIdx].title}. ${currentTour.steps[nextIdx].content}`);
      }
    } else {
      endTour();
    }
  }, [currentTour, currentStep, voiceEnabled, speak, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      
      if (voiceEnabled && currentTour?.steps[prevIdx]) {
        speak(`${currentTour.steps[prevIdx].title}. ${currentTour.steps[prevIdx].content}`);
      }
    }
  }, [currentStep, currentTour, voiceEnabled, speak]);

  const goToStep = useCallback((step: number) => {
    if (currentTour && step >= 0 && step < currentTour.steps.length) {
      setCurrentStep(step);
      
      if (voiceEnabled && currentTour.steps[step]) {
        speak(`${currentTour.steps[step].title}. ${currentTour.steps[step].content}`);
      }
    }
  }, [currentTour, voiceEnabled, speak]);

  const pauseTour = useCallback(() => {
    setIsPaused(true);
    window.speechSynthesis.pause();
  }, []);

  const resumeTour = useCallback(() => {
    setIsPaused(false);
    window.speechSynthesis.resume();
  }, []);

  const restartTour = useCallback(() => {
    setCurrentStep(0);
    setIsPaused(false);
    
    if (voiceEnabled && currentTour?.steps[0]) {
      speak(`${currentTour.steps[0].title}. ${currentTour.steps[0].content}`);
    }
  }, [currentTour, voiceEnabled, speak]);

  const registerTour = useCallback((config: TourConfig) => {
    setAvailableTours(prev => {
      const exists = prev.find(t => t.id === config.id);
      if (exists) {
        return prev.map(t => t.id === config.id ? config : t);
      }
      return [...prev, config];
    });
  }, []);

  const getCurrentStepData = useCallback(() => {
    if (!currentTour || !isActive) return null;
    return currentTour.steps[currentStep] || null;
  }, [currentTour, currentStep, isActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <TourContext.Provider value={{
      isActive,
      isPaused,
      currentStep,
      currentTour,
      tourSpeed,
      voiceEnabled,
      startTour,
      endTour,
      nextStep,
      prevStep,
      goToStep,
      pauseTour,
      resumeTour,
      restartTour,
      setTourSpeed,
      setVoiceEnabled,
      registerTour,
      availableTours,
      getCurrentStepData
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (context === undefined) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}

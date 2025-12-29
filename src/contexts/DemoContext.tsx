import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Memory, Question, BehavioralSignal, Profile, Reminder } from '@/types';

export type DemoPortal = 'elder' | 'caregiver' | 'clinician' | null;

interface DemoContextType {
  isGuestMode: boolean;
  isDemoMode: boolean;
  demoPortal: DemoPortal;
  enterGuestMode: (portal?: DemoPortal) => void;
  exitGuestMode: () => void;
  setDemoPortal: (portal: DemoPortal) => void;
  demoMemories: Memory[];
  demoQuestions: Question[];
  demoSignals: BehavioralSignal[];
  demoProfile: Profile | null;
  demoReminders: Reminder[];
  addDemoMemory: (memory: Partial<Memory>) => void;
  addDemoQuestion: (question: string) => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const DEMO_ELDER_ID = 'demo-elder-001';
const DEMO_CAREGIVER_ID = 'demo-caregiver-001';
const DEMO_CLINICIAN_ID = 'demo-clinician-001';

const generateDemoMemories = (): Memory[] => [
  {
    id: 'demo-mem-1',
    elder_id: DEMO_ELDER_ID,
    raw_text: "My granddaughter Sarah visited me last Sunday. We baked chocolate chip cookies together, just like I used to do with my mother. She has the same beautiful smile.",
    type: 'story',
    tags: ['family', 'baking', 'granddaughter', 'tradition'],
    structured_json: { people: ['Sarah', 'mother'], activities: ['baking'], emotions: ['joy', 'nostalgia'] },
    emotional_tone: 'happy',
    confidence_score: 0.95,
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-mem-2',
    elder_id: DEMO_ELDER_ID,
    raw_text: "I remember my wedding day in spring of 1965. Margaret wore a white dress with lace sleeves. The church bells rang so beautifully.",
    type: 'event',
    tags: ['wedding', 'Margaret', '1965', 'spring'],
    structured_json: { year: 1965, season: 'spring', people: ['Margaret'] },
    emotional_tone: 'nostalgic',
    confidence_score: 0.92,
    image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-mem-3',
    elder_id: DEMO_ELDER_ID,
    raw_text: "Dr. Johnson said my blood pressure is improving. I need to take the blue pill in the morning and the white one at night.",
    type: 'medication',
    tags: ['health', 'medication', 'blood pressure'],
    structured_json: { doctor: 'Dr. Johnson', medications: ['blue pill - morning', 'white pill - night'] },
    emotional_tone: 'neutral',
    confidence_score: 0.98,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-mem-4',
    elder_id: DEMO_ELDER_ID,
    raw_text: "My neighbor Tom helped me fix the garden fence today. We used to work together at the steel mill back in the 70s. Good times.",
    type: 'person',
    tags: ['neighbor', 'Tom', 'garden', 'steel mill'],
    structured_json: { people: ['Tom'], places: ['steel mill'], decade: '1970s' },
    emotional_tone: 'happy',
    confidence_score: 0.89,
    image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-mem-5',
    elder_id: DEMO_ELDER_ID,
    raw_text: "Every morning I like to have my coffee on the porch and watch the birds. The cardinals are my favorite - so red and cheerful.",
    type: 'routine',
    tags: ['morning', 'coffee', 'birds', 'cardinals'],
    structured_json: { time: 'morning', activity: 'watching birds', favorite: 'cardinals' },
    emotional_tone: 'peaceful',
    confidence_score: 0.94,
    image_url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'demo-mem-6',
    elder_id: DEMO_ELDER_ID,
    raw_text: "I love apple pie with vanilla ice cream. My mother used to make the best apple pie during Thanksgiving.",
    type: 'preference',
    tags: ['food', 'apple pie', 'ice cream', 'Thanksgiving'],
    structured_json: { preference: 'apple pie with ice cream', memory: 'mother', occasion: 'Thanksgiving' },
    emotional_tone: 'happy',
    confidence_score: 0.91,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date().toISOString()
  }
];

const generateDemoQuestions = (): Question[] => [
  {
    id: 'demo-q-1',
    elder_id: DEMO_ELDER_ID,
    question_text: "What was my wife's favorite flower?",
    answer_text: "Based on your memories, Margaret loved roses, especially the pink ones you gave her on your anniversary.",
    source_memory_ids: ['demo-mem-2'],
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'demo-q-2',
    elder_id: DEMO_ELDER_ID,
    question_text: "When did Sarah last visit?",
    answer_text: "Your granddaughter Sarah visited you last Sunday. You baked chocolate chip cookies together!",
    source_memory_ids: ['demo-mem-1'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    id: 'demo-q-3',
    elder_id: DEMO_ELDER_ID,
    question_text: "What medication do I take at night?",
    answer_text: "According to Dr. Johnson's instructions, you take the white pill at night for your blood pressure.",
    source_memory_ids: ['demo-mem-3'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
  }
];

const generateDemoSignals = (): BehavioralSignal[] => [
  {
    id: 'demo-sig-1',
    elder_id: DEMO_ELDER_ID,
    signal_type: 'confusion',
    description: 'Asked about medication timing 3 times in one hour',
    severity: 'low',
    context: { topic: 'medication', frequency: 3 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
];

const generateDemoReminders = (): Reminder[] => [
  {
    id: 'demo-rem-1',
    elder_id: DEMO_ELDER_ID,
    title: 'Take morning medication',
    due_at: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    status: 'pending',
    is_recurring: true
  },
  {
    id: 'demo-rem-2',
    elder_id: DEMO_ELDER_ID,
    title: 'Video call with Sarah at 3pm',
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    status: 'pending',
    is_recurring: false
  },
  {
    id: 'demo-rem-3',
    elder_id: DEMO_ELDER_ID,
    title: 'Afternoon walk in garden',
    due_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    status: 'pending',
    is_recurring: true
  }
];

const generateDemoProfile = (portal: DemoPortal): Profile | null => {
  if (!portal) return null;
  
  const profiles: Record<string, Profile> = {
    elder: {
      id: 'demo-profile-elder',
      user_id: DEMO_ELDER_ID,
      full_name: 'Robert Anderson',
      role: 'elder',
      avatar_url: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=150',
      created_at: new Date().toISOString()
    },
    caregiver: {
      id: 'demo-profile-caregiver',
      user_id: DEMO_CAREGIVER_ID,
      full_name: 'Emily Anderson',
      role: 'caregiver',
      elder_id: DEMO_ELDER_ID,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      created_at: new Date().toISOString()
    },
    clinician: {
      id: 'demo-profile-clinician',
      user_id: DEMO_CLINICIAN_ID,
      full_name: 'Dr. Sarah Mitchell',
      role: 'clinician',
      avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
      created_at: new Date().toISOString()
    }
  };
  
  return profiles[portal] || null;
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [demoPortal, setDemoPortal] = useState<DemoPortal>(null);
  const [demoMemories, setDemoMemories] = useState<Memory[]>(generateDemoMemories());
  const [demoQuestions, setDemoQuestions] = useState<Question[]>(generateDemoQuestions());
  const [demoSignals] = useState<BehavioralSignal[]>(generateDemoSignals());
  const [demoReminders] = useState<Reminder[]>(generateDemoReminders());

  const enterGuestMode = useCallback((portal: DemoPortal = 'elder') => {
    setIsGuestMode(true);
    setDemoPortal(portal);
    setDemoMemories(generateDemoMemories());
    setDemoQuestions(generateDemoQuestions());
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuestMode(false);
    setDemoPortal(null);
  }, []);

  const addDemoMemory = useCallback((memory: Partial<Memory>) => {
    const newMemory: Memory = {
      id: `demo-mem-${Date.now()}`,
      elder_id: DEMO_ELDER_ID,
      raw_text: memory.raw_text || '',
      type: memory.type || 'story',
      tags: memory.tags || [],
      structured_json: memory.structured_json || {},
      emotional_tone: memory.emotional_tone || 'neutral',
      confidence_score: memory.confidence_score || 0.85,
      image_url: memory.image_url,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setDemoMemories(prev => [newMemory, ...prev]);
  }, []);

  const addDemoQuestion = useCallback((questionText: string) => {
    const newQuestion: Question = {
      id: `demo-q-${Date.now()}`,
      elder_id: DEMO_ELDER_ID,
      question_text: questionText,
      answer_text: "This is a demo response. In the full version, our AI will search through your memories to provide personalized answers.",
      source_memory_ids: [],
      created_at: new Date().toISOString()
    };
    setDemoQuestions(prev => [newQuestion, ...prev]);
  }, []);

  const demoProfile = generateDemoProfile(demoPortal);

  return (
    <DemoContext.Provider value={{
      isGuestMode,
      isDemoMode: isGuestMode,
      demoPortal,
      enterGuestMode,
      exitGuestMode,
      setDemoPortal,
      demoMemories,
      demoQuestions,
      demoSignals,
      demoProfile,
      demoReminders,
      addDemoMemory,
      addDemoQuestion
    }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

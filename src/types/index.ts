export type UserRole = 'elder' | 'caregiver' | 'family' | 'admin' | 'clinician';

export type MemoryType = 'story' | 'person' | 'event' | 'medication' | 'routine' | 'preference' | 'other';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  elder_id: string | null;
  email: string | null;
  preferences: Record<string, unknown>;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  elder_id: string;
  type: MemoryType;
  raw_text: string;
  image_url?: string | null;
  structured_json: Record<string, unknown>;
  tags: string[];
  emotional_tone?: string | null;
  confidence_score?: number | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  elder_id: string;
  question_text: string;
  answer_text: string | null;
  matched_memory_ids: string[];
  created_at: string;
}

export interface DailySummary {
  id: string;
  elder_id: string;
  date: string;
  summary_text: string;
  created_at: string;
}

export interface AnswerResponse {
  answer: string;
  matchedMemories: Memory[];
}

export interface BehavioralSignal {
  id: string;
  elder_id: string;
  signal_type: 'repeated_question' | 'low_activity' | 'late_night_activity' | 'mood_change';
  severity: 'low' | 'medium' | 'high';
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Routine {
  id: string;
  elder_id: string;
  title: string;
  description: string | null;
  time_of_day: string;
  frequency: string[];
  is_active: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  elder_id: string;
  routine_id: string | null;
  title: string;
  due_at: string;
  completed_at: string | null;
  status: 'pending' | 'completed' | 'missed';
  created_at: string;
}

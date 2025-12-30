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
  face_descriptor: number[] | null;
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

export interface Teleconsultation {
  id: string;
  elder_id: string;
  clinician_id: string | null;
  caregiver_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  room_name: string;
  notes: string | null;
  consultation_type: 'routine' | 'follow_up' | 'urgent' | 'assessment';
  created_at: string;
  updated_at: string;
  started_at: string | null;
  ended_at: string | null;
  metadata: Record<string, unknown>;
}

export interface ClinicianProfile {
  id: string;
  user_id: string;
  specialization: string | null;
  license_number: string | null;
  years_experience: number | null;
  bio: string | null;
  consultation_fee: number | null;
  accepts_new_patients: boolean;
  languages: string[];
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface ClinicianAvailability {
  id: string;
  clinician_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface HealthMetric {
  id: string;
  elder_id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes: string | null;
  created_at: string;
}

export interface Alert {
  id: string;
  elder_id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  is_acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  created_at: string;
}

export interface Medication {
  id: string;
  elder_id: string;
  name: string;
  dosage: string;
  frequency: string;
  time_of_day: string[];
  start_date: string;
  end_date: string | null;
  instructions: string | null;
  is_active: boolean;
  created_at: string;
}

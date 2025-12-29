import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  Users, 
  Activity, 
  TrendingUp, 
  ClipboardList, 
  Video, 
  Search,
  ChevronRight,
  Heart,
  Brain,
  AlertCircle,
  Shield,
  FileText,
  Clock,
  Zap,
  Plus,
  Save,
  Pill,
  Calendar,
  MessageSquare,
  CheckCircle,
  XCircle,
  Edit3,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { format, differenceInMinutes } from 'date-fns';
import { assessHealthRisks, predictMoodAndAnalyzeSentiment } from '@/lib/ai';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VideoRoom } from '@/components/teleconsultation';

interface Elder {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

interface ClinicalNote {
  id: string;
  content: string;
  created_at: string;
  note_type: string;
}

interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  status: string;
  start_date: string;
}

import { useDemo } from '@/contexts/DemoContext';

export const ClinicianDashboard = () => {
  const { isDemoMode, demoElders, demoHealthRisks, demoMemories } = useDemo();
  const [elders, setElders] = useState<Elder[]>([]);
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [moodTrend, setMoodTrend] = useState<any>(null);
  const [healthRisks, setHealthRisks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'treatment' | 'telemedicine'>('overview');
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState('general');
  const [savingNote, setSavingNote] = useState(false);
  const [newTreatment, setNewTreatment] = useState({ title: '', description: '' });
  const [savingTreatment, setSavingTreatment] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const [cognitiveAssessments, setCognitiveAssessments] = useState<any[]>([]);
  const [showVideoRoom, setShowVideoRoom] = useState(false);
  const [activeConsultation, setActiveConsultation] = useState<any>(null);
  const [upcomingConsultations, setUpcomingConsultations] = useState<any[]>([]);

    useEffect(() => {
      fetchElders();
      if (!isDemoMode) {
        fetchUpcomingConsultations();
      }
      
      let channel: any;
      if (!isDemoMode) {
        channel = supabase
          .channel('clinician_alerts')
          .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
            toast.error(`ALERT: ${payload.new.message}`, {
              description: "Review patient status.",
              duration: 15000
            });
          })
          .subscribe();
      }

      return () => { 
        if (channel) channel.unsubscribe(); 
      };
    }, [isDemoMode]);

  const fetchUpcomingConsultations = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from('teleconsultations')
        .select('*')
        .eq('clinician_id', userData.user.id)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_at', { ascending: true })
        .limit(10);

      if (data) setUpcomingConsultations(data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    }
  };

  const handleStartConsultation = async (consultation: any) => {
    setActiveConsultation(consultation);
    setShowVideoRoom(true);
  };

  const canJoinCall = (consultation: any) => {
    const scheduledTime = new Date(consultation.scheduled_at);
    const now = new Date();
    const minutesBefore = differenceInMinutes(scheduledTime, now);
    return minutesBefore <= 15 && minutesBefore >= -consultation.duration_minutes;
  };

  useEffect(() => {
    if (selectedElder) {
      fetchElderData(selectedElder.id);
    }
  }, [selectedElder]);

  const fetchElders = async () => {
    if (isDemoMode) {
      setElders(demoElders);
      if (demoElders.length > 0) setSelectedElder(demoElders[0]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('role', 'elder');
    
    if (data) {
      setElders(data);
      if (data.length > 0) setSelectedElder(data[0]);
    }
    setLoading(false);
  };

  const fetchElderData = async (elderId: string) => {
    setLoading(true);
    if (isDemoMode) {
      setHealthRisks(demoHealthRisks);
      setMemories(demoMemories);
      setLoading(false);
      return;
    }

    try {
      const [risks, mood, memoriesRes, assessmentsRes, metricsRes] = await Promise.all([
        assessHealthRisks(elderId),
        predictMoodAndAnalyzeSentiment(elderId),
        supabase.from('memories').select('*').eq('elder_id', elderId).order('created_at', { ascending: false }).limit(20),
        supabase.from('cognitive_assessments').select('*').eq('elder_id', elderId).order('assessment_date', { ascending: false }).limit(10),
        supabase.from('health_metrics').select('*').eq('elder_id', elderId).order('recorded_at', { ascending: true }).limit(30)
      ]);

      setHealthRisks(risks);
      setMoodTrend(mood);
      
      if (memoriesRes.data) setMemories(memoriesRes.data);
      if (assessmentsRes.data) setCognitiveAssessments(assessmentsRes.data);

      if (metricsRes.data) {
        setHealthData(metricsRes.data.map(m => ({
          time: format(new Date(m.recorded_at), 'HH:mm'),
          value: m.value,
          type: m.metric_type
        })));
      }

      const { data: notes } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('elder_id', elderId)
        .eq('activity_type', 'clinical_note')
        .order('created_at', { ascending: false });
      
      if (notes) {
        setClinicalNotes(notes.map(n => ({
          id: n.id,
          content: n.description,
          created_at: n.created_at,
          note_type: n.metadata?.note_type || 'general'
        })));
      }

      const { data: treatments } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('elder_id', elderId)
        .order('created_at', { ascending: false });
      
      if (treatments) setTreatmentPlans(treatments);

    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || !selectedElder) return;
    setSavingNote(true);
    
    try {
      const { error } = await supabase.from('activity_logs').insert({
        elder_id: selectedElder.id,
        activity_type: 'clinical_note',
        description: newNote,
        metadata: { note_type: newNoteType }
      });

      if (error) throw error;
      
      toast.success('Clinical note saved');
      setNewNote('');
      fetchElderData(selectedElder.id);
    } catch (err) {
      console.error('Error saving note:', err);
      toast.error('Could not save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveTreatment = async () => {
    if (!newTreatment.title.trim() || !selectedElder) return;
    setSavingTreatment(true);
    
    try {
      const { error } = await supabase.from('treatment_plans').insert({
        elder_id: selectedElder.id,
        title: newTreatment.title,
        description: newTreatment.description,
        status: 'active',
        start_date: new Date().toISOString()
      });

      if (error) throw error;
      
      toast.success('Treatment plan created');
      setNewTreatment({ title: '', description: '' });
      fetchElderData(selectedElder.id);
    } catch (err) {
      console.error('Error saving treatment:', err);
      toast.error('Could not create treatment plan');
    } finally {
      setSavingTreatment(false);
    }
  };

  const avgCognitiveScore = cognitiveAssessments.length > 0 
    ? Math.round(cognitiveAssessments.reduce((acc, a) => acc + (a.score || 0), 0) / cognitiveAssessments.length)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="font-bold uppercase tracking-wider text-xs">Clinical Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Patient Overview</h1>
          <p className="text-slate-500">Monitor cognitive health and manage treatment plans</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
              <p className="text-sm font-semibold text-slate-900">HIPAA Compliant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4" data-tour="clinician-patients">
            <Card className="rounded-2xl border-0 shadow-lg overflow-hidden bg-white">
              <div className="p-5 bg-slate-900 text-white">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Users className="h-5 w-5" /> Patients
                  </CardTitle>
                  <span className="bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold">
                    {elders.length} ACTIVE
                  </span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search patients..." 
                    className="bg-white/10 border-none text-white placeholder:text-slate-400 rounded-lg pl-10 h-10" 
                  />
                </div>
              </div>
              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                {elders.map((elder) => (
                  <button
                    key={elder.id}
                    onClick={() => setSelectedElder(elder)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-all border-b border-slate-100",
                      selectedElder?.id === elder.id && 'bg-indigo-50 border-l-4 border-l-indigo-600'
                    )}
                  >
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-lg overflow-hidden">
                          {elder.avatar_url ? (
                            <img src={elder.avatar_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            elder.full_name?.[0] || '?'
                          )}
                        </div>
                      <div className="text-left">
                        <p className="font-semibold text-slate-900">{elder.full_name}</p>
                        <p className="text-xs text-slate-400">ID: {elder.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <ChevronRight className={cn("h-5 w-5", selectedElder?.id === elder.id ? 'text-indigo-600' : 'text-slate-200')} />
                  </button>
                ))}
                {elders.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No patients found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-9 space-y-6">
            {selectedElder ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedElder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="md:col-span-2 rounded-2xl border-0 shadow-lg bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 relative overflow-hidden" data-tour="clinician-risks">
                    <Zap className="absolute top-[-20px] right-[-20px] h-32 w-32 text-white/5" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="bg-amber-500 text-slate-900 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                          AI Risk Assessment
                        </span>
                      </div>
                      <div className="flex items-end gap-3 mb-6">
                        <span className="text-6xl font-bold">{healthRisks?.risk_score || '--'}</span>
                        <span className="text-lg text-slate-400 mb-2">/100</span>
                      </div>
                      <div className="space-y-2">
                        {healthRisks?.risks?.slice(0, 3).map((risk: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                            <div className="flex items-center gap-2">
                              <AlertCircle className={cn("h-4 w-4", risk.probability > 0.6 ? 'text-rose-400' : 'text-amber-400')} />
                              <span className="text-sm font-medium capitalize">{risk.type}</span>
                            </div>
                            <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded">{(risk.probability * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                        {(!healthRisks?.risks || healthRisks.risks.length === 0) && (
                          <p className="text-sm text-slate-400 italic">No significant risks detected</p>
                        )}
                      </div>
                    </div>
                  </Card>

                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-5" data-tour="clinician-cognitive">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold uppercase text-slate-400">Cognitive Status</p>
                        <Brain className="h-5 w-5 text-indigo-500" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900 capitalize">{moodTrend?.mood || 'Stable'}</p>
                      <p className="text-sm text-indigo-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {moodTrend?.trend || 'stable'} trend
                      </p>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-2">Assessment Score</p>
                        <p className="text-2xl font-bold text-slate-900">{avgCognitiveScore || '--'}<span className="text-sm text-slate-400">/100</span></p>
                      </div>
                    </Card>

                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-5" data-tour="clinician-activity">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold uppercase text-slate-400">Recent Activity</p>
                        <Activity className="h-5 w-5 text-emerald-500" />
                      </div>
                      <p className="text-3xl font-bold text-slate-900">{memories.length}</p>
                      <p className="text-sm text-slate-500">Memories logged</p>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-2">Last Activity</p>
                        <p className="text-sm font-medium text-slate-700">
                          {memories[0] ? format(new Date(memories[0].created_at), 'MMM d, h:mm a') : 'No activity'}
                        </p>
                      </div>
                    </Card>
                  </div>

                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl w-fit" data-tour="clinician-tabs">
                  {(['overview', 'clinical', 'treatment', 'telemedicine'] as const).map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? 'default' : 'ghost'}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "h-10 px-5 rounded-lg font-semibold text-sm capitalize transition-all",
                        activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-white/50'
                      )}
                    >
                      {tab === 'clinical' ? 'Clinical Notes' : tab === 'treatment' ? 'Treatment Plans' : tab}
                    </Button>
                  ))}
                </div>

                {activeTab === 'overview' && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <Activity className="h-5 w-5 text-indigo-600" /> Vital Trends
                        </h3>
                        <span className="text-xs text-slate-400">Last 24h</span>
                      </div>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <ClipboardList className="h-5 w-5 text-amber-500" /> Recommendations
                      </h3>
                      <div className="space-y-3">
                        {healthRisks?.preventive_measures?.slice(0, 4).map((measure: string, i: number) => (
                          <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl">
                            <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-sm text-slate-700">{measure}</p>
                          </div>
                        ))}
                        {(!healthRisks?.preventive_measures || healthRisks.preventive_measures.length === 0) && (
                          <div className="p-6 text-center text-slate-400">
                            <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                            <p>No specific recommendations at this time</p>
                          </div>
                        )}
                      </div>
                    </Card>

                    <Card className="md:col-span-2 rounded-2xl border-0 shadow-lg bg-white p-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                        <MessageSquare className="h-5 w-5 text-violet-500" /> Recent Memory Entries
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {memories.slice(0, 4).map((memory) => (
                          <div key={memory.id} className="p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                memory.type === 'medication' ? 'bg-rose-100 text-rose-700' :
                                memory.type === 'person' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              )}>
                                {memory.type}
                              </span>
                              <span className="text-xs text-slate-400">{format(new Date(memory.created_at), 'MMM d')}</span>
                            </div>
                            <p className="text-sm text-slate-700 line-clamp-2">{memory.raw_text}</p>
                            {memory.emotional_tone && (
                              <p className="text-xs text-slate-400 mt-2">Mood: <span className="font-medium capitalize">{memory.emotional_tone}</span></p>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'clinical' && (
                  <div className="space-y-6">
                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <Edit3 className="h-5 w-5 text-indigo-600" /> Add Clinical Note
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <select
                            value={newNoteType}
                            onChange={(e) => setNewNoteType(e.target.value)}
                            className="px-4 h-11 rounded-xl border border-slate-200 bg-white text-sm font-medium"
                          >
                            <option value="general">General Note</option>
                            <option value="assessment">Assessment</option>
                            <option value="observation">Observation</option>
                            <option value="follow_up">Follow-up</option>
                            <option value="medication">Medication</option>
                          </select>
                        </div>
                        <Textarea
                          placeholder="Enter clinical observations, assessments, or notes..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="min-h-[120px] rounded-xl border-slate-200"
                        />
                        <Button 
                          onClick={handleSaveNote}
                          disabled={savingNote || !newNote.trim()}
                          className="h-11 px-6 rounded-xl font-semibold"
                        >
                          {savingNote ? 'Saving...' : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Save Note
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>

                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Previous Notes</h3>
                      <div className="space-y-4">
                        {clinicalNotes.map((note) => (
                          <div key={note.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                note.note_type === 'assessment' ? 'bg-indigo-100 text-indigo-700' :
                                note.note_type === 'medication' ? 'bg-rose-100 text-rose-700' :
                                note.note_type === 'observation' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-200 text-slate-700'
                              )}>
                                {note.note_type}
                              </span>
                              <span className="text-xs text-slate-400">{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</span>
                            </div>
                            <p className="text-sm text-slate-700">{note.content}</p>
                          </div>
                        ))}
                        {clinicalNotes.length === 0 && (
                          <div className="p-8 text-center text-slate-400">
                            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>No clinical notes yet</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'treatment' && (
                  <div className="space-y-6">
                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                        <Plus className="h-5 w-5 text-emerald-600" /> Create Treatment Plan
                      </h3>
                      <div className="space-y-4">
                        <Input
                          placeholder="Treatment plan title (e.g., Memory Enhancement Program)"
                          value={newTreatment.title}
                          onChange={(e) => setNewTreatment({ ...newTreatment, title: e.target.value })}
                          className="h-11 rounded-xl border-slate-200"
                        />
                        <Textarea
                          placeholder="Describe the treatment plan, goals, and interventions..."
                          value={newTreatment.description}
                          onChange={(e) => setNewTreatment({ ...newTreatment, description: e.target.value })}
                          className="min-h-[100px] rounded-xl border-slate-200"
                        />
                        <Button 
                          onClick={handleSaveTreatment}
                          disabled={savingTreatment || !newTreatment.title.trim()}
                          className="h-11 px-6 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-700"
                        >
                          {savingTreatment ? 'Creating...' : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Create Plan
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>

                    <Card className="rounded-2xl border-0 shadow-lg bg-white p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Active Treatment Plans</h3>
                      <div className="space-y-4">
                        {treatmentPlans.map((plan) => (
                          <div key={plan.id} className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-semibold text-slate-900">{plan.title}</h4>
                                <p className="text-xs text-slate-400 mt-1">
                                  Started: {format(new Date(plan.start_date), 'MMM d, yyyy')}
                                </p>
                              </div>
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-xs font-bold",
                                plan.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                                plan.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                'bg-slate-200 text-slate-700'
                              )}>
                                {plan.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600">{plan.description}</p>
                          </div>
                        ))}
                        {treatmentPlans.length === 0 && (
                          <div className="p-8 text-center text-slate-400">
                            <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p>No treatment plans created yet</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'telemedicine' && (
                  <div className="space-y-6">
                    <Card className="rounded-2xl border-0 shadow-lg bg-white overflow-hidden">
                      <CardHeader className="bg-gradient-to-br from-indigo-50 to-violet-50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center">
                            <Video className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-xl font-bold">Telemedicine</CardTitle>
                            <CardDescription>Scheduled video consultations</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        {upcomingConsultations.length === 0 ? (
                          <div className="text-center py-12">
                            <Calendar className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-lg font-semibold text-slate-400">No scheduled consultations</p>
                            <p className="text-sm text-slate-400 mt-1">Patients can book consultations through their portal</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {upcomingConsultations.map((consultation) => (
                              <div 
                                key={consultation.id}
                                className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <div className={cn(
                                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                                      consultation.status === 'in_progress' ? "bg-emerald-100" : "bg-indigo-100"
                                    )}>
                                      <Video className={cn(
                                        "h-7 w-7",
                                        consultation.status === 'in_progress' ? "text-emerald-600" : "text-indigo-600"
                                      )} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-slate-900">
                                          {consultation.metadata?.elder_name || 'Patient'}
                                        </h4>
                                        <span className={cn(
                                          "px-2 py-0.5 rounded-full text-xs font-bold",
                                          consultation.status === 'in_progress' 
                                            ? "bg-emerald-100 text-emerald-700"
                                            : canJoinCall(consultation)
                                              ? "bg-amber-100 text-amber-700"
                                              : "bg-blue-100 text-blue-700"
                                        )}>
                                          {consultation.status === 'in_progress' ? 'IN PROGRESS' : 
                                           canJoinCall(consultation) ? 'STARTING SOON' : 'SCHEDULED'}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-4 w-4" />
                                          {format(new Date(consultation.scheduled_at), 'MMM d, yyyy')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          {format(new Date(consultation.scheduled_at), 'h:mm a')}
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-400 mt-1 capitalize">
                                        {consultation.consultation_type?.replace('_', ' ') || 'Routine'} • {consultation.duration_minutes} min
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {canJoinCall(consultation) || consultation.status === 'in_progress' ? (
                                    <Button
                                      onClick={() => handleStartConsultation(consultation)}
                                      className={cn(
                                        "rounded-xl font-semibold",
                                        consultation.status === 'in_progress'
                                          ? "bg-emerald-600 hover:bg-emerald-700"
                                          : "bg-indigo-600 hover:bg-indigo-700"
                                      )}
                                    >
                                      <Phone className="h-4 w-4 mr-2" />
                                      {consultation.status === 'in_progress' ? 'Rejoin' : 'Start Call'}
                                    </Button>
                                  ) : (
                                    <span className="text-sm text-slate-400">
                                      Available 15 min before
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {selectedElder && (
                      <Card className="rounded-2xl border-0 shadow-lg bg-white p-6">
                        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <Users className="h-5 w-5 text-indigo-600" /> Quick Call with {selectedElder.full_name}
                        </h4>
                        <p className="text-sm text-slate-500 mb-4">
                          Start an instant consultation with this patient
                        </p>
                        <Button 
                          onClick={() => {
                            const roomName = `instant-${selectedElder.id.slice(0, 8)}-${Date.now()}`;
                            setActiveConsultation({ 
                              room_name: roomName, 
                              elder_id: selectedElder.id,
                              metadata: { elder_name: selectedElder.full_name }
                            });
                            setShowVideoRoom(true);
                          }}
                          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold"
                        >
                          <Video className="h-5 w-5 mr-2" />
                          Start Instant Consultation
                        </Button>
                      </Card>
                    )}
                  </div>
                )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-[600px] flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <Users className="h-16 w-16 opacity-30 mb-4" />
            <p className="text-xl font-semibold text-slate-400">Select a Patient</p>
            <p className="text-sm text-slate-400 mt-1">Choose from the patient list to view details</p>
          </div>
        )}
      </main>
    </div>

    {showVideoRoom && activeConsultation && (
      <VideoRoom
        roomName={activeConsultation.room_name}
        userName="Dr. Clinician"
        userRole="clinician"
        consultationId={activeConsultation.id}
        onClose={() => {
          setShowVideoRoom(false);
          setActiveConsultation(null);
          fetchUpcomingConsultations();
        }}
      />
    )}
  </div>
);
};

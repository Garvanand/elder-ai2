import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Calendar,
  Clock,
  User,
  Stethoscope,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Phone,
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, isAfter, isBefore, addMinutes, differenceInMinutes } from 'date-fns';

interface Consultation {
  id: string;
  elder_id: string;
  clinician_id: string;
  caregiver_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  room_name: string;
  notes?: string;
  consultation_type: string;
  metadata?: {
    clinician_name?: string;
    elder_name?: string;
  };
}

interface UpcomingConsultationsProps {
  userId: string;
  userRole: 'elder' | 'caregiver' | 'clinician';
  onJoinCall: (consultation: Consultation) => void;
  onScheduleNew?: () => void;
}

export function UpcomingConsultations({
  userId,
  userRole,
  onJoinCall,
  onScheduleNew
}: UpcomingConsultationsProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
    
    const channel = supabase
      .channel('consultations_updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teleconsultations' }, 
        () => fetchConsultations()
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [userId, userRole]);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('teleconsultations')
        .select('*')
        .in('status', ['scheduled', 'in_progress'])
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (userRole === 'elder') {
        query = query.eq('elder_id', userId);
      } else if (userRole === 'caregiver') {
        query = query.eq('caregiver_id', userId);
      } else if (userRole === 'clinician') {
        query = query.eq('clinician_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setConsultations(data || []);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConsultation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('teleconsultations')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Consultation cancelled');
      fetchConsultations();
    } catch (err) {
      console.error('Error cancelling consultation:', err);
      toast.error('Could not cancel consultation');
    }
  };

  const canJoinCall = (consultation: Consultation) => {
    const scheduledTime = new Date(consultation.scheduled_at);
    const now = new Date();
    const minutesBefore = differenceInMinutes(scheduledTime, now);
    return minutesBefore <= 15 && minutesBefore >= -consultation.duration_minutes;
  };

  const getStatusBadge = (consultation: Consultation) => {
    const scheduledTime = new Date(consultation.scheduled_at);
    const now = new Date();
    const minutesBefore = differenceInMinutes(scheduledTime, now);

    if (consultation.status === 'in_progress') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          IN PROGRESS
        </span>
      );
    }

    if (minutesBefore <= 15 && minutesBefore > 0) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          STARTING SOON
        </span>
      );
    }

    return (
      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
        SCHEDULED
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-0 shadow-lg overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-br from-primary/5 to-violet-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Video className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Upcoming Consultations</CardTitle>
              <p className="text-sm text-slate-500">{consultations.length} scheduled</p>
            </div>
          </div>
          {onScheduleNew && (
            <Button onClick={onScheduleNew} className="rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule New
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {consultations.length === 0 ? (
          <div className="p-8 text-center">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No upcoming consultations</p>
            <p className="text-sm text-slate-400 mt-1">Schedule a video call with your healthcare provider</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {consultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center",
                      consultation.status === 'in_progress' ? "bg-emerald-100" : "bg-primary/10"
                    )}>
                      <Stethoscope className={cn(
                        "w-7 h-7",
                        consultation.status === 'in_progress' ? "text-emerald-600" : "text-primary"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900">
                          {userRole === 'clinician' 
                            ? consultation.metadata?.elder_name || 'Patient'
                            : `Dr. ${consultation.metadata?.clinician_name || 'Clinician'}`}
                        </h3>
                        {getStatusBadge(consultation)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(consultation.scheduled_at), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(consultation.scheduled_at), 'h:mm a')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 capitalize">
                        {consultation.consultation_type.replace('_', ' ')} • {consultation.duration_minutes} min
                      </p>
                      {consultation.notes && (
                        <p className="text-sm text-slate-600 mt-2 line-clamp-1">{consultation.notes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canJoinCall(consultation) ? (
                      <Button
                        onClick={() => onJoinCall(consultation)}
                        className={cn(
                          "rounded-xl font-semibold",
                          consultation.status === 'in_progress' 
                            ? "bg-emerald-600 hover:bg-emerald-700" 
                            : "bg-primary hover:bg-primary/90"
                        )}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        {consultation.status === 'in_progress' ? 'Rejoin' : 'Join Call'}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleCancelConsultation(consultation.id)}
                        className="rounded-xl text-rose-600 border-rose-200 hover:bg-rose-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UpcomingConsultations;

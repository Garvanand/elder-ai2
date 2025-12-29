import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Video,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Star,
  Filter,
  Search,
  MapPin,
  Languages,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, isAfter, isBefore } from 'date-fns';

interface Clinician {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  specialization?: string;
  years_experience?: number;
  bio?: string;
  languages?: string[];
  accepts_new_patients?: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
  datetime: Date;
}

interface ConsultationSchedulerProps {
  elderId: string;
  elderName: string;
  caregiverId?: string;
  userRole: 'elder' | 'caregiver' | 'clinician';
  onScheduled?: (consultation: any) => void;
  onClose: () => void;
}

export function ConsultationScheduler({
  elderId,
  elderName,
  caregiverId,
  userRole,
  onScheduled,
  onClose
}: ConsultationSchedulerProps) {
  const [step, setStep] = useState<'clinician' | 'datetime' | 'confirm'>('clinician');
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [selectedClinician, setSelectedClinician] = useState<Clinician | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [consultationType, setConsultationType] = useState<'routine' | 'follow_up' | 'urgent' | 'assessment'>('routine');
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    fetchClinicians();
  }, []);

  useEffect(() => {
    if (selectedClinician && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedClinician, selectedDate]);

  const fetchClinicians = async () => {
    setLoading(true);
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role')
        .eq('role', 'clinician');

      if (profiles) {
        const { data: clinicianProfiles } = await supabase
          .from('clinician_profiles')
          .select('*');

        const enrichedClinicians = profiles.map(p => {
          const profile = clinicianProfiles?.find(cp => cp.user_id === p.id);
          return {
            id: profile?.id || p.id,
            user_id: p.id,
            full_name: p.full_name,
            avatar_url: p.avatar_url,
            specialization: profile?.specialization || 'General Practice',
            years_experience: profile?.years_experience || 5,
            bio: profile?.bio || 'Experienced healthcare professional dedicated to elder care.',
            languages: profile?.languages || ['English'],
            accepts_new_patients: profile?.accepts_new_patients ?? true
          };
        });

        setClinicians(enrichedClinicians);
      }
    } catch (err) {
      console.error('Error fetching clinicians:', err);
      toast.error('Could not load available clinicians');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedClinician) return;

    const dayOfWeek = selectedDate.getDay();
    
    const { data: availability } = await supabase
      .from('clinician_availability')
      .select('*')
      .eq('clinician_id', selectedClinician.user_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', true);

    const { data: existingConsultations } = await supabase
      .from('teleconsultations')
      .select('scheduled_at, duration_minutes')
      .eq('clinician_id', selectedClinician.user_id)
      .gte('scheduled_at', format(selectedDate, 'yyyy-MM-dd'))
      .lt('scheduled_at', format(addDays(selectedDate, 1), 'yyyy-MM-dd'))
      .neq('status', 'cancelled');

    const slots: TimeSlot[] = [];
    const defaultStartHour = 9;
    const defaultEndHour = 17;
    const slotDuration = 30;

    for (let hour = defaultStartHour; hour < defaultEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotTime = setMinutes(setHours(selectedDate, hour), minute);
        
        if (isBefore(slotTime, new Date())) {
          continue;
        }

        const isBooked = existingConsultations?.some(c => {
          const consultTime = new Date(c.scheduled_at);
          return Math.abs(consultTime.getTime() - slotTime.getTime()) < slotDuration * 60 * 1000;
        });

        slots.push({
          time: format(slotTime, 'h:mm a'),
          available: !isBooked,
          datetime: slotTime
        });
      }
    }

    setAvailableSlots(slots);
  };

  const handleScheduleConsultation = async () => {
    if (!selectedClinician || !selectedTime) return;

    setScheduling(true);
    try {
      const selectedSlot = availableSlots.find(s => s.time === selectedTime);
      if (!selectedSlot) throw new Error('Invalid time slot');

      const roomName = `consult-${elderId.slice(0, 8)}-${Date.now()}`;

      const { data, error } = await supabase
        .from('teleconsultations')
        .insert({
          elder_id: elderId,
          clinician_id: selectedClinician.user_id,
          caregiver_id: caregiverId,
          scheduled_at: selectedSlot.datetime.toISOString(),
          duration_minutes: 30,
          status: 'scheduled',
          room_name: roomName,
          notes: notes,
          consultation_type: consultationType,
          metadata: {
            clinician_name: selectedClinician.full_name,
            elder_name: elderName,
            scheduled_by: userRole
          }
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('reminders').insert({
        elder_id: elderId,
        title: `Video consultation with Dr. ${selectedClinician.full_name}`,
        scheduled_time: selectedSlot.datetime.toISOString(),
        is_recurring: false,
        status: 'pending'
      });

      toast.success('Consultation scheduled successfully!');
      onScheduled?.(data);
      onClose();
    } catch (err) {
      console.error('Error scheduling consultation:', err);
      toast.error('Could not schedule consultation');
    } finally {
      setScheduling(false);
    }
  };

  const filteredClinicians = clinicians.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Schedule Consultation</h2>
              <p className="text-slate-500">Book a video call with a healthcare professional</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-b border-slate-100">
          {['clinician', 'datetime', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                step === s ? "bg-primary text-white" :
                  ['clinician', 'datetime', 'confirm'].indexOf(step) > i ? "bg-emerald-500 text-white" :
                    "bg-slate-200 text-slate-500"
              )}>
                {['clinician', 'datetime', 'confirm'].indexOf(step) > i ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn(
                "ml-2 text-sm font-medium capitalize",
                step === s ? "text-slate-900" : "text-slate-500"
              )}>
                {s === 'datetime' ? 'Date & Time' : s}
              </span>
              {i < 2 && <ChevronRight className="w-4 h-4 mx-4 text-slate-300" />}
            </div>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {step === 'clinician' && (
              <motion.div
                key="clinician"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by name or specialization..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 rounded-xl border-slate-200"
                  />
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : filteredClinicians.length === 0 ? (
                  <div className="text-center py-12">
                    <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No clinicians available</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredClinicians.map((clinician) => (
                      <Card
                        key={clinician.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedClinician?.id === clinician.id && "ring-2 ring-primary"
                        )}
                        onClick={() => setSelectedClinician(clinician)}
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
                              {clinician.avatar_url ? (
                                <img src={clinician.avatar_url} className="w-full h-full object-cover" alt="" />
                              ) : (
                                <User className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-lg font-bold text-slate-900">Dr. {clinician.full_name}</h3>
                                {clinician.accepts_new_patients && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                    ACCEPTING PATIENTS
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-primary font-medium mb-2">{clinician.specialization}</p>
                              <p className="text-sm text-slate-500 line-clamp-2 mb-3">{clinician.bio}</p>
                              <div className="flex items-center gap-4 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <Award className="w-3 h-3" />
                                  {clinician.years_experience} years exp.
                                </span>
                                <span className="flex items-center gap-1">
                                  <Languages className="w-3 h-3" />
                                  {clinician.languages?.join(', ')}
                                </span>
                              </div>
                            </div>
                            {selectedClinician?.id === clinician.id && (
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 'datetime' && (
              <motion.div
                key="datetime"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setWeekStart(addDays(weekStart, -7))}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="font-semibold text-slate-900">
                    {format(weekStart, 'MMMM yyyy')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setWeekStart(addDays(weekStart, 7))}
                    className="rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      disabled={isBefore(day, new Date()) && !isSameDay(day, new Date())}
                      className={cn(
                        "p-4 rounded-xl text-center transition-all",
                        isSameDay(day, selectedDate) 
                          ? "bg-primary text-white" 
                          : "bg-slate-50 hover:bg-slate-100",
                        isBefore(day, new Date()) && !isSameDay(day, new Date()) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <p className="text-xs font-medium opacity-70">{format(day, 'EEE')}</p>
                      <p className="text-xl font-bold">{format(day, 'd')}</p>
                    </button>
                  ))}
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Available Times
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.length === 0 ? (
                      <p className="col-span-4 text-center text-slate-500 py-8">
                        No available slots for this date
                      </p>
                    ) : (
                      availableSlots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setSelectedTime(slot.time)}
                          disabled={!slot.available}
                          className={cn(
                            "p-3 rounded-xl text-sm font-medium transition-all",
                            selectedTime === slot.time
                              ? "bg-primary text-white"
                              : slot.available
                                ? "bg-slate-50 hover:bg-slate-100 text-slate-900"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed line-through"
                          )}
                        >
                          {slot.time}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Consultation Type</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'routine', label: 'Routine Check-up' },
                      { value: 'follow_up', label: 'Follow-up' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'assessment', label: 'Assessment' }
                    ].map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setConsultationType(type.value as any)}
                        className={cn(
                          "p-3 rounded-xl text-sm font-medium transition-all",
                          consultationType === type.value
                            ? "bg-primary text-white"
                            : "bg-slate-50 hover:bg-slate-100 text-slate-900"
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-slate-50 border-0">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Stethoscope className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Clinician</p>
                        <p className="text-xl font-bold text-slate-900">Dr. {selectedClinician?.full_name}</p>
                        <p className="text-sm text-primary">{selectedClinician?.specialization}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                      <div>
                        <p className="text-sm text-slate-500">Date</p>
                        <p className="font-semibold text-slate-900">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Time</p>
                        <p className="font-semibold text-slate-900">{selectedTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Patient</p>
                        <p className="font-semibold text-slate-900">{elderName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Type</p>
                        <p className="font-semibold text-slate-900 capitalize">{consultationType.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notes for the clinician (optional)
                  </label>
                  <Textarea
                    placeholder="Describe any symptoms, concerns, or topics you'd like to discuss..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] rounded-xl border-slate-200"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">Reminder</p>
                    <p>A notification will be sent 15 minutes before the consultation. Please ensure you have a stable internet connection and your camera/microphone are working.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 'datetime') setStep('clinician');
              else if (step === 'confirm') setStep('datetime');
              else onClose();
            }}
            className="rounded-xl"
          >
            {step === 'clinician' ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={() => {
              if (step === 'clinician' && selectedClinician) setStep('datetime');
              else if (step === 'datetime' && selectedTime) setStep('confirm');
              else if (step === 'confirm') handleScheduleConsultation();
            }}
            disabled={
              (step === 'clinician' && !selectedClinician) ||
              (step === 'datetime' && !selectedTime) ||
              scheduling
            }
            className="rounded-xl px-8"
          >
            {scheduling ? 'Scheduling...' : step === 'confirm' ? 'Confirm Booking' : 'Continue'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ConsultationScheduler;

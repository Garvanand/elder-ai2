import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import type { Teleconsultation, ClinicianAvailability } from '@/types';

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Teleconsultation[]>([]);
  const [availability, setAvailability] = useState<ClinicianAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));

  useEffect(() => {
    if (user) {
      fetchConsultations();
      fetchAvailability();
    }
  }, [user]);

  const fetchConsultations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('teleconsultations')
      .select('*')
      .eq('clinician_id', user.id)
      .gte('scheduled_at', startOfDay(new Date()).toISOString())
      .order('scheduled_at', { ascending: true });

    if (data) setConsultations(data as Teleconsultation[]);
    setLoading(false);
  };

  const fetchAvailability = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('clinician_availability')
      .select('*')
      .eq('clinician_id', user.id);

    if (data) setAvailability(data as ClinicianAvailability[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchConsultations(), fetchAvailability()]);
    setRefreshing(false);
  };

  const filteredConsultations = consultations.filter((c) =>
    isSameDay(new Date(c.scheduled_at), selectedDate)
  );

  const selectedDayAvailability = availability.filter(
    (a) => a.day_of_week === selectedDate.getDay()
  );

  const handleSetAvailability = () => {
    Alert.alert('Availability', 'Availability management coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.success} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.calendarStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDays.map((day, index) => {
            const hasConsultations = consultations.some((c) =>
              isSameDay(new Date(c.scheduled_at), day)
            );
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  isSameDay(day, selectedDate) && styles.dayButtonActive,
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text
                  style={[
                    styles.dayName,
                    isSameDay(day, selectedDate) && styles.dayNameActive,
                  ]}
                >
                  {format(day, 'EEE')}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    isSameDay(day, selectedDate) && styles.dayNumberActive,
                  ]}
                >
                  {format(day, 'd')}
                </Text>
                {hasConsultations && (
                  <View style={styles.consultationDot} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
        }
      >
        <View style={styles.dateHeader}>
          <Text style={styles.selectedDate}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </Text>
          <TouchableOpacity style={styles.availabilityButton} onPress={handleSetAvailability}>
            <Ionicons name="time" size={20} color={colors.text} />
            <Text style={styles.availabilityButtonText}>Set Hours</Text>
          </TouchableOpacity>
        </View>

        {selectedDayAvailability.length > 0 && (
          <View style={styles.availabilityCard}>
            <Text style={styles.availabilityTitle}>Your Availability</Text>
            {selectedDayAvailability.map((slot) => (
              <View key={slot.id} style={styles.availabilitySlot}>
                <Ionicons
                  name={slot.is_available ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={slot.is_available ? colors.success : colors.error}
                />
                <Text style={styles.availabilityTime}>
                  {slot.start_time} - {slot.end_time}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>
          Consultations ({filteredConsultations.length})
        </Text>

        {filteredConsultations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Consultations</Text>
            <Text style={styles.emptySubtitle}>
              No consultations scheduled for this day
            </Text>
          </View>
        ) : (
          filteredConsultations.map((consultation) => (
            <View key={consultation.id} style={styles.consultationCard}>
              <View style={styles.consultationTime}>
                <Text style={styles.timeText}>
                  {format(new Date(consultation.scheduled_at), 'h:mm')}
                </Text>
                <Text style={styles.ampmText}>
                  {format(new Date(consultation.scheduled_at), 'a')}
                </Text>
              </View>
              <View style={styles.consultationDetails}>
                <Text style={styles.consultationType}>
                  {consultation.consultation_type} Consultation
                </Text>
                <Text style={styles.consultationDuration}>
                  {consultation.duration_minutes} minutes
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      consultation.status === 'completed'
                        ? colors.success
                        : consultation.status === 'in_progress'
                        ? colors.warning
                        : colors.primary,
                  },
                ]}
              >
                <Text style={styles.statusText}>{consultation.status}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  calendarStrip: {
    backgroundColor: colors.backgroundCard,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  dayButtonActive: {
    backgroundColor: colors.success,
  },
  dayName: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  dayNameActive: {
    color: colors.text,
  },
  dayNumber: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  dayNumberActive: {
    color: colors.text,
  },
  consultationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  selectedDate: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  availabilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  availabilityButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  availabilityCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  availabilityTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  availabilitySlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  availabilityTime: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  consultationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  consultationTime: {
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  timeText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  ampmText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  consultationDetails: {
    flex: 1,
  },
  consultationType: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  consultationDuration: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
});

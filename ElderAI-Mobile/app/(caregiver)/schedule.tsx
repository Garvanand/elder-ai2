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
import type { Teleconsultation, Reminder } from '@/types';

export default function ScheduleScreen() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Teleconsultation[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i));

  useEffect(() => {
    if (user) {
      fetchConsultations();
      fetchReminders();
    }
  }, [user]);

  const fetchConsultations = async () => {
    const { data } = await supabase
      .from('teleconsultations')
      .select('*')
      .in('status', ['scheduled', 'in_progress'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    if (data) setConsultations(data as Teleconsultation[]);
    setLoading(false);
  };

  const fetchReminders = async () => {
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .gte('due_at', startOfDay(new Date()).toISOString())
      .order('due_at', { ascending: true });

    if (data) setReminders(data as Reminder[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchConsultations(), fetchReminders()]);
    setRefreshing(false);
  };

  const filteredConsultations = consultations.filter((c) =>
    isSameDay(new Date(c.scheduled_at), selectedDate)
  );

  const filteredReminders = reminders.filter((r) =>
    isSameDay(new Date(r.due_at), selectedDate)
  );

  const handleScheduleConsultation = () => {
    Alert.alert('Schedule', 'Opening consultation scheduler...');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.calendarStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDays.map((day, index) => (
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
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
        }
      >
        <View style={styles.dateHeader}>
          <Text style={styles.selectedDate}>
            {format(selectedDate, 'EEEE, MMMM d')}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleScheduleConsultation}
          >
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {filteredConsultations.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Video Consultations</Text>
            {filteredConsultations.map((consultation) => (
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
                <TouchableOpacity style={styles.joinButton}>
                  <Ionicons name="videocam" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {filteredReminders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Reminders</Text>
            {filteredReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderIcon}>
                  <Ionicons name="alarm" size={20} color={colors.warning} />
                </View>
                <View style={styles.reminderDetails}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderTime}>
                    {format(new Date(reminder.due_at), 'h:mm a')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.completeButton}>
                  <Ionicons name="checkmark" size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {filteredConsultations.length === 0 && filteredReminders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Events</Text>
            <Text style={styles.emptySubtitle}>
              Nothing scheduled for this day
            </Text>
          </View>
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
    backgroundColor: colors.secondary,
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
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  consultationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
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
  joinButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  reminderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  reminderTime: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  completeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.success,
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
});

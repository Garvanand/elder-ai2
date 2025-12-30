import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import { format, isToday } from 'date-fns';
import type { Teleconsultation, Profile } from '@/types';

export default function ClinicianHome() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [todayConsultations, setTodayConsultations] = useState<Teleconsultation[]>([]);
  const [patients, setPatients] = useState<Profile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (user) {
      fetchTodayConsultations();
      fetchPatients();
    }
  }, [user]);

  const fetchTodayConsultations = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from('teleconsultations')
      .select('*')
      .eq('clinician_id', user.id)
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())
      .order('scheduled_at', { ascending: true });

    if (data) setTodayConsultations(data as Teleconsultation[]);
  };

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'elder')
      .limit(10);

    if (data) setPatients(data as Profile[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchTodayConsultations(), fetchPatients()]);
    setRefreshing(false);
  };

  const quickActions = [
    { icon: 'videocam', label: 'Start Call', color: colors.success, onPress: () => router.push('/(clinician)/telemedicine') },
    { icon: 'calendar', label: 'Schedule', color: colors.primary, onPress: () => router.push('/(clinician)/schedule') },
    { icon: 'people', label: 'Patients', color: colors.warning, onPress: () => router.push('/(clinician)/patients') },
    { icon: 'document-text', label: 'Notes', color: colors.secondary, onPress: () => {} },
  ];

  const upcomingConsultation = todayConsultations.find(c => 
    new Date(c.scheduled_at) > new Date() && c.status === 'scheduled'
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{greeting}, Dr.</Text>
            <Text style={styles.name}>{profile?.full_name?.split(' ').pop() || 'Clinician'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.statNumber}>{todayConsultations.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.success }]}>
            <Text style={styles.statNumber}>{patients.length}</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.warning }]}>
            <Text style={styles.statNumber}>
              {todayConsultations.filter(c => c.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {upcomingConsultation && (
          <TouchableOpacity
            style={styles.upcomingCard}
            onPress={() => router.push('/(clinician)/telemedicine')}
          >
            <View style={styles.upcomingIcon}>
              <Ionicons name="videocam" size={28} color={colors.text} />
            </View>
            <View style={styles.upcomingInfo}>
              <Text style={styles.upcomingLabel}>Next Consultation</Text>
              <Text style={styles.upcomingTime}>
                {format(new Date(upcomingConsultation.scheduled_at), 'h:mm a')}
              </Text>
              <Text style={styles.upcomingType}>
                {upcomingConsultation.consultation_type} • {upcomingConsultation.duration_minutes} min
              </Text>
            </View>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon as any} size={28} color={colors.text} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {todayConsultations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No consultations scheduled for today</Text>
          </View>
        ) : (
          todayConsultations.map((consultation) => (
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
              <View style={[
                styles.statusBadge,
                { backgroundColor: consultation.status === 'completed' ? colors.success : colors.primary }
              ]}>
                <Text style={styles.statusText}>
                  {consultation.status === 'completed' ? 'Done' : 'Pending'}
                </Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Recent Patients</Text>
        {patients.slice(0, 5).map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={styles.patientCard}
            onPress={() => router.push('/(clinician)/patients')}
          >
            <View style={styles.patientAvatar}>
              <Text style={styles.patientAvatarText}>
                {patient.full_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.full_name || 'Unknown'}</Text>
              <Text style={styles.patientEmail}>{patient.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  upcomingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  upcomingIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  upcomingTime: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  upcomingType: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'capitalize',
  },
  startButton: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  startButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.success,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    width: '47%',
    aspectRatio: 1.5,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  emptyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
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
    fontSize: fontSize.lg,
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
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  patientAvatarText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  patientEmail: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

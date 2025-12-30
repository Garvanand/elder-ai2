import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import { format } from 'date-fns';
import type { Reminder, Teleconsultation } from '@/types';

export default function ElderHome() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [upcomingConsultation, setUpcomingConsultation] = useState<Teleconsultation | null>(null);
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
      fetchReminders();
      fetchUpcomingConsultation();
    }
  }, [user]);

  const fetchReminders = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('elder_id', user.id)
      .gte('due_at', today.toISOString())
      .lt('due_at', tomorrow.toISOString())
      .order('due_at', { ascending: true });

    if (data) setReminders(data as Reminder[]);
  };

  const fetchUpcomingConsultation = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('teleconsultations')
      .select('*')
      .eq('elder_id', user.id)
      .in('status', ['scheduled', 'in_progress'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single();

    if (data) setUpcomingConsultation(data as Teleconsultation);
  };

  const handleCompleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      fetchReminders();
      Alert.alert('Done!', 'Activity completed.');
    } catch {
      Alert.alert('Error', 'Could not complete activity.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchReminders(), fetchUpcomingConsultation()]);
    setRefreshing(false);
  };

  const quickActions = [
    { icon: 'add-circle', label: 'Add Memory', route: '/(elder)/memories', color: colors.primary },
    { icon: 'chatbubble-ellipses', label: 'Ask Question', route: '/(elder)/ask', color: colors.secondary },
    { icon: 'videocam', label: 'Video Call', route: '/(elder)/video-call', color: colors.success },
    { icon: 'images', label: 'My Memories', route: '/(elder)/memories', color: colors.warning },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{profile?.full_name || 'Friend'}</Text>
          </View>
        </View>

        {upcomingConsultation && (
          <TouchableOpacity
            style={styles.consultationCard}
            onPress={() => router.push('/(elder)/video-call')}
          >
            <View style={styles.consultationIcon}>
              <Ionicons name="videocam" size={32} color={colors.text} />
            </View>
            <View style={styles.consultationInfo}>
              <Text style={styles.consultationTitle}>Upcoming Video Call</Text>
              <Text style={styles.consultationTime}>
                {format(new Date(upcomingConsultation.scheduled_at), 'MMM d, h:mm a')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: action.color }]}
              onPress={() => router.push(action.route as any)}
            >
              <Ionicons name={action.icon as any} size={40} color={colors.text} />
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Today's Activities</Text>
        {reminders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={styles.emptyText}>No activities scheduled for today</Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={styles.reminderInfo}>
                <Text style={styles.reminderTitle}>{reminder.title}</Text>
                <Text style={styles.reminderTime}>
                  {format(new Date(reminder.due_at), 'h:mm a')}
                </Text>
              </View>
              {reminder.status === 'pending' && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteReminder(reminder.id)}
                >
                  <Ionicons name="checkmark" size={24} color={colors.text} />
                </TouchableOpacity>
              )}
              {reminder.status === 'completed' && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                </View>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.panicButton}>
          <Ionicons name="alert-circle" size={32} color={colors.text} />
          <Text style={styles.panicButtonText}>I Need Help</Text>
        </TouchableOpacity>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  consultationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  consultationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  consultationInfo: {
    flex: 1,
  },
  consultationTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  consultationTime: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    width: '47%',
    aspectRatio: 1.2,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reminderTime: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  completeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  panicButtonText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
});

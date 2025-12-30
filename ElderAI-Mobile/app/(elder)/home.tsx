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
import { LinearGradient } from 'expo-linear-gradient';
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
    { icon: 'medical', label: 'My Meds', route: '/(elder)/medications', color: '#ef4444', gradient: ['#ef4444', '#dc2626'] },
    { icon: 'chatbubble-ellipses', label: 'Ask AI', route: '/(elder)/ask', color: '#8b5cf6', gradient: ['#8b5cf6', '#7c3aed'] },
    { icon: 'videocam', label: 'Video Call', route: '/(elder)/video-call', color: '#10b981', gradient: ['#10b981', '#059669'] },
    { icon: 'images', label: 'Memories', route: '/(elder)/memories', color: '#f59e0b', gradient: ['#f59e0b', '#d97706'] },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.greetingCard}>
          <View style={styles.greetingContent}>
            <View style={styles.secureTag}>
              <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
              <Text style={styles.secureTagText}>SECURE ACCOUNT</Text>
            </View>
            <Text style={styles.greetingText}>{greeting},</Text>
            <Text style={styles.userName}>{profile?.full_name?.split(' ')[0] || 'Friend'}</Text>
            <Text style={styles.quote}>"Every memory is a gift to cherish."</Text>
          </View>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {profile?.full_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </LinearGradient>
          </View>
        </View>

        {upcomingConsultation && (
          <TouchableOpacity
            style={styles.consultationCard}
            onPress={() => router.push('/(elder)/video-call')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.consultationGradient}
            >
              <View style={styles.consultationIcon}>
                <Ionicons name="videocam" size={28} color={colors.textLight} />
              </View>
              <View style={styles.consultationInfo}>
                <Text style={styles.consultationTitle}>Upcoming Video Call</Text>
                <Text style={styles.consultationTime}>
                  {format(new Date(upcomingConsultation.scheduled_at), 'MMM d, h:mm a')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.sectionTitle}>Common Tasks</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.gradient as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.actionIconContainer}
              >
                <Ionicons name={action.icon as any} size={32} color={colors.textLight} />
              </LinearGradient>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={styles.actionArrow} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Today's Activities</Text>
        {reminders.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            </View>
            <Text style={styles.emptyText}>You're all caught up!</Text>
            <Text style={styles.emptySubtext}>No activities scheduled for today</Text>
          </View>
        ) : (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderCard}>
              <View style={[
                styles.reminderIcon,
                reminder.status === 'completed' && styles.reminderIconCompleted
              ]}>
                {reminder.status === 'completed' ? (
                  <Ionicons name="checkmark" size={20} color={colors.success} />
                ) : (
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                )}
              </View>
              <View style={styles.reminderInfo}>
                <Text style={[
                  styles.reminderTitle,
                  reminder.status === 'completed' && styles.reminderTitleCompleted
                ]}>
                  {reminder.title}
                </Text>
                <Text style={styles.reminderTime}>
                  Time: {format(new Date(reminder.due_at), 'h:mm a')}
                </Text>
              </View>
              {reminder.status === 'pending' && (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleCompleteReminder(reminder.id)}
                >
                  <Text style={styles.completeButtonText}>DONE</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}

        <TouchableOpacity style={styles.panicButton}>
          <LinearGradient
            colors={['#ef4444', '#dc2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.panicGradient}
          >
            <Ionicons name="alert-circle" size={28} color={colors.textLight} />
            <Text style={styles.panicButtonText}>I Need Help</Text>
          </LinearGradient>
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
  greetingCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 32,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  greetingContent: {
    flex: 1,
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    gap: 4,
  },
  secureTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  greetingText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -1,
  },
  quote: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  avatarContainer: {
    marginLeft: spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textLight,
  },
  consultationCard: {
    borderRadius: 24,
    marginBottom: spacing.xl,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  consultationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  consultationIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
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
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 2,
  },
  consultationTime: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  actionsGrid: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionLabel: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionArrow: {
    opacity: 0.5,
  },
  emptyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reminderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  reminderIconCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  reminderTitleCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  reminderTime: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  completeButtonText: {
    color: colors.textLight,
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  panicButton: {
    borderRadius: 20,
    marginTop: spacing.lg,
    overflow: 'hidden',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  panicGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg + 4,
    gap: spacing.md,
  },
  panicButtonText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

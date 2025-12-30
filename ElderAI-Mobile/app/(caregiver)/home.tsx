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
import type { Profile, Alert as AlertType, Reminder } from '@/types';

export default function CaregiverHome() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [linkedElders, setLinkedElders] = useState<Profile[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [todayReminders, setTodayReminders] = useState<Reminder[]>([]);
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
      fetchLinkedElders();
      fetchAlerts();
      fetchTodayReminders();
    }
  }, [user]);

  const fetchLinkedElders = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'elder');
    if (data) setLinkedElders(data as Profile[]);
  };

  const fetchAlerts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .eq('is_acknowledged', false)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setAlerts(data as AlertType[]);
  };

  const fetchTodayReminders = async () => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await supabase
      .from('reminders')
      .select('*')
      .gte('due_at', today.toISOString())
      .lt('due_at', tomorrow.toISOString())
      .order('due_at', { ascending: true })
      .limit(10);
    if (data) setTodayReminders(data as Reminder[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchLinkedElders(), fetchAlerts(), fetchTodayReminders()]);
    setRefreshing(false);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({ is_acknowledged: true, acknowledged_at: new Date().toISOString(), acknowledged_by: user?.id })
      .eq('id', alertId);
    fetchAlerts();
  };

  const quickActions = [
    { icon: 'videocam', label: 'Video Call', color: colors.success, onPress: () => Alert.alert('Video Call', 'Starting call...') },
    { icon: 'calendar', label: 'Schedule', color: colors.primary, onPress: () => router.push('/(caregiver)/schedule') },
    { icon: 'medical', label: 'Meds Log', color: colors.warning, onPress: () => router.push('/(caregiver)/medications') },
    { icon: 'chatbubble', label: 'Message', color: colors.secondary, onPress: () => Alert.alert('Message', 'Opening messages...') },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.error;
      case 'high': return '#f97316';
      case 'medium': return colors.warning;
      default: return colors.textMuted;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
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
            <Text style={styles.name}>{profile?.full_name || 'Caregiver'}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Text style={styles.statNumber}>{linkedElders.length}</Text>
            <Text style={styles.statLabel}>Elders</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.error }]}>
            <Text style={styles.statNumber}>{alerts.length}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.success }]}>
            <Text style={styles.statNumber}>{todayReminders.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>

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

        {alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Active Alerts</Text>
            {alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertCard}
                onPress={() => handleAcknowledgeAlert(alert.id)}
              >
                <View style={[styles.alertBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                  <Ionicons name="warning" size={20} color={colors.text} />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTime}>
                    {format(new Date(alert.created_at), 'h:mm a')}
                  </Text>
                </View>
                <Ionicons name="checkmark-circle-outline" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </>
        )}

        <Text style={styles.sectionTitle}>My Elders</Text>
        {linkedElders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>No elders linked yet</Text>
          </View>
        ) : (
          linkedElders.map((elder) => (
            <TouchableOpacity
              key={elder.id}
              style={styles.elderCard}
              onPress={() => router.push('/(caregiver)/patients')}
            >
              <View style={styles.elderAvatar}>
                <Text style={styles.elderAvatarText}>
                  {elder.full_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.elderInfo}>
                <Text style={styles.elderName}>{elder.full_name || 'Unknown'}</Text>
                <Text style={styles.elderStatus}>Active</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>
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
    backgroundColor: colors.secondary,
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertInfo: {
    flex: 1,
  },
  alertMessage: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  alertTime: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
  },
  elderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  elderAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  elderInfo: {
    flex: 1,
  },
  elderName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  elderStatus: {
    fontSize: fontSize.sm,
    color: colors.success,
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import { format, formatDistanceToNow } from 'date-fns';
import type { Alert as AlertType } from '@/types';

export default function AlertsScreen() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged'>('all');

  useEffect(() => {
    if (user) fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setAlerts(data as AlertType[]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  };

  const handleAcknowledge = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: user?.id,
      })
      .eq('id', alertId);
    fetchAlerts();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.error;
      case 'high': return '#f97316';
      case 'medium': return colors.warning;
      default: return colors.textMuted;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      default: return 'notifications';
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return !alert.is_acknowledged;
    if (filter === 'acknowledged') return alert.is_acknowledged;
    return true;
  });

  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'acknowledged', label: 'Resolved' },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.filterRow}>
        {filterButtons.map((btn) => (
          <TouchableOpacity
            key={btn.key}
            style={[
              styles.filterButton,
              filter === btn.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(btn.key as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === btn.key && styles.filterButtonTextActive,
              ]}
            >
              {btn.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
        }
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={styles.emptyTitle}>All Clear!</Text>
            <Text style={styles.emptySubtitle}>No alerts to show</Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                alert.is_acknowledged && styles.alertCardAcknowledged,
              ]}
            >
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(alert.severity) },
                ]}
              >
                <Ionicons
                  name={getSeverityIcon(alert.severity) as any}
                  size={24}
                  color={colors.text}
                />
              </View>

              <View style={styles.alertContent}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertType}>{alert.alert_type}</Text>
                  <View
                    style={[
                      styles.severityTag,
                      { backgroundColor: getSeverityColor(alert.severity) + '30' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: getSeverityColor(alert.severity) },
                      ]}
                    >
                      {alert.severity.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.alertMessage}>{alert.message}</Text>

                <Text style={styles.alertTime}>
                  {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                </Text>

                {alert.is_acknowledged ? (
                  <View style={styles.acknowledgedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={styles.acknowledgedText}>
                      Resolved {format(new Date(alert.acknowledged_at!), 'MMM d, h:mm a')}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.acknowledgeButton}
                    onPress={() => handleAcknowledge(alert.id)}
                  >
                    <Ionicons name="checkmark" size={20} color={colors.text} />
                    <Text style={styles.acknowledgeButtonText}>Mark as Resolved</Text>
                  </TouchableOpacity>
                )}
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
  filterRow: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.secondary,
  },
  filterButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
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
  alertCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  alertCardAcknowledged: {
    opacity: 0.7,
  },
  severityBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  alertType: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  severityTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  severityText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
  alertMessage: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  alertTime: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  acknowledgedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  acknowledgedText: {
    fontSize: fontSize.sm,
    color: colors.success,
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  acknowledgeButtonText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
});

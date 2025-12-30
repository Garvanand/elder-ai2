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
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import type { Medication } from '@/types';

export default function ElderMedications() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMedications();
    }
  }, [user]);

  const fetchMedications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('elder_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (data) setMedications(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMedications();
    setRefreshing(false);
  };

  const getTimeColor = (time: string) => {
    switch (time.toLowerCase()) {
      case 'morning': return '#fbbf24';
      case 'afternoon': return '#f59e0b';
      case 'evening': return '#6366f1';
      case 'bedtime': return '#1e1b4b';
      default: return colors.primary;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Medications</Text>
        <Text style={styles.subtitle}>Keep track of your daily medicine</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={80} color={colors.textMuted} />
            <Text style={styles.emptyText}>No active medications listed</Text>
            <Text style={styles.emptySubtext}>Your caregiver will add them here</Text>
          </View>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.medIconContainer}>
                <Ionicons name="medical" size={32} color={colors.text} />
              </View>
              
              <View style={styles.medInfo}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDosage}>{med.dosage}</Text>
                
                <View style={styles.timeContainer}>
                  {med.time_of_day.map((time) => (
                    <View key={time} style={[styles.timeTag, { backgroundColor: getTimeColor(time) }]}>
                      <Text style={styles.timeTagText}>{time}</Text>
                    </View>
                  ))}
                </View>

                {med.instructions && (
                  <View style={styles.instructionBox}>
                    <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.instructions}>{med.instructions}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        <View style={styles.footer}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.textMuted} />
          <Text style={styles.footerText}>
            If you feel unwell after taking medicine, please call your caregiver or doctor immediately.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.xl,
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  medCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  medDosage: {
    fontSize: fontSize.lg,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  timeTagText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '700',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  instructions: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.xl,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
    gap: spacing.sm,
  },
  footerText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

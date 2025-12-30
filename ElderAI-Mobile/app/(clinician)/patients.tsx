import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import type { Profile, Memory, HealthMetric } from '@/types';

interface PatientWithDetails extends Profile {
  memories_count?: number;
  last_consultation?: string;
}

export default function PatientsScreen() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithDetails | null>(null);
  const [patientMemories, setPatientMemories] = useState<Memory[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);

  useEffect(() => {
    if (user) fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'elder');

    if (data) {
      const patientsWithDetails = await Promise.all(
        data.map(async (patient) => {
          const { count } = await supabase
            .from('memories')
            .select('*', { count: 'exact', head: true })
            .eq('elder_id', patient.id);
          return { ...patient, memories_count: count || 0 };
        })
      );
      setPatients(patientsWithDetails as PatientWithDetails[]);
    }
    setLoading(false);
  };

  const fetchPatientDetails = async (patient: PatientWithDetails) => {
    setSelectedPatient(patient);

    const [memoriesRes, metricsRes] = await Promise.all([
      supabase
        .from('memories')
        .select('*')
        .eq('elder_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('health_metrics')
        .select('*')
        .eq('elder_id', patient.id)
        .order('recorded_at', { ascending: false })
        .limit(10),
    ]);

    if (memoriesRes.data) setPatientMemories(memoriesRes.data as Memory[]);
    if (metricsRes.data) setHealthMetrics(metricsRes.data as HealthMetric[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPatients();
    setRefreshing(false);
  };

  const filteredPatients = patients.filter((patient) =>
    patient.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.success} />
      </View>
    );
  }

  if (selectedPatient) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedPatient(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={styles.backButtonText}>Back to Patients</Text>
          </TouchableOpacity>

          <View style={styles.patientProfile}>
            <View style={styles.patientAvatarLarge}>
              <Text style={styles.patientAvatarTextLarge}>
                {selectedPatient.full_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.patientNameLarge}>{selectedPatient.full_name}</Text>
            <Text style={styles.patientEmail}>{selectedPatient.email}</Text>
            <View style={styles.patientStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{selectedPatient.memories_count}</Text>
                <Text style={styles.statLabel}>Memories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{healthMetrics.length}</Text>
                <Text style={styles.statLabel}>Health Records</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.success }]}>
              <Ionicons name="videocam" size={24} color={colors.text} />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.primary }]}>
              <Ionicons name="document-text" size={24} color={colors.text} />
              <Text style={styles.quickActionText}>Notes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickAction, { backgroundColor: colors.warning }]}>
              <Ionicons name="medical" size={24} color={colors.text} />
              <Text style={styles.quickActionText}>Health</Text>
            </TouchableOpacity>
          </View>

          {healthMetrics.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Recent Health Metrics</Text>
              {healthMetrics.slice(0, 5).map((metric) => (
                <View key={metric.id} style={styles.metricCard}>
                  <View style={styles.metricIcon}>
                    <Ionicons name="fitness" size={20} color={colors.success} />
                  </View>
                  <View style={styles.metricInfo}>
                    <Text style={styles.metricType}>{metric.metric_type}</Text>
                    <Text style={styles.metricValue}>
                      {metric.value} {metric.unit}
                    </Text>
                  </View>
                  <Text style={styles.metricDate}>
                    {new Date(metric.recorded_at).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.sectionTitle}>Recent Memories</Text>
          {patientMemories.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No memories recorded</Text>
            </View>
          ) : (
            patientMemories.slice(0, 5).map((memory) => (
              <View key={memory.id} style={styles.memoryCard}>
                <View style={styles.memoryHeader}>
                  <View style={styles.memoryType}>
                    <Ionicons name="book" size={16} color={colors.primary} />
                    <Text style={styles.memoryTypeText}>{memory.type}</Text>
                  </View>
                  <Text style={styles.memoryDate}>
                    {new Date(memory.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.memoryText} numberOfLines={3}>
                  {memory.raw_text}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
        }
      >
        <Text style={styles.sectionTitle}>Patients ({filteredPatients.length})</Text>

        {filteredPatients.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No patients found</Text>
          </View>
        ) : (
          filteredPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientCard}
              onPress={() => fetchPatientDetails(patient)}
            >
              <View style={styles.patientAvatar}>
                <Text style={styles.patientAvatarText}>
                  {patient.full_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.full_name || 'Unknown'}</Text>
                <Text style={styles.patientMeta}>
                  {patient.memories_count} memories recorded
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Ionicons name="videocam" size={20} color={colors.text} />
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    margin: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontSize: fontSize.md,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  patientAvatarText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  patientMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  backButtonText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  patientProfile: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  patientAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  patientAvatarTextLarge: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  patientNameLarge: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  patientEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  patientStats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAction: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  metricInfo: {
    flex: 1,
  },
  metricType: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    textTransform: 'capitalize',
  },
  metricValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  metricDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  memoryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  memoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  memoryType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memoryTypeText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    textTransform: 'capitalize',
  },
  memoryDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  memoryText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
});

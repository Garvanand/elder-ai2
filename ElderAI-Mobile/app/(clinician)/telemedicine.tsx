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
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import { format, differenceInMinutes } from 'date-fns';
import type { Teleconsultation } from '@/types';

const { width, height } = Dimensions.get('window');

export default function TelemedicineScreen() {
  const { user, profile } = useAuth();
  const [consultations, setConsultations] = useState<Teleconsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCall, setActiveCall] = useState<Teleconsultation | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    if (user) fetchConsultations();
  }, [user]);

  const fetchConsultations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('teleconsultations')
      .select('*')
      .eq('clinician_id', user.id)
      .order('scheduled_at', { ascending: true });

    if (data) setConsultations(data as Teleconsultation[]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConsultations();
    setRefreshing(false);
  };

  const canJoinCall = (consultation: Teleconsultation) => {
    const scheduledTime = new Date(consultation.scheduled_at);
    const minutesBefore = differenceInMinutes(scheduledTime, new Date());
    return minutesBefore <= 15 && consultation.status !== 'completed';
  };

  const handleStartCall = async (consultation: Teleconsultation) => {
    await supabase
      .from('teleconsultations')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', consultation.id);

    setActiveCall(consultation);
    setShowVideo(true);
  };

  const handleEndCall = async () => {
    if (activeCall) {
      await supabase
        .from('teleconsultations')
        .update({ status: 'completed', ended_at: new Date().toISOString() })
        .eq('id', activeCall.id);
    }
    setShowVideo(false);
    setActiveCall(null);
    fetchConsultations();
  };

  const handleInstantCall = () => {
    Alert.prompt(
      'Start Instant Call',
      'Enter a room name for the call:',
      async (roomName) => {
        if (roomName) {
          const tempConsultation: Teleconsultation = {
            id: 'instant-' + Date.now(),
            elder_id: '',
            clinician_id: user?.id || '',
            caregiver_id: null,
            scheduled_at: new Date().toISOString(),
            duration_minutes: 30,
            status: 'in_progress',
            room_name: roomName.replace(/\s+/g, '-'),
            notes: null,
            consultation_type: 'routine',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            started_at: new Date().toISOString(),
            ended_at: null,
            metadata: {},
          };
          setActiveCall(tempConsultation);
          setShowVideo(true);
        }
      },
      'plain-text',
      `dr-${profile?.full_name?.split(' ').pop()?.toLowerCase() || 'clinician'}-${Date.now()}`
    );
  };

  const filteredConsultations = consultations.filter((c) => {
    if (filter === 'upcoming') return c.status !== 'completed';
    return c.status === 'completed';
  });

  const jitsiUrl = activeCall
    ? `https://meet.jit.si/${activeCall.room_name}#userInfo.displayName="${encodeURIComponent(
        'Dr. ' + (profile?.full_name?.split(' ').pop() || 'Clinician')
      )}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`
    : '';

  if (showVideo && activeCall) {
    return (
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: jitsiUrl }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
        />
        <View style={styles.videoControls}>
          <View style={styles.callInfo}>
            <Text style={styles.callInfoText}>
              {activeCall.consultation_type} Consultation
            </Text>
          </View>
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={28} color={colors.text} />
            <Text style={styles.endCallText}>End Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.success} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.instantCallButton} onPress={handleInstantCall}>
          <Ionicons name="videocam" size={24} color={colors.text} />
          <Text style={styles.instantCallText}>Start Instant Call</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setFilter('upcoming')}
        >
          <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.filterTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.success} />
        }
      >
        {filteredConsultations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {filter === 'upcoming' ? 'No Upcoming Consultations' : 'No Completed Consultations'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'upcoming'
                ? 'Schedule a consultation or start an instant call'
                : 'Completed consultations will appear here'}
            </Text>
          </View>
        ) : (
          filteredConsultations.map((consultation) => {
            const canJoin = canJoinCall(consultation);
            return (
              <View key={consultation.id} style={styles.consultationCard}>
                <View style={styles.consultationHeader}>
                  <View style={styles.dateTimeInfo}>
                    <Text style={styles.dateText}>
                      {format(new Date(consultation.scheduled_at), 'EEE, MMM d')}
                    </Text>
                    <Text style={styles.timeText}>
                      {format(new Date(consultation.scheduled_at), 'h:mm a')}
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

                <View style={styles.consultationDetails}>
                  <Text style={styles.consultationType}>
                    {consultation.consultation_type} Consultation
                  </Text>
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.durationText}>
                      {consultation.duration_minutes} minutes
                    </Text>
                  </View>
                </View>

                {consultation.status !== 'completed' && (
                  <TouchableOpacity
                    style={[styles.joinButton, !canJoin && styles.joinButtonDisabled]}
                    onPress={() => handleStartCall(consultation)}
                    disabled={!canJoin}
                  >
                    <Ionicons name="videocam" size={20} color={colors.text} />
                    <Text style={styles.joinButtonText}>
                      {canJoin ? 'Start Consultation' : 'Not Yet Available'}
                    </Text>
                  </TouchableOpacity>
                )}

                {consultation.status === 'completed' && consultation.notes && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{consultation.notes}</Text>
                  </View>
                )}
              </View>
            );
          })
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
  headerActions: {
    padding: spacing.md,
  },
  instantCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  instantCallText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    backgroundColor: colors.success,
  },
  filterText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
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
    textAlign: 'center',
  },
  consultationCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  timeText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
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
  consultationDetails: {
    marginBottom: spacing.md,
  },
  consultationType: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
    marginBottom: spacing.xs,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  durationText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  joinButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.7,
  },
  joinButtonText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  notesSection: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
  },
  notesLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webview: {
    flex: 1,
    width,
    height: height - 100,
  },
  videoControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callInfo: {
    flex: 1,
  },
  callInfoText: {
    fontSize: fontSize.md,
    color: colors.text,
    textTransform: 'capitalize',
  },
  endCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  endCallText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
});

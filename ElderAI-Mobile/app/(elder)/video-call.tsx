import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

export default function VideoCallScreen() {
  const { user, profile } = useAuth();
  const [consultations, setConsultations] = useState<Teleconsultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCall, setActiveCall] = useState<Teleconsultation | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (user) fetchConsultations();
  }, [user]);

  const fetchConsultations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('teleconsultations')
      .select('*')
      .eq('elder_id', user.id)
      .in('status', ['scheduled', 'in_progress'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    if (data) setConsultations(data as Teleconsultation[]);
    setLoading(false);
  };

  const canJoinCall = (consultation: Teleconsultation) => {
    const scheduledTime = new Date(consultation.scheduled_at);
    const minutesBefore = differenceInMinutes(scheduledTime, new Date());
    return minutesBefore <= 15;
  };

  const handleJoinCall = async (consultation: Teleconsultation) => {
    if (!canJoinCall(consultation)) {
      Alert.alert('Too Early', 'You can join the call 15 minutes before the scheduled time.');
      return;
    }

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

  const jitsiUrl = activeCall
    ? `https://meet.jit.si/${activeCall.room_name}#userInfo.displayName="${encodeURIComponent(
        profile?.full_name || 'Elder'
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
          <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
            <Ionicons name="call" size={32} color={colors.text} />
            <Text style={styles.endCallText}>End Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="videocam" size={48} color={colors.primary} />
          <Text style={styles.title}>Video Calls</Text>
          <Text style={styles.subtitle}>Connect with your doctor or caregiver</Text>
        </View>

        <TouchableOpacity style={styles.quickCallButton}>
          <Ionicons name="call" size={32} color={colors.text} />
          <View style={styles.quickCallInfo}>
            <Text style={styles.quickCallTitle}>Start Quick Call</Text>
            <Text style={styles.quickCallSubtitle}>Call your caregiver now</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Scheduled Calls</Text>

        {consultations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No scheduled video calls</Text>
            <Text style={styles.emptySubtext}>
              Your caregiver or doctor can schedule a call for you
            </Text>
          </View>
        ) : (
          consultations.map((consultation) => {
            const canJoin = canJoinCall(consultation);
            return (
              <View key={consultation.id} style={styles.consultationCard}>
                <View style={styles.consultationHeader}>
                  <View style={styles.consultationIcon}>
                    <Ionicons name="videocam" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.consultationInfo}>
                    <Text style={styles.consultationType}>
                      {consultation.consultation_type.charAt(0).toUpperCase() +
                        consultation.consultation_type.slice(1)}{' '}
                      Consultation
                    </Text>
                    <Text style={styles.consultationTime}>
                      {format(new Date(consultation.scheduled_at), 'EEEE, MMM d')}
                    </Text>
                    <Text style={styles.consultationTimeHighlight}>
                      {format(new Date(consultation.scheduled_at), 'h:mm a')}
                    </Text>
                  </View>
                </View>

                <View style={styles.consultationDuration}>
                  <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                  <Text style={styles.durationText}>
                    {consultation.duration_minutes} minutes
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.joinButton,
                    !canJoin && styles.joinButtonDisabled,
                  ]}
                  onPress={() => handleJoinCall(consultation)}
                  disabled={!canJoin}
                >
                  <Ionicons name="videocam" size={24} color={colors.text} />
                  <Text style={styles.joinButtonText}>
                    {canJoin ? 'Join Call' : 'Not Yet Available'}
                  </Text>
                </TouchableOpacity>

                {!canJoin && (
                  <Text style={styles.joinHint}>
                    You can join 15 minutes before the scheduled time
                  </Text>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  quickCallInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  quickCallTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  quickCallSubtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
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
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  consultationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  consultationInfo: {
    flex: 1,
  },
  consultationType: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  consultationTime: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  consultationTimeHighlight: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  consultationDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  durationText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  joinButtonDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.7,
  },
  joinButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  joinHint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
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
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
});

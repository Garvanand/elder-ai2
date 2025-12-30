import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import type { Profile, Memory, Reminder } from '@/types';

interface ElderWithDetails extends Profile {
  memories_count?: number;
  recent_activity?: string;
}

export default function PatientsScreen() {
  const { user } = useAuth();
  const [elders, setElders] = useState<ElderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElder, setSelectedElder] = useState<ElderWithDetails | null>(null);
  const [elderMemories, setElderMemories] = useState<Memory[]>([]);
  const [elderReminders, setElderReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    if (user) fetchElders();
  }, [user]);

  const fetchElders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'elder');

    if (data) {
      const eldersWithDetails = await Promise.all(
        data.map(async (elder) => {
          const { count } = await supabase
            .from('memories')
            .select('*', { count: 'exact', head: true })
            .eq('elder_id', elder.id);
          return { ...elder, memories_count: count || 0 };
        })
      );
      setElders(eldersWithDetails as ElderWithDetails[]);
    }
    setLoading(false);
  };

  const fetchElderDetails = async (elder: ElderWithDetails) => {
    setSelectedElder(elder);

    const [memoriesRes, remindersRes] = await Promise.all([
      supabase
        .from('memories')
        .select('*')
        .eq('elder_id', elder.id)
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('reminders')
        .select('*')
        .eq('elder_id', elder.id)
        .eq('status', 'pending')
        .order('due_at', { ascending: true })
        .limit(5),
    ]);

    if (memoriesRes.data) setElderMemories(memoriesRes.data as Memory[]);
    if (remindersRes.data) setElderReminders(remindersRes.data as Reminder[]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchElders();
    setRefreshing(false);
  };

  const handleAddReminder = () => {
    if (!selectedElder) return;
    Alert.prompt(
      'Add Reminder',
      'Enter reminder title:',
      async (title) => {
        if (title) {
          await supabase.from('reminders').insert({
            elder_id: selectedElder.id,
            title,
            due_at: new Date(Date.now() + 3600000).toISOString(),
            status: 'pending',
          });
          fetchElderDetails(selectedElder);
          Alert.alert('Success', 'Reminder added!');
        }
      }
    );
  };

  const handleStartVideoCall = (elder: ElderWithDetails) => {
    Alert.alert('Video Call', `Starting video call with ${elder.full_name}...`);
  };

  const filteredElders = elders.filter((elder) =>
    elder.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (selectedElder) {
    return (
      <SafeAreaView style={styles.container} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedElder(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={styles.backButtonText}>Back to Elders</Text>
          </TouchableOpacity>

          <View style={styles.elderProfile}>
            <View style={styles.elderAvatarLarge}>
              <Text style={styles.elderAvatarTextLarge}>
                {selectedElder.full_name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.elderNameLarge}>{selectedElder.full_name}</Text>
            <Text style={styles.elderEmail}>{selectedElder.email}</Text>
          </View>

          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.success }]}
              onPress={() => handleStartVideoCall(selectedElder)}
            >
              <Ionicons name="videocam" size={24} color={colors.text} />
              <Text style={styles.quickActionText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.primary }]}
              onPress={handleAddReminder}
            >
              <Ionicons name="alarm" size={24} color={colors.text} />
              <Text style={styles.quickActionText}>Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: colors.warning }]}
            >
              <Ionicons name="medical" size={24} color={colors.text} />
              <Text style={styles.quickActionText}>Health</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Pending Reminders</Text>
          {elderReminders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No pending reminders</Text>
            </View>
          ) : (
            elderReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <Ionicons name="alarm-outline" size={20} color={colors.warning} />
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderTime}>
                    {new Date(reminder.due_at).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Recent Memories</Text>
          {elderMemories.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No memories recorded</Text>
            </View>
          ) : (
            elderMemories.map((memory) => (
              <View key={memory.id} style={styles.memoryCard}>
                <Text style={styles.memoryText} numberOfLines={2}>
                  {memory.raw_text}
                </Text>
                <Text style={styles.memoryDate}>
                  {new Date(memory.created_at).toLocaleDateString()}
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />
        }
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search elders..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <Text style={styles.sectionTitle}>My Elders ({filteredElders.length})</Text>

        {filteredElders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="people-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No elders found</Text>
          </View>
        ) : (
          filteredElders.map((elder) => (
            <TouchableOpacity
              key={elder.id}
              style={styles.elderCard}
              onPress={() => fetchElderDetails(elder)}
            >
              <View style={styles.elderAvatar}>
                <Text style={styles.elderAvatarText}>
                  {elder.full_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.elderInfo}>
                <Text style={styles.elderName}>{elder.full_name || 'Unknown'}</Text>
                <Text style={styles.elderStats}>
                  {elder.memories_count} memories
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleStartVideoCall(elder)}
              >
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
  elderStats: {
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
  elderProfile: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  elderAvatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  elderAvatarTextLarge: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.text,
  },
  elderNameLarge: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  elderEmail: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  reminderTime: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  memoryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  memoryText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  memoryDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

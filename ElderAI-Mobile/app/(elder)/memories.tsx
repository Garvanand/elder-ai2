import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { extractMemoryIntelligence } from '@/lib/ai';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import { format } from 'date-fns';
import type { Memory } from '@/types';

export default function MemoriesScreen() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [memoryText, setMemoryText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) fetchMemories();
  }, [user]);

  const fetchMemories = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('elder_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setMemories(data as Memory[]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMemories();
    setRefreshing(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleAddMemory = async () => {
    if (!memoryText.trim() || !user) return;

    setSubmitting(true);
    try {
      let imageUrl = null;

      if (selectedImage) {
        const fileName = `${user.id}/${Date.now()}.jpg`;
        const response = await fetch(selectedImage);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('memory-images')
          .upload(fileName, blob);

        if (!uploadError) {
          const { data } = supabase.storage.from('memory-images').getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }
      }

      const intel = await extractMemoryIntelligence(memoryText);

      const { error } = await supabase.from('memories').insert({
        elder_id: user.id,
        raw_text: memoryText,
        image_url: imageUrl,
        type: intel.type as any,
        structured_json: intel.structured,
        tags: intel.tags,
        emotional_tone: intel.emotional_tone,
      });

      if (error) throw error;

      setMemoryText('');
      setSelectedImage(null);
      setShowAddForm(false);
      fetchMemories();
      Alert.alert('Success', 'Memory saved!');
    } catch (error) {
      Alert.alert('Error', 'Could not save memory.');
    } finally {
      setSubmitting(false);
    }
  };

  const getMemoryIcon = (type: string) => {
    switch (type) {
      case 'person': return 'person';
      case 'event': return 'calendar';
      case 'medication': return 'medical';
      case 'routine': return 'time';
      default: return 'book';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <LinearGradient
            colors={showAddForm ? ['#6b7280', '#4b5563'] : [colors.primary, colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addButtonGradient}
          >
            <Ionicons name={showAddForm ? 'close' : 'add'} size={24} color={colors.textLight} />
            <Text style={styles.addButtonText}>
              {showAddForm ? 'Cancel' : 'Add New Memory'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formLabel}>What would you like to remember?</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Share a memory, a story, or something important..."
              placeholderTextColor={colors.textMuted}
              value={memoryText}
              onChangeText={setMemoryText}
              multiline
              numberOfLines={4}
            />

            {selectedImage && (
              <View style={styles.imagePreview}>
                <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImage}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={28} color={colors.error} />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image" size={20} color={colors.primary} />
                <Text style={styles.imageButtonText}>Add Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, (!memoryText.trim() || submitting) && styles.saveButtonDisabled]}
                onPress={handleAddMemory}
                disabled={!memoryText.trim() || submitting}
              >
                <LinearGradient
                  colors={[colors.success, '#059669']}
                  style={styles.saveButtonGradient}
                >
                  {submitting ? (
                    <ActivityIndicator color={colors.textLight} size="small" />
                  ) : (
                    <>
                      <Text style={styles.saveButtonText}>Save</Text>
                      <Ionicons name="checkmark" size={18} color={colors.textLight} />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Your Memories</Text>

        {memories.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="images-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyText}>No memories yet</Text>
            <Text style={styles.emptySubtext}>Start adding your precious memories</Text>
          </View>
        ) : (
          memories.map((memory) => (
            <View key={memory.id} style={styles.memoryCard}>
              {memory.image_url && (
                <Image source={{ uri: memory.image_url }} style={styles.memoryImage} />
              )}
              <View style={styles.memoryContent}>
                <View style={styles.memoryHeader}>
                  <View style={styles.memoryType}>
                    <View style={styles.typeIconContainer}>
                      <Ionicons name={getMemoryIcon(memory.type) as any} size={14} color={colors.primary} />
                    </View>
                    <Text style={styles.memoryTypeText}>{memory.type}</Text>
                  </View>
                  <Text style={styles.memoryDate}>
                    {format(new Date(memory.created_at), 'MMM d, yyyy')}
                  </Text>
                </View>
                <Text style={styles.memoryText}>{memory.raw_text}</Text>
                {memory.tags && memory.tags.length > 0 && (
                  <View style={styles.tags}>
                    {memory.tags.map((tag, i) => (
                      <View key={i} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  addButton: {
    borderRadius: 20,
    marginBottom: spacing.lg,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  addButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textLight,
  },
  addForm: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formLabel: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    color: colors.text,
    fontSize: fontSize.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  imagePreview: {
    marginTop: spacing.md,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  removeImage: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  imageButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.textLight,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.backgroundCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  memoryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memoryImage: {
    width: '100%',
    height: 180,
  },
  memoryContent: {
    padding: spacing.lg,
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
  typeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  memoryTypeText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
  memoryDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  memoryText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '600',
  },
});

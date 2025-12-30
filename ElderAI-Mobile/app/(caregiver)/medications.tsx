import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import type { Medication, Profile } from '@/types';
import { format } from 'date-fns';

export default function MedicationsScreen() {
  const { user } = useAuth();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [elders, setElders] = useState<Profile[]>([]);
  const [selectedElderId, setSelectedElderId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [instructions, setInstructions] = useState('');
  const [timeOfDay, setTimeOfDay] = useState<string[]>([]);

  useEffect(() => {
    fetchElders();
  }, []);

  useEffect(() => {
    if (selectedElderId) {
      fetchMedications();
    }
  }, [selectedElderId]);

  const fetchElders = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'elder');
    if (data && data.length > 0) {
      setElders(data);
      setSelectedElderId(data[0].id);
    }
    setIsLoading(false);
  };

  const fetchMedications = async () => {
    if (!selectedElderId) return;
    const { data } = await supabase
      .from('medications')
      .select('*')
      .eq('elder_id', selectedElderId)
      .order('created_at', { ascending: false });
    if (data) setMedications(data);
  };

  const handleAddMedication = async () => {
    if (!name || !dosage || !selectedElderId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const { error } = await supabase.from('medications').insert({
      elder_id: selectedElderId,
      name,
      dosage,
      frequency,
      instructions,
      time_of_day: timeOfDay,
      is_active: true,
      start_date: new Date().toISOString(),
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setIsModalVisible(false);
      resetForm();
      fetchMedications();
      Alert.alert('Success', 'Medication added successfully');
    }
  };

  const toggleMedicationStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('medications')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      fetchMedications();
    }
  };

  const resetForm = () => {
    setName('');
    setDosage('');
    setFrequency('');
    setInstructions('');
    setTimeOfDay([]);
  };

  const times = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Medication Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsModalVisible(true)}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.selectorContainer}>
        <Text style={styles.label}>Select Elder:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.elderList}>
          {elders.map((elder) => (
            <TouchableOpacity
              key={elder.id}
              style={[
                styles.elderTag,
                selectedElderId === elder.id && styles.elderTagSelected,
              ]}
              onPress={() => setSelectedElderId(elder.id)}
            >
              <Text style={[
                styles.elderTagName,
                selectedElderId === elder.id && styles.elderTagNameSelected
              ]}>
                {elder.full_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {medications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="medical-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No medications recorded</Text>
          </View>
        ) : (
          medications.map((med) => (
            <View key={med.id} style={styles.medCard}>
              <View style={styles.medHeader}>
                <View>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medDosage}>{med.dosage}</Text>
                </View>
                <Switch
                  value={med.is_active}
                  onValueChange={() => toggleMedicationStatus(med.id, med.is_active)}
                  trackColor={{ false: colors.border, true: colors.success }}
                />
              </View>
              
              <View style={styles.medDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="repeat" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{med.frequency}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={styles.detailText}>{med.time_of_day.join(', ')}</Text>
                </View>
              </View>

              {med.instructions && (
                <Text style={styles.instructions}>{med.instructions}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medication</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={styles.inputLabel}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Lisinopril"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>Dosage *</Text>
              <TextInput
                style={styles.input}
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g. 10mg"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>Frequency</Text>
              <TextInput
                style={styles.input}
                value={frequency}
                onChangeText={setFrequency}
                placeholder="e.g. Once daily"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={styles.inputLabel}>Time of Day</Text>
              <View style={styles.timeGrid}>
                {times.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeOption,
                      timeOfDay.includes(time) && styles.timeOptionSelected
                    ]}
                    onPress={() => {
                      if (timeOfDay.includes(time)) {
                        setTimeOfDay(timeOfDay.filter(t => t !== time));
                      } else {
                        setTimeOfDay([...timeOfDay, time]);
                      }
                    }}
                  >
                    <Text style={[
                      styles.timeText,
                      timeOfDay.includes(time) && styles.timeTextSelected
                    ]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={instructions}
                onChangeText={setInstructions}
                placeholder="e.g. Take with food"
                placeholderTextColor={colors.textMuted}
                multiline
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleAddMedication}>
                <Text style={styles.saveButtonText}>Save Medication</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorContainer: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  elderList: {
    flexDirection: 'row',
  },
  elderTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elderTagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  elderTagName: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  elderTagNameSelected: {
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  medCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  medName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  medDosage: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  medDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  instructions: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.backgroundCard,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  inputLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  timeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeText: {
    color: colors.textSecondary,
  },
  timeTextSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
});

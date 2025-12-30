import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAuth } from '@/contexts/AuthContext';
import { answerQuestion } from '@/lib/ai';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import type { Memory } from '@/types';

export default function AskScreen() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchedMemories, setMatchedMemories] = useState<Memory[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const suggestedQuestions = [
    "What did I do yesterday?",
    "Who is my doctor?",
    "When is my next appointment?",
    "What medications do I take?",
    "Tell me about my family",
    "What are my daily routines?",
  ];

  const handleAsk = async (questionText?: string) => {
    const q = questionText || question;
    if (!q.trim() || !user) return;

    setLoading(true);
    setAnswer('');
    setMatchedMemories([]);

    try {
      const response = await answerQuestion(q, user.id);
      setAnswer(response.answer);
      setMatchedMemories(response.matchedMemories);
      setQuestion('');
    } catch (error) {
      Alert.alert('Error', 'Could not process your question.');
    } finally {
      setLoading(false);
    }
  };

  const speakAnswer = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(answer, {
        language: 'en',
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.iconContainer}
          >
            <Ionicons name="chatbubble-ellipses" size={32} color={colors.textLight} />
          </LinearGradient>
          <Text style={styles.title}>Ask Me Anything</Text>
          <Text style={styles.subtitle}>
            I'll search through your memories to help you remember
          </Text>
        </View>

        <View style={styles.inputCard}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your question here..."
              placeholderTextColor={colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              multiline
            />
          </View>
          <TouchableOpacity
            style={[styles.askButton, (!question.trim() || loading) && styles.askButtonDisabled]}
            onPress={() => handleAsk()}
            disabled={!question.trim() || loading}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.askButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Ionicons name="send" size={24} color={colors.textLight} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Suggested Questions</Text>
        <View style={styles.suggestedGrid}>
          {suggestedQuestions.map((q, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestedButton}
              onPress={() => {
                setQuestion(q);
                handleAsk(q);
              }}
            >
              <Text style={styles.suggestedText}>{q}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {answer && (
          <View style={styles.answerCard}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.05)']}
              style={styles.answerGradient}
            >
              <View style={styles.answerHeader}>
                <View style={styles.answerIconContainer}>
                  <Ionicons name="sparkles" size={20} color={colors.primary} />
                </View>
                <Text style={styles.answerTitle}>My Response</Text>
                <TouchableOpacity onPress={speakAnswer} style={styles.speakButton}>
                  <Ionicons
                    name={isSpeaking ? 'volume-mute' : 'volume-high'}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.answerText}>{answer}</Text>

              {matchedMemories.length > 0 && (
                <View style={styles.matchedSection}>
                  <Text style={styles.matchedTitle}>Related Memories</Text>
                  {matchedMemories.map((memory) => (
                    <View key={memory.id} style={styles.matchedMemory}>
                      <View style={styles.matchedDot} />
                      <Text style={styles.matchedText} numberOfLines={2}>
                        {memory.raw_text}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          </View>
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
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  inputCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    padding: spacing.lg,
    color: colors.text,
    fontSize: fontSize.lg,
    minHeight: 60,
  },
  askButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  askButtonGradient: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askButtonDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  suggestedGrid: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  suggestedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestedText: {
    color: colors.text,
    fontSize: fontSize.md,
    flex: 1,
  },
  answerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  answerGradient: {
    padding: spacing.xl,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  answerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  speakButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  matchedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  matchedTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  matchedMemory: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  matchedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  matchedText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

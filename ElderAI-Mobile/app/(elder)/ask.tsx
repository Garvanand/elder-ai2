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
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, borderRadius } from '@/styles/theme';
import type { Question, Memory } from '@/types';

export default function AskScreen() {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
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
      const { data: memories } = await supabase
        .from('memories')
        .select('*')
        .eq('elder_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!memories || memories.length === 0) {
        setAnswer("I don't have any memories stored yet. Try adding some memories first!");
        setLoading(false);
        return;
      }

      const relevantMemories = memories.filter((m: Memory) =>
        q.toLowerCase().split(' ').some(word =>
          m.raw_text.toLowerCase().includes(word) ||
          m.tags.some(tag => tag.toLowerCase().includes(word))
        )
      ).slice(0, 5);

      const context = relevantMemories.length > 0
        ? relevantMemories.map((m: Memory) => m.raw_text).join('\n\n')
        : memories.slice(0, 5).map((m: Memory) => m.raw_text).join('\n\n');

      const generatedAnswer = `Based on your memories, here's what I found:\n\n${
        relevantMemories.length > 0
          ? relevantMemories.map((m: Memory) => `• ${m.raw_text}`).join('\n')
          : "I couldn't find specific memories related to your question. Would you like to add more memories?"
      }`;

      setAnswer(generatedAnswer);
      setMatchedMemories(relevantMemories as Memory[]);

      await supabase.from('questions').insert({
        elder_id: user.id,
        question_text: q,
        answer_text: generatedAnswer,
        matched_memory_ids: relevantMemories.map((m: Memory) => m.id),
      });

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
        <View style={styles.inputSection}>
          <Text style={styles.title}>Ask Me Anything</Text>
          <Text style={styles.subtitle}>
            I'll search through your memories to help you remember
          </Text>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your question here..."
              placeholderTextColor={colors.textMuted}
              value={question}
              onChangeText={setQuestion}
              multiline
            />
            <TouchableOpacity
              style={[styles.askButton, (!question.trim() || loading) && styles.askButtonDisabled]}
              onPress={() => handleAsk()}
              disabled={!question.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Ionicons name="send" size={24} color={colors.text} />
              )}
            </TouchableOpacity>
          </View>
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
            </TouchableOpacity>
          ))}
        </View>

        {answer && (
          <View style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <Ionicons name="chatbubble-ellipses" size={24} color={colors.primary} />
              <Text style={styles.answerTitle}>Answer</Text>
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
                    <Ionicons name="bookmark" size={16} color={colors.textMuted} />
                    <Text style={styles.matchedText} numberOfLines={2}>
                      {memory.raw_text}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
  inputSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  inputWrapper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    color: colors.text,
    fontSize: fontSize.lg,
    minHeight: 60,
  },
  askButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askButtonDisabled: {
    opacity: 0.5,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  suggestedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  suggestedButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestedText: {
    color: colors.text,
    fontSize: fontSize.md,
  },
  answerCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  answerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  speakButton: {
    padding: spacing.sm,
  },
  answerText: {
    fontSize: fontSize.lg,
    color: colors.text,
    lineHeight: 28,
  },
  matchedSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  matchedTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  matchedMemory: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  matchedText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

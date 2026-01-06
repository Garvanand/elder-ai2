import { supabase } from '@/integrations/supabase/client';

export interface CognitiveMetrics {
  vocabularyRichness: number;
  sentenceComplexity: number;
  topicCoherence: number;
  responseTimeAvg: number;
  emotionalStability: number;
  memoryRecallAccuracy: number;
  overallScore: number;
  trendDirection: 'improving' | 'stable' | 'declining' | 'rapid_decline';
}

export interface LinguisticAnalysis {
  wordCount: number;
  uniqueWords: number;
  avgSentenceLength: number;
  complexSentences: number;
  emotionWords: number;
  coherenceScore: number;
  typeTokenRatio: number;
}

const POSITIVE_EMOTIONS = ['happy', 'joy', 'love', 'excited', 'grateful', 'wonderful', 'blessed', 'peaceful', 'proud', 'hopeful'];
const NEGATIVE_EMOTIONS = ['sad', 'angry', 'worried', 'anxious', 'lonely', 'scared', 'frustrated', 'confused', 'tired', 'hurt'];
const COMPLEX_CONNECTORS = ['however', 'although', 'therefore', 'furthermore', 'consequently', 'nevertheless', 'meanwhile', 'moreover'];

export function analyzeLinguisticComplexity(text: string): LinguisticAnalysis {
  const words = text.toLowerCase().match(/\b[a-z']+\b/g) || [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const uniqueWords = new Set(words);
  
  const emotionWordCount = words.filter(w => 
    POSITIVE_EMOTIONS.includes(w) || NEGATIVE_EMOTIONS.includes(w)
  ).length;

  const complexSentenceCount = sentences.filter(s => {
    const lowerSentence = s.toLowerCase();
    return COMPLEX_CONNECTORS.some(c => lowerSentence.includes(c)) ||
           (s.includes(',') && s.split(',').length >= 3);
  }).length;

  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  const typeTokenRatio = uniqueWords.size / Math.max(words.length, 1);

  let coherenceScore = 0.5;
  if (sentences.length >= 2) {
    const sentenceWords = sentences.map(s => 
      new Set((s.toLowerCase().match(/\b[a-z']+\b/g) || []).filter(w => w.length > 3))
    );
    let overlapSum = 0;
    for (let i = 1; i < sentenceWords.length; i++) {
      const prev = sentenceWords[i - 1];
      const curr = sentenceWords[i];
      const intersection = new Set([...prev].filter(x => curr.has(x)));
      overlapSum += intersection.size / Math.max(Math.min(prev.size, curr.size), 1);
    }
    coherenceScore = overlapSum / Math.max(sentenceWords.length - 1, 1);
  }

  return {
    wordCount: words.length,
    uniqueWords: uniqueWords.size,
    avgSentenceLength,
    complexSentences: complexSentenceCount,
    emotionWords: emotionWordCount,
    coherenceScore: Math.min(coherenceScore, 1),
    typeTokenRatio
  };
}

export function calculateVocabularyRichness(analyses: LinguisticAnalysis[]): number {
  if (analyses.length === 0) return 0.5;
  const avgTTR = analyses.reduce((sum, a) => sum + a.typeTokenRatio, 0) / analyses.length;
  const avgUnique = analyses.reduce((sum, a) => sum + a.uniqueWords, 0) / analyses.length;
  const uniqueBonus = Math.min(avgUnique / 50, 0.3);
  return Math.min(avgTTR + uniqueBonus, 1);
}

export function calculateSentenceComplexity(analyses: LinguisticAnalysis[]): number {
  if (analyses.length === 0) return 0.5;
  const avgLength = analyses.reduce((sum, a) => sum + a.avgSentenceLength, 0) / analyses.length;
  const avgComplex = analyses.reduce((sum, a) => sum + a.complexSentences, 0) / analyses.length;
  
  const lengthScore = Math.min(avgLength / 20, 0.5);
  const complexityScore = Math.min(avgComplex / 3, 0.5);
  return lengthScore + complexityScore;
}

export function calculateTopicCoherence(analyses: LinguisticAnalysis[]): number {
  if (analyses.length === 0) return 0.5;
  return analyses.reduce((sum, a) => sum + a.coherenceScore, 0) / analyses.length;
}

export function calculateEmotionalStability(analyses: LinguisticAnalysis[], moods: string[]): number {
  const moodScores: Record<string, number> = {
    great: 5, good: 4, okay: 3, low: 2, sad: 1
  };
  
  if (moods.length < 2) return 0.7;
  
  const scores = moods.map(m => moodScores[m] || 3);
  let variance = 0;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  for (const score of scores) {
    variance += Math.pow(score - mean, 2);
  }
  variance /= scores.length;
  
  const stability = 1 - (Math.sqrt(variance) / 2);
  return Math.max(0, Math.min(stability, 1));
}

export function determineTrend(
  currentScore: number,
  historicalScores: number[]
): 'improving' | 'stable' | 'declining' | 'rapid_decline' {
  if (historicalScores.length < 3) return 'stable';
  
  const recentAvg = historicalScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = historicalScores.slice(3, 7).reduce((a, b) => a + b, 0) / 
                   Math.max(historicalScores.slice(3, 7).length, 1);
  
  const diff = currentScore - olderAvg;
  const recentDiff = currentScore - recentAvg;
  
  if (diff > 0.1 && recentDiff > 0) return 'improving';
  if (diff < -0.2 || recentDiff < -0.15) return 'rapid_decline';
  if (diff < -0.05) return 'declining';
  return 'stable';
}

export async function performCognitiveAssessment(elderId: string): Promise<CognitiveMetrics | null> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [memoriesResult, questionsResult, moodsResult, historyResult] = await Promise.all([
      supabase
        .from('memories')
        .select('raw_text, created_at, emotional_tone')
        .eq('elder_id', elderId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('questions')
        .select('question_text, answer_text, created_at')
        .eq('elder_id', elderId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('mood_entries')
        .select('mood, created_at')
        .eq('elder_id', elderId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('cognitive_scores')
        .select('overall_cognitive_score')
        .eq('elder_id', elderId)
        .order('assessment_date', { ascending: false })
        .limit(10)
    ]);

    const memories = memoriesResult.data || [];
    const questions = questionsResult.data || [];
    const moods = (moodsResult.data || []).map(m => m.mood);
    const historicalScores = (historyResult.data || [])
      .map(h => Number(h.overall_cognitive_score))
      .filter(s => !isNaN(s));

    const allTexts = [
      ...memories.map(m => m.raw_text).filter(Boolean),
      ...questions.map(q => q.question_text).filter(Boolean),
      ...questions.map(q => q.answer_text).filter(Boolean)
    ];

    if (allTexts.length < 3) {
      return null;
    }

    const analyses = allTexts.map(text => analyzeLinguisticComplexity(text));

    const vocabularyRichness = calculateVocabularyRichness(analyses);
    const sentenceComplexity = calculateSentenceComplexity(analyses);
    const topicCoherence = calculateTopicCoherence(analyses);
    const emotionalStability = calculateEmotionalStability(analyses, moods);

    const memoryRecallAccuracy = Math.min(
      (memories.length + questions.length) / 20,
      1
    ) * 0.7 + 0.3;

    const responseTimeAvg = 5000;

    const overallScore = (
      vocabularyRichness * 0.2 +
      sentenceComplexity * 0.2 +
      topicCoherence * 0.25 +
      emotionalStability * 0.15 +
      memoryRecallAccuracy * 0.2
    );

    const trendDirection = determineTrend(overallScore, historicalScores);

    return {
      vocabularyRichness,
      sentenceComplexity,
      topicCoherence,
      responseTimeAvg,
      emotionalStability,
      memoryRecallAccuracy,
      overallScore,
      trendDirection
    };
  } catch (error) {
    console.error('Cognitive assessment error:', error);
    return null;
  }
}

export async function saveCognitiveScore(
  elderId: string,
  metrics: CognitiveMetrics
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cognitive_scores')
      .upsert({
        elder_id: elderId,
        assessment_date: new Date().toISOString().split('T')[0],
        vocabulary_richness: metrics.vocabularyRichness,
        sentence_complexity: metrics.sentenceComplexity,
        topic_coherence: metrics.topicCoherence,
        response_time_avg: metrics.responseTimeAvg,
        emotional_stability: metrics.emotionalStability,
        memory_recall_accuracy: metrics.memoryRecallAccuracy,
        overall_cognitive_score: metrics.overallScore,
        trend_direction: metrics.trendDirection,
        alert_triggered: metrics.trendDirection === 'rapid_decline',
        raw_metrics: metrics
      }, {
        onConflict: 'elder_id,assessment_date'
      });

    if (error) throw error;

    if (metrics.trendDirection === 'rapid_decline') {
      await triggerCognitiveAlert(elderId, metrics);
    }

    return true;
  } catch (error) {
    console.error('Error saving cognitive score:', error);
    return false;
  }
}

async function triggerCognitiveAlert(elderId: string, metrics: CognitiveMetrics) {
  try {
    await supabase.from('alerts').insert({
      elder_id: elderId,
      type: 'cognitive_decline',
      severity: 'high',
      message: `Rapid cognitive decline detected. Overall score: ${(metrics.overallScore * 100).toFixed(1)}%. Immediate attention recommended.`,
      metadata: metrics
    });
  } catch (error) {
    console.error('Error triggering alert:', error);
  }
}

export async function getCognitiveHistory(
  elderId: string,
  days: number = 30
): Promise<any[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('cognitive_scores')
    .select('*')
    .eq('elder_id', elderId)
    .gte('assessment_date', startDate.toISOString().split('T')[0])
    .order('assessment_date', { ascending: true });

  if (error) {
    console.error('Error fetching cognitive history:', error);
    return [];
  }

  return data || [];
}

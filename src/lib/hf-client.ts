const HF_API_URL = 'https://api-inference.huggingface.co/models';

export interface EmotionResult {
  label: string;
  score: number;
}

export interface CognitiveAnalysisResult {
  emotions: EmotionResult[];
  dominantEmotion: string;
  sentimentScore: number;
  coherenceIndicators: {
    repetitionScore: number;
    topicConsistency: number;
  };
}

const EMOTION_MODEL = 'j-hartmann/emotion-english-distilroberta-base';
const SENTIMENT_MODEL = 'cardiffnlp/twitter-roberta-base-sentiment-latest';

class HuggingFaceClient {
  private apiKey: string | null = null;
  private cache: Map<string, { result: any; timestamp: number }> = new Map();
  private cacheTTL = 3600000;

  setApiKey(key: string) {
    this.apiKey = key;
  }

  private getCacheKey(model: string, text: string): string {
    return `${model}:${text.slice(0, 100)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.result;
    }
    return null;
  }

  private setCache(key: string, result: any): void {
    this.cache.set(key, { result, timestamp: Date.now() });
    if (this.cache.size > 1000) {
      const oldest = this.cache.keys().next().value;
      if (oldest) this.cache.delete(oldest);
    }
  }

  async query(model: string, text: string, retries = 3): Promise<any> {
    const cacheKey = this.getCacheKey(model, text);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(`${HF_API_URL}/${model}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: text }),
        });

        if (response.status === 503) {
          const data = await response.json();
          if (data.estimated_time) {
            await new Promise(resolve => setTimeout(resolve, data.estimated_time * 1000));
            continue;
          }
        }

        if (!response.ok) {
          throw new Error(`HuggingFace API error: ${response.status}`);
        }

        const result = await response.json();
        this.setCache(cacheKey, result);
        return result;
      } catch (error) {
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  async analyzeEmotion(text: string): Promise<EmotionResult[]> {
    try {
      const result = await this.query(EMOTION_MODEL, text);
      if (Array.isArray(result) && result[0]) {
        return result[0] as EmotionResult[];
      }
      return [];
    } catch (error) {
      console.error('Emotion analysis error:', error);
      return this.fallbackEmotionAnalysis(text);
    }
  }

  async analyzeSentiment(text: string): Promise<number> {
    try {
      const result = await this.query(SENTIMENT_MODEL, text);
      if (Array.isArray(result) && result[0]) {
        const emotions = result[0] as EmotionResult[];
        const positive = emotions.find(e => e.label === 'positive')?.score || 0;
        const negative = emotions.find(e => e.label === 'negative')?.score || 0;
        return positive - negative;
      }
      return 0;
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return this.fallbackSentimentAnalysis(text);
    }
  }

  private fallbackEmotionAnalysis(text: string): EmotionResult[] {
    const lowerText = text.toLowerCase();
    const emotions: Record<string, number> = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      neutral: 0.3
    };

    const joyWords = ['happy', 'joy', 'love', 'wonderful', 'great', 'amazing', 'blessed', 'grateful'];
    const sadWords = ['sad', 'miss', 'sorry', 'unfortunately', 'passed', 'lost', 'lonely'];
    const angerWords = ['angry', 'frustrated', 'annoyed', 'upset', 'hate'];
    const fearWords = ['afraid', 'worried', 'scared', 'anxious', 'nervous'];
    const surpriseWords = ['surprised', 'amazed', 'unexpected', 'shocking'];

    for (const word of joyWords) {
      if (lowerText.includes(word)) emotions.joy += 0.15;
    }
    for (const word of sadWords) {
      if (lowerText.includes(word)) emotions.sadness += 0.15;
    }
    for (const word of angerWords) {
      if (lowerText.includes(word)) emotions.anger += 0.15;
    }
    for (const word of fearWords) {
      if (lowerText.includes(word)) emotions.fear += 0.15;
    }
    for (const word of surpriseWords) {
      if (lowerText.includes(word)) emotions.surprise += 0.15;
    }

    const total = Object.values(emotions).reduce((a, b) => a + b, 0);
    return Object.entries(emotions)
      .map(([label, score]) => ({ label, score: score / total }))
      .sort((a, b) => b.score - a.score);
  }

  private fallbackSentimentAnalysis(text: string): number {
    const lowerText = text.toLowerCase();
    let score = 0;
    
    const positive = ['good', 'great', 'happy', 'love', 'wonderful', 'amazing', 'beautiful', 'blessed'];
    const negative = ['bad', 'sad', 'hate', 'terrible', 'awful', 'horrible', 'lonely', 'miss'];

    for (const word of positive) {
      if (lowerText.includes(word)) score += 0.1;
    }
    for (const word of negative) {
      if (lowerText.includes(word)) score -= 0.1;
    }

    return Math.max(-1, Math.min(1, score));
  }

  async performCognitiveAnalysis(text: string): Promise<CognitiveAnalysisResult> {
    const [emotions, sentimentScore] = await Promise.all([
      this.analyzeEmotion(text),
      this.analyzeSentiment(text)
    ]);

    const dominantEmotion = emotions.length > 0 ? emotions[0].label : 'neutral';

    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionScore = uniqueWords.size / Math.max(words.length, 1);

    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    let topicConsistency = 0.5;
    if (sentences.length >= 2) {
      const allWords = new Set(words.filter(w => w.length > 4));
      let overlap = 0;
      for (let i = 1; i < sentences.length; i++) {
        const prevWords = new Set(sentences[i-1].toLowerCase().split(/\s+/).filter(w => w.length > 4));
        const currWords = sentences[i].toLowerCase().split(/\s+/).filter(w => w.length > 4);
        for (const word of currWords) {
          if (prevWords.has(word)) overlap++;
        }
      }
      topicConsistency = Math.min(1, overlap / Math.max(sentences.length - 1, 1) * 0.5 + 0.5);
    }

    return {
      emotions,
      dominantEmotion,
      sentimentScore,
      coherenceIndicators: {
        repetitionScore,
        topicConsistency
      }
    };
  }
}

export const hfClient = new HuggingFaceClient();

export async function analyzeConversationEmotion(messages: string[]): Promise<{
  overallMood: string;
  emotionTrend: string;
  concernLevel: 'none' | 'low' | 'medium' | 'high';
}> {
  if (messages.length === 0) {
    return { overallMood: 'neutral', emotionTrend: 'stable', concernLevel: 'none' };
  }

  const analyses = await Promise.all(
    messages.slice(-5).map(msg => hfClient.performCognitiveAnalysis(msg))
  );

  const emotionCounts: Record<string, number> = {};
  let totalSentiment = 0;

  for (const analysis of analyses) {
    emotionCounts[analysis.dominantEmotion] = (emotionCounts[analysis.dominantEmotion] || 0) + 1;
    totalSentiment += analysis.sentimentScore;
  }

  const overallMood = Object.entries(emotionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

  const avgSentiment = totalSentiment / analyses.length;
  let emotionTrend = 'stable';
  if (analyses.length >= 2) {
    const recentSentiment = analyses.slice(-2).reduce((sum, a) => sum + a.sentimentScore, 0) / 2;
    const olderSentiment = analyses.slice(0, -2).reduce((sum, a) => sum + a.sentimentScore, 0) / Math.max(analyses.length - 2, 1);
    if (recentSentiment > olderSentiment + 0.2) emotionTrend = 'improving';
    else if (recentSentiment < olderSentiment - 0.2) emotionTrend = 'declining';
  }

  let concernLevel: 'none' | 'low' | 'medium' | 'high' = 'none';
  const negativeEmotions = ['sadness', 'anger', 'fear', 'disgust'];
  const negativeCount = negativeEmotions.reduce((sum, e) => sum + (emotionCounts[e] || 0), 0);
  
  if (negativeCount >= analyses.length * 0.8) concernLevel = 'high';
  else if (negativeCount >= analyses.length * 0.5) concernLevel = 'medium';
  else if (negativeCount >= analyses.length * 0.3) concernLevel = 'low';

  return { overallMood, emotionTrend, concernLevel };
}

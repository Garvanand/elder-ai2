import { supabase } from '@/integrations/supabase/client';

export interface CompanionPreferences {
  responseLength: 'short' | 'medium' | 'long';
  humorLevel: number;
  formalityLevel: number;
  nostalgiaPreference: number;
  topicPreferences: Record<string, number>;
  conversationPace: 'slow' | 'moderate' | 'fast';
  preferredGreetingStyle?: string;
  avoidedTopics: string[];
  favoriteMemories: string[];
  interactionCount: number;
  personalityVector: Record<string, number>;
}

const DEFAULT_PREFERENCES: CompanionPreferences = {
  responseLength: 'medium',
  humorLevel: 0.5,
  formalityLevel: 0.5,
  nostalgiaPreference: 0.7,
  topicPreferences: {
    family: 0.8,
    career: 0.5,
    childhood: 0.7,
    travel: 0.5,
    hobbies: 0.6,
    health: 0.3,
    currentEvents: 0.4
  },
  conversationPace: 'moderate',
  avoidedTopics: [],
  favoriteMemories: [],
  interactionCount: 0,
  personalityVector: {
    warmth: 0.8,
    curiosity: 0.7,
    empathy: 0.9,
    encouragement: 0.8,
    storytelling: 0.7
  }
};

export async function getCompanionPreferences(elderId: string): Promise<CompanionPreferences> {
  try {
    const { data, error } = await supabase
      .from('companion_preferences')
      .select('*')
      .eq('elder_id', elderId)
      .single();

    if (error || !data) {
      return DEFAULT_PREFERENCES;
    }

    return {
      responseLength: data.response_length || 'medium',
      humorLevel: Number(data.humor_level) || 0.5,
      formalityLevel: Number(data.formality_level) || 0.5,
      nostalgiaPreference: Number(data.nostalgia_preference) || 0.7,
      topicPreferences: data.topic_preferences || DEFAULT_PREFERENCES.topicPreferences,
      conversationPace: data.conversation_pace || 'moderate',
      preferredGreetingStyle: data.preferred_greeting_style,
      avoidedTopics: data.avoided_topics || [],
      favoriteMemories: data.favorite_memories || [],
      interactionCount: data.interaction_count || 0,
      personalityVector: data.personality_vector || DEFAULT_PREFERENCES.personalityVector
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function updateCompanionPreferences(
  elderId: string,
  updates: Partial<CompanionPreferences>
): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {};
    
    if (updates.responseLength) dbUpdates.response_length = updates.responseLength;
    if (updates.humorLevel !== undefined) dbUpdates.humor_level = updates.humorLevel;
    if (updates.formalityLevel !== undefined) dbUpdates.formality_level = updates.formalityLevel;
    if (updates.nostalgiaPreference !== undefined) dbUpdates.nostalgia_preference = updates.nostalgiaPreference;
    if (updates.topicPreferences) dbUpdates.topic_preferences = updates.topicPreferences;
    if (updates.conversationPace) dbUpdates.conversation_pace = updates.conversationPace;
    if (updates.preferredGreetingStyle) dbUpdates.preferred_greeting_style = updates.preferredGreetingStyle;
    if (updates.avoidedTopics) dbUpdates.avoided_topics = updates.avoidedTopics;
    if (updates.favoriteMemories) dbUpdates.favorite_memories = updates.favoriteMemories;
    if (updates.personalityVector) dbUpdates.personality_vector = updates.personalityVector;
    
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('companion_preferences')
      .upsert({
        elder_id: elderId,
        ...dbUpdates
      }, {
        onConflict: 'elder_id'
      });

    return !error;
  } catch {
    return false;
  }
}

export async function incrementInteractionCount(elderId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from('companion_preferences')
      .select('interaction_count')
      .eq('elder_id', elderId)
      .single();

    const currentCount = data?.interaction_count || 0;

    await supabase
      .from('companion_preferences')
      .upsert({
        elder_id: elderId,
        interaction_count: currentCount + 1,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'elder_id'
      });
  } catch (error) {
    console.error('Error incrementing interaction count:', error);
  }
}

interface ConversationContext {
  userMessage: string;
  recentTopics: string[];
  mood?: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

export function adaptResponseStyle(
  baseResponse: string,
  preferences: CompanionPreferences,
  context: ConversationContext
): string {
  let response = baseResponse;

  if (preferences.responseLength === 'short') {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 3) {
      response = sentences.slice(0, 3).join('. ') + '.';
    }
  } else if (preferences.responseLength === 'long') {
    if (response.length < 200 && preferences.nostalgiaPreference > 0.6) {
      response += " Would you like to tell me more about that?";
    }
  }

  if (preferences.formalityLevel > 0.7) {
    response = response.replace(/Yeah/g, 'Yes');
    response = response.replace(/gonna/g, 'going to');
    response = response.replace(/wanna/g, 'want to');
  } else if (preferences.formalityLevel < 0.3) {
    response = response.replace(/However/g, 'But');
    response = response.replace(/Therefore/g, 'So');
  }

  return response;
}

export function generatePersonalizedGreeting(
  preferences: CompanionPreferences,
  elderName: string,
  timeOfDay: 'morning' | 'afternoon' | 'evening'
): string {
  const greetingsByTime = {
    morning: [
      `Good morning, ${elderName}! How did you sleep?`,
      `Rise and shine, ${elderName}! Ready for a wonderful day?`,
      `Good morning, dear ${elderName}. What's on your mind this beautiful morning?`
    ],
    afternoon: [
      `Good afternoon, ${elderName}! How's your day going?`,
      `Hello ${elderName}! Having a good day so far?`,
      `Hi there, ${elderName}! What have you been up to today?`
    ],
    evening: [
      `Good evening, ${elderName}! How was your day?`,
      `Hello ${elderName}! Winding down for the evening?`,
      `Evening, dear ${elderName}. What made you smile today?`
    ]
  };

  if (preferences.preferredGreetingStyle) {
    return preferences.preferredGreetingStyle.replace('{name}', elderName);
  }

  const options = greetingsByTime[timeOfDay];
  const warmthFactor = preferences.personalityVector.warmth || 0.8;
  
  if (warmthFactor > 0.7) {
    return options[2];
  } else if (warmthFactor > 0.4) {
    return options[1];
  }
  return options[0];
}

export function selectResponseTone(
  preferences: CompanionPreferences,
  detectedEmotion: string
): { tone: string; encouragement: string } {
  const tones: Record<string, { tone: string; encouragement: string }> = {
    happy: {
      tone: 'joyful',
      encouragement: "That's wonderful to hear! Your happiness brightens my day too."
    },
    sad: {
      tone: 'compassionate',
      encouragement: "I'm here with you. Would you like to talk about what's on your heart?"
    },
    nostalgic: {
      tone: 'warm',
      encouragement: "Those memories are precious treasures. Let's explore them together."
    },
    anxious: {
      tone: 'calming',
      encouragement: "Take a deep breath with me. Everything will be alright."
    },
    confused: {
      tone: 'patient',
      encouragement: "That's okay, take your time. I'm not going anywhere."
    },
    neutral: {
      tone: 'friendly',
      encouragement: "I'm glad we're talking. What would you like to share today?"
    }
  };

  return tones[detectedEmotion] || tones.neutral;
}

interface InteractionFeedback {
  responseHelpful: boolean;
  emotionallySupported: boolean;
  topicEngaging: boolean;
  lengthAppropriate: boolean;
  detectedTopic?: string;
}

export async function learnFromInteraction(
  elderId: string,
  feedback: InteractionFeedback,
  preferences: CompanionPreferences
): Promise<CompanionPreferences> {
  const learningRate = 0.1;
  const updatedPreferences = { ...preferences };

  if (!feedback.lengthAppropriate) {
    if (preferences.responseLength === 'short') {
      updatedPreferences.responseLength = 'medium';
    } else if (preferences.responseLength === 'long') {
      updatedPreferences.responseLength = 'medium';
    }
  }

  if (feedback.topicEngaging && feedback.detectedTopic) {
    const currentScore = updatedPreferences.topicPreferences[feedback.detectedTopic] || 0.5;
    updatedPreferences.topicPreferences[feedback.detectedTopic] = Math.min(
      currentScore + learningRate,
      1.0
    );
  }

  if (feedback.emotionallySupported) {
    updatedPreferences.personalityVector.empathy = Math.min(
      (updatedPreferences.personalityVector.empathy || 0.9) + learningRate * 0.5,
      1.0
    );
  }

  await updateCompanionPreferences(elderId, updatedPreferences);
  return updatedPreferences;
}

export function buildCompanionPrompt(
  preferences: CompanionPreferences,
  elderName: string,
  conversationHistory: string[],
  memories: string[]
): string {
  const personalityTraits = Object.entries(preferences.personalityVector)
    .filter(([, value]) => value > 0.6)
    .map(([trait]) => trait)
    .join(', ');

  const favoriteTopics = Object.entries(preferences.topicPreferences)
    .filter(([, score]) => score > 0.6)
    .map(([topic]) => topic)
    .join(', ');

  return `You are a warm, caring memory companion for ${elderName}, an elderly person. 
Your personality emphasizes: ${personalityTraits}.

Communication style:
- Response length: ${preferences.responseLength}
- Formality: ${preferences.formalityLevel > 0.6 ? 'formal and respectful' : 'casual and friendly'}
- Humor level: ${preferences.humorLevel > 0.5 ? 'include gentle humor when appropriate' : 'keep responses sincere and straightforward'}

${elderName}'s favorite topics include: ${favoriteTopics}
${preferences.avoidedTopics.length > 0 ? `Topics to avoid: ${preferences.avoidedTopics.join(', ')}` : ''}

Known memories and stories:
${memories.slice(0, 5).map((m, i) => `${i + 1}. ${m}`).join('\n')}

Recent conversation context:
${conversationHistory.slice(-5).join('\n')}

Remember: You know ${elderName} well. Reference their stories naturally. Be patient, warm, and genuinely interested in their life experiences. Always encourage them to share more without being pushy.`;
}

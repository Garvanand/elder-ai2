import { Memory, BehavioralSignal } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { Brain, Heart, TrendingUp } from 'lucide-react';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';

interface CognitiveJournalProps {
  memories: Memory[];
  signals: BehavioralSignal[];
}

export function CognitiveJournal({ memories, signals }: CognitiveJournalProps) {
  // Process mood data from emotional_tone
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
  
  const moodScoreMap: Record<string, number> = {
    'happy': 5,
    'positive': 4,
    'neutral': 3,
    'confused': 2,
    'anxious': 1,
    'sad': 1
  };

  const chartData = last7Days.map(day => {
    const dayMemories = memories.filter(m => isSameDay(new Date(m.created_at), day));
    const daySignals = signals.filter(s => isSameDay(new Date(s.created_at), day));
    
    // Average mood from memories
    const validTones = dayMemories
      .map(m => m.emotional_tone?.toLowerCase() || '')
      .filter(t => moodScoreMap[t]);
    
    const avgMood = validTones.length > 0 
      ? validTones.reduce((acc, t) => acc + moodScoreMap[t], 0) / validTones.length
      : 3; // Default to neutral

    return {
      date: format(day, 'MMM dd'),
      memories: dayMemories.length,
      mood: parseFloat(avgMood.toFixed(1)),
      confusion: daySignals.filter(s => s.signal_type === 'repeated_question').length
    };
  });

  const narrativeSummary = memories.length > 0 
    ? `Recent Memory: ${memories[0].raw_text.substring(0, 100)}...`
    : "No recent interactions recorded.";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> Cognitive Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">84/100</div>
            <p className="text-xs text-muted-foreground mt-1">Stably active this week</p>
          </CardContent>
        </Card>
        
        <Card className="bg-rose-50 border-rose-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-rose-700">
              <Heart className="h-5 w-5" /> Emotional Stability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700">Good</div>
            <p className="text-xs text-rose-600/70 mt-1">Consistent positive affect</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border-indigo-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
              <TrendingUp className="h-5 w-5" /> Recall Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700">+12%</div>
            <p className="text-xs text-indigo-600/70 mt-1">Improvement from last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Mood & Cognitive Trends</CardTitle>
            <CardDescription>Daily mood fluctuations and memory frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 5]} hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="mood" stroke="#8884d8" fillOpacity={1} fill="url(#colorMood)" name="Mood Score" />
                  <Area type="monotone" dataKey="memories" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Memories Captured" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recognition & Confusion</CardTitle>
            <CardDescription>Signals of confusion vs successful recall</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Legend />
                  <Bar dataKey="confusion" fill="#ef4444" radius={[4, 4, 0, 0]} name="Confusion Signals" />
                  <Bar dataKey="memories" fill="#10b981" radius={[4, 4, 0, 0]} name="Recall Success" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle>Narrative Insight</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed italic">
            "{narrativeSummary}"
          </p>
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold text-sm mb-1">AI Observation:</h4>
            <p className="text-sm">
              The elder showed significant enthusiasm today when discussing childhood pets. 
              The emotional tone remained consistently positive for 45 minutes of interaction.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Cloud, CloudRain, Heart, Smile, Frown, Meh, X, TrendingUp, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/contexts/DemoContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface MoodEntry {
  id: string;
  mood: 'great' | 'good' | 'okay' | 'low' | 'sad';
  note?: string;
  created_at: string;
}

const moodConfig = {
  great: { icon: Sun, color: 'from-yellow-400 to-orange-400', bg: 'bg-yellow-50', label: 'Wonderful!', emoji: '☀️' },
  good: { icon: Smile, color: 'from-green-400 to-emerald-400', bg: 'bg-green-50', label: 'Good', emoji: '😊' },
  okay: { icon: Meh, color: 'from-blue-400 to-cyan-400', bg: 'bg-blue-50', label: 'Okay', emoji: '😐' },
  low: { icon: Cloud, color: 'from-gray-400 to-slate-400', bg: 'bg-gray-50', label: 'A bit low', emoji: '☁️' },
  sad: { icon: CloudRain, color: 'from-purple-400 to-indigo-400', bg: 'bg-purple-50', label: 'Sad', emoji: '🌧️' }
};

interface MoodTrackerProps {
  elderId: string;
  onClose: () => void;
}

export function MoodTracker({ elderId, onClose }: MoodTrackerProps) {
  const { isGuestMode } = useDemo();
  const [selectedMood, setSelectedMood] = useState<keyof typeof moodConfig | null>(null);
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [view, setView] = useState<'track' | 'history'>('track');
  const [saving, setSaving] = useState(false);
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);

  useEffect(() => {
    if (isGuestMode) {
      setMoodHistory([
        { id: '1', mood: 'great', note: 'Had a lovely chat with Sarah', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '2', mood: 'good', note: 'Morning walk in the garden', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: '3', mood: 'okay', note: 'Quiet day at home', created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: '4', mood: 'great', note: 'Grandchildren visited!', created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
        { id: '5', mood: 'good', note: 'Finished my puzzle', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: '6', mood: 'low', note: 'Missing my old friends', created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
        { id: '7', mood: 'good', note: 'Beautiful sunset today', created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
      ]);
    } else {
      fetchMoodHistory();
    }
  }, [elderId, isGuestMode]);

  const fetchMoodHistory = async () => {
    const { data } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      setMoodHistory(data as MoodEntry[]);
      const today = new Date().toDateString();
      const todayEntry = data.find(e => new Date(e.created_at).toDateString() === today);
      if (todayEntry) setTodayMood(todayEntry as MoodEntry);
    }
  };

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);

    if (isGuestMode) {
      setTimeout(() => {
        const newEntry: MoodEntry = {
          id: Date.now().toString(),
          mood: selectedMood,
          note: note || undefined,
          created_at: new Date().toISOString()
        };
        setMoodHistory(prev => [newEntry, ...prev]);
        setTodayMood(newEntry);
        setSelectedMood(null);
        setNote('');
        setSaving(false);
      }, 500);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .insert({
          elder_id: elderId,
          mood: selectedMood,
          note: note || null
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setMoodHistory(prev => [data as MoodEntry, ...prev]);
        setTodayMood(data as MoodEntry);
      }
      setSelectedMood(null);
      setNote('');
    } catch (error) {
      console.error('Error saving mood:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMoodStats = () => {
    const last7Days = moodHistory.slice(0, 7);
    const moodScores = { great: 5, good: 4, okay: 3, low: 2, sad: 1 };
    const avg = last7Days.reduce((sum, e) => sum + moodScores[e.mood], 0) / (last7Days.length || 1);
    return {
      average: avg.toFixed(1),
      trend: avg >= 3.5 ? 'positive' : avg >= 2.5 ? 'stable' : 'needs attention',
      greatDays: last7Days.filter(e => e.mood === 'great' || e.mood === 'good').length
    };
  };

  const stats = getMoodStats();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <Card className="w-full max-w-xl rounded-[40px] bg-gradient-to-b from-rose-50 to-pink-50 border-2 border-rose-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-rose-500 to-pink-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">How Are You Feeling?</h2>
              <p className="text-rose-100 text-sm">Your daily emotional check-in</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex border-b border-rose-200">
          <button
            onClick={() => setView('track')}
            className={cn(
              "flex-1 py-4 text-lg font-medium transition-colors",
              view === 'track' ? 'bg-white text-rose-600 border-b-2 border-rose-500' : 'text-rose-400 hover:bg-rose-50'
            )}
          >
            Today's Mood
          </button>
          <button
            onClick={() => setView('history')}
            className={cn(
              "flex-1 py-4 text-lg font-medium transition-colors",
              view === 'history' ? 'bg-white text-rose-600 border-b-2 border-rose-500' : 'text-rose-400 hover:bg-rose-50'
            )}
          >
            My Week
          </button>
        </div>

        <div className="p-6">
          {view === 'track' ? (
            <div className="space-y-6">
              {todayMood ? (
                <div className="text-center py-8">
                  <div className={cn(
                    "w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 bg-gradient-to-br",
                    moodConfig[todayMood.mood].color
                  )}>
                    <span className="text-5xl">{moodConfig[todayMood.mood].emoji}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Today you're feeling {moodConfig[todayMood.mood].label}
                  </h3>
                  {todayMood.note && (
                    <p className="text-gray-600 italic">"{todayMood.note}"</p>
                  )}
                  <p className="text-rose-400 mt-4 text-sm">You can update your mood again tomorrow</p>
                </div>
              ) : (
                <>
                  <p className="text-xl text-center text-gray-700 mb-6">
                    Tap on how you're feeling right now
                  </p>
                  
                  <div className="grid grid-cols-5 gap-3">
                    {(Object.keys(moodConfig) as Array<keyof typeof moodConfig>).map((mood) => {
                      const config = moodConfig[mood];
                      const Icon = config.icon;
                      return (
                        <motion.button
                          key={mood}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedMood(mood)}
                          className={cn(
                            "flex flex-col items-center p-4 rounded-2xl transition-all",
                            selectedMood === mood 
                              ? `bg-gradient-to-br ${config.color} text-white shadow-lg scale-110` 
                              : `${config.bg} hover:shadow-md`
                          )}
                        >
                          <span className="text-3xl mb-2">{config.emoji}</span>
                          <span className={cn(
                            "text-xs font-medium",
                            selectedMood === mood ? 'text-white' : 'text-gray-600'
                          )}>
                            {config.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {selectedMood && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Would you like to add a note? (optional)"
                          className="w-full p-4 rounded-2xl border-2 border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-none text-lg"
                          rows={3}
                        />
                        <Button
                          onClick={handleSaveMood}
                          disabled={saving}
                          className="w-full h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-xl font-semibold"
                        >
                          {saving ? 'Saving...' : 'Save My Mood'}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                  <TrendingUp className={cn(
                    "w-8 h-8 mx-auto mb-2",
                    stats.trend === 'positive' ? 'text-green-500' : stats.trend === 'stable' ? 'text-blue-500' : 'text-amber-500'
                  )} />
                  <p className="text-2xl font-bold text-gray-800">{stats.average}</p>
                  <p className="text-sm text-gray-500">Average</p>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                  <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-2xl font-bold text-gray-800">{stats.greatDays}</p>
                  <p className="text-sm text-gray-500">Good Days</p>
                </Card>
                <Card className="p-4 text-center bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold text-gray-800">{moodHistory.length}</p>
                  <p className="text-sm text-gray-500">Entries</p>
                </Card>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {moodHistory.slice(0, 7).map((entry) => {
                  const config = moodConfig[entry.mood];
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn("p-4 rounded-2xl flex items-center gap-4", config.bg)}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br",
                        config.color
                      )}>
                        <span className="text-2xl">{config.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800">{config.label}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {entry.note && (
                          <p className="text-sm text-gray-600 mt-1 italic">"{entry.note}"</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

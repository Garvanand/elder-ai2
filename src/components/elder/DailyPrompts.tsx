import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Lightbulb, Clock, Star, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';

interface MemoryPrompt {
  id: string;
  category: 'childhood' | 'family' | 'career' | 'travel' | 'love' | 'traditions' | 'wisdom';
  prompt: string;
  followUp?: string;
  icon: string;
}

const promptCategories = {
  childhood: { label: 'Childhood', color: 'from-pink-400 to-rose-400', bg: 'bg-pink-50' },
  family: { label: 'Family', color: 'from-blue-400 to-indigo-400', bg: 'bg-blue-50' },
  career: { label: 'Career', color: 'from-green-400 to-emerald-400', bg: 'bg-green-50' },
  travel: { label: 'Adventures', color: 'from-orange-400 to-amber-400', bg: 'bg-orange-50' },
  love: { label: 'Love', color: 'from-red-400 to-pink-400', bg: 'bg-red-50' },
  traditions: { label: 'Traditions', color: 'from-purple-400 to-violet-400', bg: 'bg-purple-50' },
  wisdom: { label: 'Wisdom', color: 'from-amber-400 to-yellow-400', bg: 'bg-amber-50' }
};

const allPrompts: MemoryPrompt[] = [
  { id: '1', category: 'childhood', prompt: 'What was your favorite game to play as a child?', followUp: 'Who did you play it with?', icon: '🎮' },
  { id: '2', category: 'childhood', prompt: 'What did your childhood home look like?', followUp: 'What room was your favorite?', icon: '🏠' },
  { id: '3', category: 'childhood', prompt: 'Who was your best friend growing up?', followUp: 'What adventures did you have together?', icon: '👫' },
  { id: '4', category: 'family', prompt: 'What is your favorite memory with your parents?', followUp: 'What made it so special?', icon: '👨‍👩‍👧' },
  { id: '5', category: 'family', prompt: 'What family tradition do you cherish most?', followUp: 'How did it start?', icon: '🎄' },
  { id: '6', category: 'family', prompt: 'Tell me about the day your first child was born.', followUp: 'What were you feeling?', icon: '👶' },
  { id: '7', category: 'career', prompt: 'What was your first job?', followUp: 'What did you learn from it?', icon: '💼' },
  { id: '8', category: 'career', prompt: 'What accomplishment are you most proud of?', followUp: 'How did you achieve it?', icon: '🏆' },
  { id: '9', category: 'career', prompt: 'Who was a mentor who shaped your life?', followUp: 'What wisdom did they share?', icon: '🌟' },
  { id: '10', category: 'travel', prompt: 'What is the most beautiful place you have visited?', followUp: 'What made it memorable?', icon: '🌍' },
  { id: '11', category: 'travel', prompt: 'Tell me about an adventure that surprised you.', followUp: 'Would you do it again?', icon: '🗺️' },
  { id: '12', category: 'love', prompt: 'How did you meet your spouse?', followUp: 'When did you know they were the one?', icon: '💕' },
  { id: '13', category: 'love', prompt: 'What is the most romantic thing anyone has done for you?', followUp: 'How did it make you feel?', icon: '💝' },
  { id: '14', category: 'traditions', prompt: 'What holiday tradition brings you the most joy?', followUp: 'Who celebrates with you?', icon: '🎉' },
  { id: '15', category: 'traditions', prompt: 'What recipe has been in your family for generations?', followUp: 'What makes it special?', icon: '🍳' },
  { id: '16', category: 'wisdom', prompt: 'What is the best advice you have ever received?', followUp: 'How has it guided you?', icon: '💡' },
  { id: '17', category: 'wisdom', prompt: 'What would you tell your younger self?', followUp: 'What lesson took you longest to learn?', icon: '📝' },
  { id: '18', category: 'wisdom', prompt: 'What do you hope your grandchildren will remember about you?', followUp: 'What legacy do you want to leave?', icon: '✨' },
];

interface DailyPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  onClose: () => void;
}

export function DailyPrompts({ onSelectPrompt, onClose }: DailyPromptsProps) {
  const { isGuestMode } = useDemo();
  const [todaysPrompts, setTodaysPrompts] = useState<MemoryPrompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof promptCategories | null>(null);
  const [completedToday, setCompletedToday] = useState<string[]>([]);

  useEffect(() => {
    generateDailyPrompts();
  }, []);

  const generateDailyPrompts = () => {
    const shuffled = [...allPrompts].sort(() => Math.random() - 0.5);
    setTodaysPrompts(shuffled.slice(0, 6));
  };

  const filteredPrompts = selectedCategory 
    ? allPrompts.filter(p => p.category === selectedCategory)
    : todaysPrompts;

  const handleSelectPrompt = (prompt: MemoryPrompt) => {
    setCompletedToday(prev => [...prev, prompt.id]);
    onSelectPrompt(prompt.prompt);
    onClose();
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[40px] bg-gradient-to-b from-violet-50 to-purple-50 border-2 border-violet-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{getTimeOfDayGreeting()}!</h2>
                <p className="text-violet-100 text-sm">Let's explore your memories today</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              ✕
            </Button>
          </div>
          
          <div className="flex items-center justify-between bg-white/10 rounded-2xl p-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">Today's memory journey: {completedToday.length} of 6 prompts</span>
            </div>
            <button
              onClick={generateDailyPrompts}
              className="flex items-center gap-1 text-sm hover:text-white/80"
            >
              <RefreshCw className="w-4 h-4" />
              New prompts
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-violet-200 overflow-x-auto">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                !selectedCategory 
                  ? 'bg-violet-500 text-white' 
                  : 'bg-violet-100 text-violet-600 hover:bg-violet-200'
              )}
            >
              Today's Picks
            </button>
            {(Object.keys(promptCategories) as Array<keyof typeof promptCategories>).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === cat 
                    ? `bg-gradient-to-r ${promptCategories[cat].color} text-white` 
                    : `${promptCategories[cat].bg} text-gray-600 hover:opacity-80`
                )}
              >
                {promptCategories[cat].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {filteredPrompts.map((prompt, index) => {
                const cat = promptCategories[prompt.category];
                const isCompleted = completedToday.includes(prompt.id);
                
                return (
                  <motion.button
                    key={prompt.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectPrompt(prompt)}
                    disabled={isCompleted}
                    className={cn(
                      "w-full p-5 rounded-2xl text-left transition-all group",
                      isCompleted 
                        ? 'bg-gray-100 opacity-60' 
                        : `${cat.bg} hover:shadow-lg hover:scale-[1.02]`
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl",
                        isCompleted ? 'bg-gray-200' : `bg-gradient-to-br ${cat.color}`
                      )}>
                        {isCompleted ? '✓' : prompt.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            isCompleted ? 'bg-gray-200 text-gray-500' : `bg-gradient-to-r ${cat.color} text-white`
                          )}>
                            {cat.label}
                          </span>
                          {isCompleted && (
                            <span className="text-xs text-green-500 font-medium">Completed</span>
                          )}
                        </div>
                        <p className={cn(
                          "text-lg font-medium mb-1",
                          isCompleted ? 'text-gray-500' : 'text-gray-800'
                        )}>
                          {prompt.prompt}
                        </p>
                        {prompt.followUp && (
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Lightbulb className="w-4 h-4" />
                            {prompt.followUp}
                          </p>
                        )}
                      </div>
                      {!isCompleted && (
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="p-4 bg-violet-100 border-t border-violet-200">
          <div className="flex items-center justify-center gap-2 text-violet-600">
            <Clock className="w-5 h-5" />
            <span className="text-sm font-medium">New prompts refresh every day at midnight</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

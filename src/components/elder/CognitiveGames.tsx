import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, RefreshCw, X, Timer, TrendingUp, Mic, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSpeech } from '@/hooks/useSpeech';

interface CardItem {
  id: number;
  content: string;
  type: 'text' | 'image';
  matchId: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export const MemoryMatchingGame: React.FC<{ elderId: string; onClose: () => void }> = ({ elderId, onClose }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const { speak } = useSpeech();

  const initializeGame = useCallback((level: Difficulty = difficulty) => {
    const itemsPool = [
      { content: 'Apple', matchId: 1 }, { content: '🍎', matchId: 1 },
      { content: 'Sun', matchId: 2 }, { content: '☀️', matchId: 2 },
      { content: 'Book', matchId: 3 }, { content: '📚', matchId: 3 },
      { content: 'Heart', matchId: 4 }, { content: '❤️', matchId: 4 },
      { content: 'Water', matchId: 5 }, { content: '💧', matchId: 5 },
      { content: 'Tree', matchId: 6 }, { content: '🌳', matchId: 6 },
      { content: 'Cloud', matchId: 7 }, { content: '☁️', matchId: 7 },
      { content: 'Star', matchId: 8 }, { content: '⭐', matchId: 8 },
      { content: 'Fish', matchId: 9 }, { content: '🐟', matchId: 9 },
      { content: 'Bird', matchId: 10 }, { content: '🐦', matchId: 10 },
    ];

    const pairCounts = { easy: 4, medium: 6, hard: 10 };
    const selectedPairs = itemsPool.slice(0, pairCounts[level] * 2);
    
    const shuffled = selectedPairs
      .map((item, index) => ({ ...item, id: index }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled as any);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setIsGameOver(false);
    setStartTime(Date.now());
    
    if (level === 'hard') setTimeLeft(60);
    else if (level === 'medium') setTimeLeft(90);
    else setTimeLeft(0);

    speak(`Starting ${level} memory game. Find the matching pairs.`);
  }, [difficulty, speak]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGameOver(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isGameOver]);

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || solved.includes(id) || flipped.includes(id) || isGameOver) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlipped;
      if (cards[firstId].matchId === cards[secondId].matchId) {
        setSolved([...solved, firstId, secondId]);
        setFlipped([]);
        speak("Match found!");
        if (solved.length + 2 === cards.length) {
          handleGameOver(true);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const handleGameOver = async (isWin: boolean) => {
    setIsGameOver(true);
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    if (isWin) {
      speak(`Excellent work! You completed the game in ${moves} moves.`);
    } else {
      speak("Time is up! Let's try again.");
    }

    try {
      await supabase.from('cognitive_assessments').insert({
        elder_id: elderId,
        game_type: 'matching',
        score: isWin ? Math.max(100 - moves + (difficulty === 'hard' ? 50 : 0), 10) : 0,
        total_questions: cards.length / 2,
        duration_seconds: duration,
        difficulty_level: difficulty,
        feedback: isWin ? "Win" : "Time Out"
      });
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl bg-slate-50 rounded-[40px] overflow-hidden shadow-2xl relative border-none">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-6 right-6 rounded-full h-12 w-12 hover:bg-red-50 hover:text-red-500 z-20"
          onClick={onClose}
        >
          <X className="h-8 w-8" />
        </Button>

        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                <Brain className="h-10 w-10 text-primary" />
                Memory Training
              </h2>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((level) => (
                  <Button
                    key={level}
                    size="sm"
                    variant={difficulty === level ? 'default' : 'outline'}
                    className="rounded-full px-4 capitalize font-bold"
                    onClick={() => {
                      setDifficulty(level);
                      initializeGame(level);
                    }}
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Moves</p>
                <div className="bg-white px-6 py-2 rounded-2xl border-2 border-slate-100 font-black text-2xl text-primary">
                  {moves}
                </div>
              </div>
              {timeLeft > 0 && (
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                  <div className={`bg-white px-6 py-2 rounded-2xl border-2 font-black text-2xl flex items-center gap-2 ${timeLeft < 10 ? 'text-red-500 border-red-100' : 'text-slate-700 border-slate-100'}`}>
                    <Timer className="h-5 w-5" />
                    {timeLeft}s
                  </div>
                </div>
              )}
              <Button onClick={() => initializeGame()} variant="outline" className="rounded-2xl border-2 h-14 w-14 p-0">
                <RefreshCw className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Grid */}
          <div className={`grid gap-4 md:gap-6 ${difficulty === 'hard' ? 'grid-cols-4 md:grid-cols-5' : 'grid-cols-3 md:grid-cols-4'}`}>
            {cards.map((card) => (
              <motion.div
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="aspect-square relative cursor-pointer"
                onClick={() => handleCardClick(card.id)}
              >
                <AnimatePresence mode="wait">
                  {flipped.includes(card.id) || solved.includes(card.id) ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      className={`absolute inset-0 rounded-[24px] flex items-center justify-center text-5xl shadow-sm border-4 transition-colors ${
                        solved.includes(card.id) ? 'bg-green-50 border-green-200' : 'bg-white border-primary/20'
                      }`}
                    >
                      {card.content}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      className="absolute inset-0 bg-white rounded-[24px] flex items-center justify-center shadow-sm border-4 border-slate-100 group hover:border-primary/30 transition-all"
                    >
                      <Brain className="h-12 w-12 text-slate-200 group-hover:text-primary/20" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {isGameOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="bg-white p-12 rounded-[40px] shadow-2xl max-w-lg w-full"
                >
                  {solved.length === cards.length ? (
                    <>
                      <div className="flex justify-center mb-6">
                        <div className="bg-yellow-100 p-6 rounded-full relative">
                          <Trophy className="h-20 w-20 text-yellow-500" />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-2 -right-2 bg-primary text-white p-3 rounded-full"
                          >
                            <Star className="h-6 w-6 fill-current" />
                          </motion.div>
                        </div>
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 mb-2">Great Memory!</h3>
                      <p className="text-slate-500 font-medium text-lg mb-8">
                        You're getting sharper every day. Completed in {moves} moves.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-50 p-6 rounded-full w-fit mx-auto mb-6">
                        <Timer className="h-20 w-20 text-red-500" />
                      </div>
                      <h3 className="text-4xl font-black text-slate-900 mb-2">Time's Up!</h3>
                      <p className="text-slate-500 font-medium text-lg mb-8">
                        Don't worry, practice makes perfect. Want to try again?
                      </p>
                    </>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={() => initializeGame()} size="lg" className="h-16 rounded-2xl text-xl font-bold">
                      Play Again
                    </Button>
                    <Button onClick={onClose} variant="outline" size="lg" className="h-16 rounded-2xl text-xl font-bold border-2">
                      Exit
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

export const CognitiveEngagementAnalytics: React.FC<{ elderId: string }> = ({ elderId }) => {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('cognitive_assessments')
        .select('*')
        .eq('elder_id', elderId)
        .order('created_at', { ascending: false })
        .limit(10);
      if (data) setStats(data);
    };
    fetchStats();
  }, [elderId]);

  if (stats.length === 0) return null;

  const avgScore = Math.round(stats.reduce((acc, s) => acc + (s.score || 0), 0) / stats.length);

  return (
    <Card className="p-6 rounded-[32px] border-none shadow-sm bg-gradient-to-br from-indigo-500 to-primary text-white">
      <div className="flex items-center justify-between mb-4">
        <TrendingUp className="h-8 w-8 opacity-80" />
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-widest opacity-80">Brain Score</p>
          <p className="text-3xl font-black">{avgScore}</p>
        </div>
      </div>
      <div className="space-y-3">
        <p className="font-bold text-sm">Recent Activity</p>
        <div className="flex gap-2">
          {stats.slice(0, 5).map((s, i) => (
            <div key={i} className="flex-1 h-12 bg-white/20 rounded-xl flex items-center justify-center font-black">
              {s.score}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

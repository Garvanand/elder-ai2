import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Trophy, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CardItem {
  id: number;
  content: string;
  type: 'text' | 'image';
  matchId: number;
}

export const MemoryMatchingGame: React.FC<{ elderId: string; onClose: () => void }> = ({ elderId, onClose }) => {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const items = [
      { content: 'Apple', matchId: 1 },
      { content: '🍎', matchId: 1 },
      { content: 'Sun', matchId: 2 },
      { content: '☀️', matchId: 2 },
      { content: 'Book', matchId: 3 },
      { content: '📚', matchId: 3 },
      { content: 'Heart', matchId: 4 },
      { content: '❤️', matchId: 4 },
      { content: 'Water', matchId: 5 },
      { content: '💧', matchId: 5 },
      { content: 'Tree', matchId: 6 },
      { content: '🌳', matchId: 6 },
    ];

    const shuffled = items
      .map((item, index) => ({ ...item, id: index }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled as any);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
    setIsGameOver(false);
  };

  const handleCardClick = (id: number) => {
    if (flipped.length === 2 || solved.includes(id) || flipped.includes(id)) return;

    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlipped;
      if (cards[firstId].matchId === cards[secondId].matchId) {
        setSolved([...solved, firstId, secondId]);
        setFlipped([]);
        if (solved.length + 2 === cards.length) {
          handleWin();
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const handleWin = async () => {
    setIsGameOver(true);
    const duration = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await supabase.from('cognitive_assessments').insert({
        elder_id: elderId,
        game_type: 'matching',
        score: Math.max(100 - moves, 10),
        total_questions: cards.length / 2,
        duration_seconds: duration,
        difficulty_level: 'easy'
      });
      toast.success("Game completed! Score saved.");
    } catch (error) {
      console.error("Error saving score:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-6 right-6 rounded-full h-12 w-12 hover:bg-red-50 hover:text-red-500"
          onClick={onClose}
        >
          <X className="h-8 w-8" />
        </Button>

        <div className="p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                <Brain className="h-10 w-10 text-primary" />
                Memory Match
              </h2>
              <p className="text-muted-foreground font-medium">Find the matching pairs to exercise your brain.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 px-6 py-3 rounded-2xl text-primary font-black uppercase tracking-widest text-sm">
                Moves: {moves}
              </div>
              <Button onClick={initializeGame} variant="outline" className="rounded-2xl border-2">
                <RefreshCw className="mr-2 h-4 w-4" /> Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
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
                      className={`absolute inset-0 rounded-[24px] flex items-center justify-center text-4xl shadow-inner border-4 ${
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
                      className="absolute inset-0 bg-gradient-to-br from-primary to-indigo-600 rounded-[24px] flex items-center justify-center shadow-lg border-4 border-white"
                    >
                      <Brain className="h-12 w-12 text-white/40" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {isGameOver && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10"
              >
                <Trophy className="h-24 w-24 text-yellow-500 mb-6 animate-bounce" />
                <h3 className="text-5xl font-black tracking-tighter mb-2">Great Work!</h3>
                <p className="text-2xl text-muted-foreground mb-8">You found all pairs in {moves} moves.</p>
                <div className="flex gap-4">
                  <Button onClick={initializeGame} size="lg" className="h-16 px-10 rounded-2xl text-xl font-bold">Play Again</Button>
                  <Button onClick={onClose} variant="outline" size="lg" className="h-16 px-10 rounded-2xl text-xl font-bold border-2">Close</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  );
};

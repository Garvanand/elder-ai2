import { useState, useEffect } from 'react';
import { Memory } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, MessageCircle, X, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

interface MemoryWallProps {
  elderId: string;
  onTriggerConversation: (memory: Memory) => void;
}

export function MemoryWall({ elderId, onTriggerConversation }: MemoryWallProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  useEffect(() => {
    async function fetchMemories() {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .eq('elder_id', elderId)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });

      if (data) setMemories(data as Memory[]);
      setLoading(false);
    }
    fetchMemories();
  }, [elderId]);

    if (loading) return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="aspect-square bg-slate-200/50 rounded-[32px] animate-pulse" />
        ))}
      </div>
    );

    if (memories.length === 0) return (
      <Card className="rounded-[48px] bg-white/60 border-dashed border-primary/20 p-20 text-center shadow-inner">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
          <ImageIcon className="w-12 h-12 text-primary" />
        </div>
        <h3 className="text-3xl font-bold text-foreground mb-4">No Photos Yet</h3>
        <p className="text-xl text-muted-foreground font-medium italic">"Add a memory with a photo to see it here."</p>
      </Card>
    );

    return (
      <div className="space-y-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {memories.map((memory, index) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedMemory(memory)}
              className="relative group"
            >
              <Card className="cursor-pointer overflow-hidden rounded-[40px] border-[6px] border-white shadow-2xl relative z-10">
                <div className="aspect-square relative">
                  <img 
                    src={memory.image_url!} 
                    alt="Memory" 
                    className="w-full h-full object-cover transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedMemory && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative w-full max-w-6xl bg-white rounded-[64px] overflow-hidden shadow-2xl"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-10 top-10 z-10 bg-black/5 hover:bg-black/10 rounded-full h-16 w-16"
                  onClick={() => setSelectedMemory(null)}
                >
                  <X className="w-10 h-10" />
                </Button>

                <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                  <div className="md:w-3/5 bg-slate-50 flex items-center justify-center">
                    <img 
                      src={selectedMemory.image_url!} 
                      className="max-h-full max-w-full object-contain p-8"
                      alt="Memory Large"
                    />
                  </div>
                  <div className="md:w-2/5 p-16 flex flex-col justify-between overflow-y-auto bg-white border-l">
                    <div className="space-y-10">
                      <div>
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                          <ImageIcon className="w-4 h-4" /> {selectedMemory.type}
                        </div>
                        <h2 className="text-5xl font-bold mt-8 text-slate-900 tracking-tight leading-none">
                          Memory Entry
                        </h2>
                        <p className="text-muted-foreground font-bold mt-2">{format(new Date(selectedMemory.created_at), 'MMMM dd, yyyy')}</p>
                      </div>
                      <p className="text-3xl font-bold leading-snug text-slate-800 italic">
                        “{selectedMemory.raw_text}”
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {selectedMemory.tags?.map(tag => (
                          <span key={tag} className="px-5 py-3 bg-slate-100 rounded-2xl text-xs text-slate-600 font-bold uppercase tracking-widest">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-12 space-y-6">
                      <div className="h-px bg-slate-100 w-full" />
                      <Button 
                        className="w-full h-24 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-bold uppercase tracking-widest shadow-xl gap-6 group"
                        onClick={() => {
                          onTriggerConversation(selectedMemory);
                          setSelectedMemory(null);
                        }}
                      >
                        <MessageCircle className="w-10 h-10" />
                        Talk about this
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );

}

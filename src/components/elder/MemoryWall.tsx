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
      <Card className="rounded-[48px] bg-white/20 border-dashed border-white/40 p-20 text-center shadow-inner">
        <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
          <ImageIcon className="w-12 h-12 text-primary animate-pulse" />
        </div>
        <h3 className="text-3xl font-black uppercase tracking-tighter text-foreground mb-4">Archive Empty</h3>
        <p className="text-xl text-muted-foreground font-medium italic">"The canvas of your temporal journey awaits its first stroke."</p>
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
              whileHover={{ scale: 1.05, rotate: 2 }}
              onClick={() => setSelectedMemory(memory)}
              className="relative group"
            >
              <div className="absolute inset-x-0 bottom-[-10px] h-1/2 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <Card className="cursor-pointer overflow-hidden rounded-[40px] border-[6px] border-white shadow-2xl relative z-10">
                <div className="aspect-square relative">
                  <img 
                    src={memory.image_url!} 
                    alt="Memory" 
                    className="w-full h-full object-cover grayscale brightness-90 contrast-125 transition-all duration-700 group-hover:grayscale-0 group-hover:brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-6 inset-x-0 px-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    <p className="text-white text-xs font-black uppercase tracking-widest leading-none drop-shadow-md">
                      {new Date(memory.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {selectedMemory && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="relative w-full max-w-6xl bg-slate-900 border border-white/10 rounded-[64px] overflow-hidden shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)]"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary animate-[shimmer_3s_infinite]" />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-10 top-10 z-10 bg-white/10 hover:bg-white/20 text-white rounded-full h-16 w-16 group"
                  onClick={() => setSelectedMemory(null)}
                >
                  <X className="w-10 h-10 group-hover:rotate-90 transition-transform duration-500" />
                </Button>

                <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                  <div className="md:w-3/5 bg-black flex items-center justify-center relative group">
                    <img 
                      src={selectedMemory.image_url!} 
                      className="max-h-full max-w-full object-contain p-4 group-hover:scale-[1.02] transition-transform duration-1000"
                      alt="Memory Large"
                    />
                    <div className="absolute top-10 left-10 p-4 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Neural Archive 0x{selectedMemory.id.slice(0,4)}</p>
                    </div>
                  </div>
                  <div className="md:w-2/5 p-16 flex flex-col justify-between overflow-y-auto bg-slate-900 border-l border-white/10">
                    <div className="space-y-10">
                      <div>
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-primary/20 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                          <ImageIcon className="w-4 h-4" /> {selectedMemory.type}
                        </div>
                        <h2 className="text-5xl font-black mt-8 text-white tracking-tighter uppercase leading-none">
                          Record Entry
                        </h2>
                        <p className="text-primary/60 font-bold uppercase tracking-widest mt-2">{format(new Date(selectedMemory.created_at), 'MMMM dd, yyyy')}</p>
                      </div>
                      <p className="text-3xl font-bold leading-snug text-white/80 italic">
                        “{selectedMemory.raw_text}”
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {selectedMemory.tags?.map(tag => (
                          <span key={tag} className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white/60 font-black uppercase tracking-widest hover:bg-primary/20 hover:text-white transition-all cursor-default">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-12 space-y-6">
                      <div className="h-px bg-white/10 w-full" />
                      <div className="space-y-4">
                        <Button 
                          className="w-full h-24 rounded-[32px] bg-primary hover:bg-primary/90 text-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 gap-6 group"
                          onClick={() => {
                            onTriggerConversation(selectedMemory);
                            setSelectedMemory(null);
                          }}
                        >
                          <MessageCircle className="w-10 h-10 group-hover:scale-110 transition-transform" />
                          Initiate Recount
                        </Button>
                        <p className="text-center text-xs font-bold text-white/30 uppercase tracking-[0.3em]">Neural Engine Synchronization Required</p>
                      </div>
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

import { useState, useEffect } from 'react';
import { Memory } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, MessageCircle, X, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="aspect-square bg-muted rounded-2xl" />
      ))}
    </div>
  );

  if (memories.length === 0) return (
    <Card className="border-dashed bg-slate-50/50 p-12 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <ImageIcon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-600 mb-2">No photos yet</h3>
      <p className="text-slate-500">Add memories with photos to see them here.</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelectedMemory(memory)}
          >
            <Card className="cursor-pointer overflow-hidden rounded-2xl border-4 border-white shadow-lg group">
              <div className="aspect-square relative">
                <img 
                  src={memory.image_url!} 
                  alt="Memory" 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedMemory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full h-12 w-12"
                onClick={() => setSelectedMemory(null)}
              >
                <X className="w-8 h-8" />
              </Button>

              <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
                <div className="md:w-3/5 bg-slate-900 flex items-center justify-center">
                  <img 
                    src={selectedMemory.image_url!} 
                    className="max-h-full max-w-full object-contain"
                    alt="Memory Large"
                  />
                </div>
                <div className="md:w-2/5 p-8 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                        {selectedMemory.type}
                      </span>
                      <h2 className="text-2xl font-bold mt-4 text-foreground leading-tight">
                        Memory from {new Date(selectedMemory.created_at).toLocaleDateString()}
                      </h2>
                    </div>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                      {selectedMemory.raw_text}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMemory.tags?.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-secondary rounded-full text-sm text-secondary-foreground font-medium">#{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                       <Play className="w-4 h-4 fill-primary text-primary" /> Want to talk about this?
                    </p>
                    <Button 
                      variant="elder" 
                      size="elderLg" 
                      className="w-full gap-3 py-8 text-2xl"
                      onClick={() => {
                        onTriggerConversation(selectedMemory);
                        setSelectedMemory(null);
                      }}
                    >
                      <MessageCircle className="w-8 h-8" />
                      Talk with AI Friend
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

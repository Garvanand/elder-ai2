import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin, Users, Star, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface MemoryItem {
  id: string;
  raw_text: string;
  created_at: string;
  type: string;
  emotional_tone: string;
  structured_json: any;
}

export const MemoryTimeline: React.FC<{ elderId: string; onClose: () => void }> = ({ elderId, onClose }) => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories();
  }, [elderId]);

  const fetchMemories = async () => {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false });

    if (data) setMemories(data as any);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50/95 backdrop-blur-xl z-50 flex flex-col">
      <div className="p-8 flex items-center justify-between border-b bg-white/50">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase">Life Timeline</h2>
          <p className="text-muted-foreground font-medium italic">A journey through your precious moments.</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-14 w-14 border-2"
          onClick={onClose}
        >
          <X className="h-8 w-8" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Clock className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto relative">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary to-primary/20 -translate-x-1/2" />

            <div className="space-y-24">
              {memories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-white border-4 border-primary rounded-full -translate-x-1/2 z-10 shadow-lg" />

                  {/* Date Label */}
                  <div className={`w-full md:w-1/2 flex ${index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'}`}>
                    <div className="bg-primary text-white px-6 py-2 rounded-full font-black text-sm tracking-widest shadow-xl">
                      {format(new Date(memory.created_at), 'MMMM d, yyyy')}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="w-full md:w-1/2 pl-12 md:pl-0">
                    <Card className={`p-8 rounded-[32px] border-2 shadow-2xl hover:shadow-primary/5 transition-all ${
                      memory.emotional_tone === 'happy' ? 'bg-yellow-50/50 border-yellow-200' : 
                      memory.emotional_tone === 'nostalgic' ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white'
                    }`}>
                      <div className="flex items-center gap-2 mb-4">
                        <Star className={`h-5 w-5 ${memory.emotional_tone === 'happy' ? 'text-yellow-500' : 'text-primary'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          {memory.type} Recall
                        </span>
                      </div>
                      <p className="text-2xl font-bold leading-tight mb-6">“{memory.raw_text}”</p>
                      
                      <div className="flex flex-wrap gap-4">
                        {memory.structured_json?.people?.map((p: string) => (
                          <div key={p} className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-lg text-xs font-bold border">
                            <Users className="h-3 w-3 text-primary" /> {p}
                          </div>
                        ))}
                        {memory.structured_json?.locations?.map((l: string) => (
                          <div key={l} className="flex items-center gap-1 bg-white/80 px-3 py-1 rounded-lg text-xs font-bold border">
                            <MapPin className="h-3 w-3 text-rose-500" /> {l}
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

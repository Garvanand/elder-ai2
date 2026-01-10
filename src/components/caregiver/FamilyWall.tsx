import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Image as ImageIcon, Heart, MessageSquare, 
  Send, Plus, X, Loader2, Star, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Memory } from '@/types';

interface FamilyWallProps {
  elderId: string | null;
  memories: Memory[];
  onRefresh: () => void;
}

export default function FamilyWall({ elderId, memories, onRefresh }: FamilyWallProps) {
  const { profile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const familyMemories = memories.filter(m => m.metadata?.source === 'family');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !elderId) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${elderId}/${Math.random()}.${fileExt}`;
      const filePath = `memory-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('memories')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('memories')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success('Photo uploaded!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!elderId || !note.trim()) {
      toast.error('Please add a note');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('memories').insert({
        elder_id: elderId,
        type: 'person',
        raw_text: note,
        image_url: imageUrl || null,
        tags: ['family', 'note'],
        emotional_tone: 'happy',
        metadata: { 
          source: 'family',
          author_name: profile?.full_name || 'Family Member',
          author_id: profile?.id
        },
        structured_json: {}
      });

      if (error) throw error;

      toast.success('Memory shared with your loved one!');
      setNote('');
      setImageUrl('');
      setIsAdding(false);
      onRefresh();
    } catch (error) {
      console.error('Error adding family memory:', error);
      toast.error('Failed to share memory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Family Memory Wall</h2>
          <p className="text-slate-500">Share photos and notes to spark joy and conversation</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="rounded-2xl h-12 px-6 gap-2 bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200"
        >
          <Plus className="w-5 h-5" />
          Add Memory
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-rose-100 shadow-xl rounded-3xl overflow-hidden bg-rose-50/30">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-rose-900">Share a Special Moment</CardTitle>
                  <CardDescription>This will be shown to your loved one by the AI assistant</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)} className="rounded-full">
                  <X className="w-5 h-5 text-rose-400" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-rose-900 uppercase tracking-wider">Your Message</label>
                    <Textarea 
                      placeholder="e.g., Hi Mom! Here's a photo from Sarah's graduation yesterday. We all missed you so much!"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[150px] rounded-2xl border-rose-200 bg-white focus:ring-rose-500 focus:border-rose-500 text-lg p-4"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-rose-900 uppercase tracking-wider">Photo (Optional)</label>
                    <div className="relative aspect-video rounded-2xl border-2 border-dashed border-rose-200 bg-white flex flex-col items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <>
                          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setImageUrl('')}
                            className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          {uploadingImage ? (
                            <Loader2 className="w-10 h-10 text-rose-400 animate-spin mx-auto mb-2" />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-rose-300 mx-auto mb-2" />
                          )}
                          <p className="text-sm text-rose-400 font-medium">Click to upload a photo</p>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={uploadingImage}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl h-12">Cancel</Button>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || !note.trim()}
                    className="rounded-xl h-12 px-8 bg-rose-500 hover:bg-rose-600 gap-2 font-bold"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Share Memory
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyMemories.map((memory, i) => (
          <motion.div
            key={memory.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group border-0 shadow-xl shadow-black/5 rounded-[32px] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500">
              {memory.image_url && (
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={memory.image_url} 
                    alt="" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                </div>
              )}
              <CardContent className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-rose-500" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shared Moment</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase">
                    {format(new Date(memory.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  "{memory.raw_text}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                      {memory.metadata?.author_name?.[0] || 'F'}
                    </div>
                    <span className="text-xs font-semibold text-slate-500">By {memory.metadata?.author_name || 'Family'}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-rose-50 hover:text-rose-500">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-50 hover:text-blue-500">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {familyMemories.length === 0 && !isAdding && (
          <div className="col-span-full p-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <ImageIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Start your Family Wall</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Share photos and stories to help your loved one stay connected with the family's journey.
            </p>
            <Button 
              onClick={() => setIsAdding(true)}
              className="rounded-2xl h-14 px-8 bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-200 gap-2 text-lg font-bold"
            >
              <Plus className="w-6 h-6" />
              Add Your First Memory
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

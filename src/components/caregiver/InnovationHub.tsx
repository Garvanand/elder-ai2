import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Palette, Volume2, Brain, Heart, Play, 
  Plus, Send, History, Star, Lightbulb, Image as ImageIcon,
  Mic, Clock, AlertCircle, CheckCircle2, Wand2, Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { generateImage, uploadGeneratedArt } from '@/lib/hf';
import type { Memory } from '@/types';
import { format } from 'date-fns';

interface InnovationHubProps {
  elderId: string;
  memories: Memory[];
}

export default function InnovationHub({ elderId, memories }: InnovationHubProps) {
  const [activeFeature, setActiveFeature] = useState<'art' | 'voice' | 'trivia' | 'pulse'>('art');
  const [generatingArt, setGeneratingArt] = useState(false);
  const [artHistory, setArtHistory] = useState<any[]>([]);
  const [healthEngagement, setHealthEngagement] = useState<number>(85);
  const [recentMetrics, setRecentMetrics] = useState<any[]>([]);
  
  // Voice Preview State
  const [voiceText, setVoiceText] = useState('');
  const [voiceTone, setVoiceTone] = useState<'warm' | 'joyful' | 'calm' | 'professional'>('warm');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Trivia State
  const [triviaQuestion, setTriviaQuestion] = useState('');
  const [triviaAnswer, setTriviaAnswer] = useState('');
  const [savingTrivia, setSavingTrivia] = useState(false);
  const [triviaList, setTriviaList] = useState<any[]>([]);

  useEffect(() => {
    fetchInnovationData();
  }, [elderId]);

  const fetchInnovationData = async () => {
    try {
      // Fetch Art History
      const { data: artData } = await supabase
        .from('memories')
        .select('*')
        .eq('elder_id', elderId)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false });
      
      if (artData) setArtHistory(artData);

      // Fetch Trivia/Memory Anchors
      const { data: triviaData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', elderId)
        .eq('action', 'memory_anchor')
        .order('created_at', { ascending: false });
      
      if (triviaData) setTriviaList(triviaData.map(d => d.metadata));

      // Fetch real wellbeing pulse data
      const { data: metrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('elder_id', elderId)
        .order('recorded_at', { ascending: false })
        .limit(20);
      
      if (metrics && metrics.length > 0) {
        setRecentMetrics(metrics);
        const avg = metrics.reduce((acc, m) => acc + (m.value || 0), 0) / metrics.length;
        setHealthEngagement(Math.min(Math.round(avg), 100));
      }
    } catch (err) {
      console.error('Error fetching innovation data:', err);
    }
  };

  const generateArtFromStory = async (story: string) => {
    if (!story) return;
    setGeneratingArt(true);
    try {
      const blobUrl = await generateImage(story);
      const publicUrl = await uploadGeneratedArt(blobUrl, elderId);
      
      const { data: updatedMemory, error } = await supabase
        .from('memories')
        .insert({
          elder_id: elderId,
          raw_text: `AI Artistic Visualization of: ${story.substring(0, 100)}...`,
          image_url: publicUrl,
          type: 'experience',
          emotional_tone: 'joyful',
          tags: ['ai-art', 'visualization']
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('AI Memory Visualization Created & Saved!');
      setArtHistory(prev => [updatedMemory, ...prev]);
    } catch (err: any) {
      console.error('Art generation error:', err);
      toast.error('Could not generate art: ' + (err.message || 'Unknown error'));
    } finally {
      setGeneratingArt(false);
    }
  };

  const handlePreviewVoice = () => {
    if (!voiceText.trim()) return;
    setIsPlayingPreview(true);
    
    // Simulate TTS
    const utterance = new SpeechSynthesisUtterance(voiceText);
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find a warm/female voice for elder care vibe
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Female'));
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.pitch = voiceTone === 'warm' ? 1.1 : voiceTone === 'joyful' ? 1.3 : 0.9;
    utterance.rate = 0.9; // Slightly slower for elderly clarity
    
    utterance.onend = () => setIsPlayingPreview(false);
    window.speechSynthesis.speak(utterance);
    toast.info(`Previewing in ${voiceTone} tone...`);
  };

  const saveMemoryAnchor = async () => {
    if (!triviaQuestion || !triviaAnswer) return;
    setSavingTrivia(true);
    try {
      const { error } = await supabase.from('activity_logs').insert({
        user_id: elderId,
        action: 'memory_anchor',
        entity_type: 'trivia',
        metadata: { question: triviaQuestion, answer: triviaAnswer, created_at: new Date().toISOString() }
      });

      if (error) throw error;
      
      setTriviaList(prev => [{ question: triviaQuestion, answer: triviaAnswer, created_at: new Date().toISOString() }, ...prev]);
      setTriviaQuestion('');
      setTriviaAnswer('');
      toast.success('Memory Anchor Saved! AI will use this in conversation.');
    } catch (err) {
      toast.error('Failed to save memory anchor');
    } finally {
      setSavingTrivia(false);
    }
  };

  const latestStory = memories.find(m => m.type === 'story' || m.type === 'other')?.raw_text;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
            Family Innovation Lab
          </h2>
          <p className="text-slate-500">Exciting ways to connect and stimulate your loved one's mind</p>
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner w-full md:w-auto overflow-x-auto">
          {[
            { id: 'art', label: 'AI Art', icon: Palette },
            { id: 'voice', label: 'Voice Lab', icon: Volume2 },
            { id: 'trivia', label: 'Memory Anchors', icon: Brain },
            { id: 'pulse', label: 'Wellbeing Pulse', icon: Activity }
          ].map((feat) => (
            <button
              key={feat.id}
              onClick={() => setActiveFeature(feat.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeFeature === feat.id 
                  ? "bg-white text-primary shadow-md translate-y-[-1px]" 
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <feat.icon className="w-4 h-4" />
              {feat.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeFeature === 'art' && (
          <motion.div
            key="art"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50/50 to-white overflow-hidden group">
              <CardHeader>
                <div className="flex items-center gap-3 text-indigo-600 mb-2">
                  <Palette className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Story Visualizer</span>
                </div>
                <CardTitle className="text-2xl font-bold">Turn Stories into Art</CardTitle>
                <CardDescription>Use AI to generate beautiful illustrations from your loved one's memories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-6 rounded-2xl bg-white border border-indigo-100 shadow-sm relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400" />
                   <h4 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-tighter">Latest Shared Story</h4>
                   <p className="text-lg text-slate-700 leading-relaxed italic mb-6">
                     {latestStory ? `"${latestStory.substring(0, 150)}..."` : "No stories shared recently to visualize."}
                   </p>
                   <Button 
                    onClick={() => generateArtFromStory(latestStory || '')}
                    disabled={!latestStory || generatingArt}
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 group"
                   >
                     {generatingArt ? (
                       <div className="flex items-center gap-2">
                         <Wand2 className="w-5 h-5 animate-spin" />
                         Imagining Scene...
                       </div>
                     ) : (
                       <div className="flex items-center gap-2">
                         <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                         Generate Artistic Vision
                       </div>
                     )}
                   </Button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <Info className="w-4 h-4 text-indigo-400" />
                  This helps the elder reconnect with their memories visually, which is proven to stimulate cognitive function.
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
                <div>
                  <CardTitle className="text-xl">Art Gallery</CardTitle>
                  <CardDescription>Previously generated memory art</CardDescription>
                </div>
                <History className="w-5 h-5 text-slate-300" />
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-2 gap-px bg-slate-100 h-[400px] overflow-y-auto">
                  {artHistory.length > 0 ? artHistory.map((art) => (
                    <motion.div 
                      key={art.id}
                      whileHover={{ scale: 1.02 }}
                      className="relative aspect-square bg-slate-200 group cursor-zoom-in"
                    >
                      <img src={art.image_url} alt="Memory Art" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                        <p className="text-white text-[10px] leading-tight line-clamp-2 italic font-medium">
                          {art.raw_text}
                        </p>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="col-span-2 flex flex-col items-center justify-center p-12 text-center text-slate-400">
                      <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                      <p>Generate your first piece of memory art to see it here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeFeature === 'voice' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50/50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 text-emerald-600 mb-2">
                  <Volume2 className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Voice Synthesis Lab</span>
                </div>
                <CardTitle className="text-2xl font-bold">Warm Voice Messages</CardTitle>
                <CardDescription>Preview how your text will sound to your loved one</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-500 uppercase">Your Message</label>
                  <Textarea 
                    placeholder="Enter a message to preview... e.g. 'I'm so proud of you today!'"
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    className="min-h-[120px] rounded-2xl border-emerald-100 bg-white shadow-sm text-lg focus:ring-emerald-500/20"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-500 uppercase">Select Emotional Tone</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'warm', label: 'Warm', color: 'bg-amber-100 text-amber-700' },
                      { id: 'joyful', label: 'Joyful', color: 'bg-emerald-100 text-emerald-700' },
                      { id: 'calm', label: 'Calm', color: 'bg-blue-100 text-blue-700' },
                      { id: 'professional', label: 'Caring', color: 'bg-indigo-100 text-indigo-700' }
                    ].map(tone => (
                      <button
                        key={tone.id}
                        onClick={() => setVoiceTone(tone.id as any)}
                        className={cn(
                          "px-3 py-3 rounded-xl text-xs font-bold transition-all border",
                          voiceTone === tone.id 
                            ? `${tone.color} border-current shadow-sm scale-105` 
                            : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-white"
                        )}
                      >
                        {tone.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handlePreviewVoice}
                    disabled={!voiceText.trim() || isPlayingPreview}
                    className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                  >
                    {isPlayingPreview ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white rounded-full" />
                          <motion.div animate={{ height: [12, 4, 12] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-white rounded-full" />
                          <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-white rounded-full" />
                        </div>
                        Playing Preview...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5 fill-current" />
                        Preview Audio
                      </div>
                    )}
                  </Button>
                  <Button variant="outline" className="h-14 w-14 rounded-2xl border-emerald-100 text-emerald-600">
                    <Mic className="w-6 h-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-white p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Star className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Why Use Voice?</h4>
                    <p className="text-sm text-slate-500 leading-snug">The sound of a familiar voice is one of the strongest triggers for emotional stability and memory retention.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                   <p className="text-xs font-bold text-slate-400 uppercase">Tip for success</p>
                   <ul className="space-y-2">
                     {['Keep sentences short and positive', 'Use their nickname', 'Remind them of a specific event'].map(tip => (
                       <li key={tip} className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                         <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {tip}
                       </li>
                     ))}
                   </ul>
                </div>
              </Card>
              
              <Card className="border-0 shadow-lg bg-emerald-900 text-white p-6 relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-lg font-bold mb-2">Voice Cloning Feature</h4>
                <p className="text-emerald-100 text-sm mb-4">Our Premium AI can clone your actual voice to read messages. Contact support to set up your voice profile.</p>
                <Button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold">Learn More</Button>
              </Card>
            </div>
          </motion.div>
        )}

        {activeFeature === 'trivia' && (
          <motion.div
            key="trivia"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50/50 to-white">
              <CardHeader>
                <div className="flex items-center gap-3 text-amber-600 mb-2">
                  <Brain className="w-6 h-6" />
                  <span className="text-xs font-bold uppercase tracking-widest">Memory Anchor Builder</span>
                </div>
                <CardTitle className="text-2xl font-bold">Interactive Trivia</CardTitle>
                <CardDescription>Create personalized memory prompts that the AI will use to challenge your loved one</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">The Question</label>
                    <Input 
                      placeholder="e.g. What is your grandson's favorite color?"
                      value={triviaQuestion}
                      onChange={(e) => setTriviaQuestion(e.target.value)}
                      className="h-12 rounded-xl border-amber-100 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase">The Correct Answer</label>
                    <Input 
                      placeholder="e.g. He loves Blue, like the ocean."
                      value={triviaAnswer}
                      onChange={(e) => setTriviaAnswer(e.target.value)}
                      className="h-12 rounded-xl border-amber-100 focus:ring-amber-500/20"
                    />
                  </div>
                  <Button 
                    onClick={saveMemoryAnchor}
                    disabled={savingTrivia || !triviaQuestion || !triviaAnswer}
                    className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-100"
                  >
                    {savingTrivia ? 'Saving...' : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add to AI Trivia Bank
                      </div>
                    )}
                  </Button>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                  <Lightbulb className="w-8 h-8 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-800 uppercase mb-1">How it works</p>
                    <p className="text-sm text-amber-700 font-medium leading-snug">The AI assistant will weave these questions naturally into conversation to help with cognitive recall.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-white flex flex-col">
              <CardHeader className="border-b border-slate-50">
                <CardTitle className="text-xl">Trivia Inventory</CardTitle>
                <CardDescription>Active memory anchors in the AI's mind</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <div className="divide-y divide-slate-50 h-[400px] overflow-y-auto">
                  {triviaList.length > 0 ? triviaList.map((item, idx) => (
                    <div key={idx} className="p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h5 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Q: {item.question}</h5>
                          <p className="text-sm text-slate-500 font-medium">A: {item.answer}</p>
                        </div>
                        <div className="text-[10px] text-slate-300 font-bold uppercase shrink-0">
                          {item.created_at ? format(new Date(item.created_at), 'MMM d') : 'Recent'}
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                      <Brain className="w-12 h-12 mb-4 opacity-20" />
                      <p>Your trivia bank is empty. Add a question to help stimulate your loved one's memory!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeFeature === 'pulse' && (
          <motion.div
            key="pulse"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid lg:grid-cols-2 gap-6"
          >
             <Card className="border-0 shadow-xl bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8">
                  <Activity className="w-20 h-20 text-emerald-500/10 animate-pulse" />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 text-emerald-400 mb-2">
                    <Activity className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-widest">Live Bio-Feed</span>
                  </div>
                    <CardTitle className="text-2xl font-bold">Wellbeing Pulse</CardTitle>
                    <CardDescription className="text-slate-400">
                      {recentMetrics.length > 0 ? `Based on last ${recentMetrics.length} health data points` : "Real-time status of activity and engagement"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 pb-12">
                     <div className="flex items-end gap-1 h-32 px-4">
                       {(recentMetrics.length > 0 ? recentMetrics : [...Array(20)]).map((m, i) => (
                         <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: recentMetrics.length > 0 ? `${(m.value / 150) * 100}%` : [20, 40, 80, 30, 60][i % 5] + Math.random() * 20 }}
                          transition={{ repeat: recentMetrics.length > 0 ? 0 : Infinity, duration: 1, delay: i * 0.05 }}
                          className={cn(
                            "flex-1 rounded-full opacity-80",
                            recentMetrics.length > 0 ? "bg-primary" : "bg-gradient-to-t from-emerald-600 to-emerald-400"
                          )}
                         />
                       ))}
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Engagement Score</p>
                          <p className="text-2xl font-bold text-emerald-400">{healthEngagement}%</p>
                          <p className="text-xs text-slate-400">{healthEngagement > 70 ? 'Optimal Activity' : 'Low Interaction'}</p>
                       </div>
                       <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Last Sync</p>
                          <p className="text-2xl font-bold text-blue-400">
                            {recentMetrics.length > 0 ? format(new Date(recentMetrics[0].recorded_at), 'HH:mm') : 'Stable'}
                          </p>
                          <p className="text-xs text-slate-400">Protocol v2.4.0 active</p>
                       </div>
                     </div>

                </CardContent>
             </Card>

             <div className="space-y-6">
                <Card className="border-0 shadow-xl bg-white p-6">
                   <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <Clock className="w-5 h-5 text-indigo-500" />
                     Typical Daily Rhythm
                   </h4>
                   <div className="space-y-4">
                     {[
                       { time: '08:00 AM', label: 'Morning Greeting', status: 'Done', color: 'bg-emerald-100 text-emerald-700' },
                       { time: '12:30 PM', label: 'Lunch & Conversation', status: 'Active', color: 'bg-indigo-100 text-indigo-700' },
                       { time: '04:00 PM', label: 'Afternoon Memory Session', status: 'Pending', color: 'bg-slate-100 text-slate-500' },
                       { time: '08:00 PM', label: 'Evening Review', status: 'Pending', color: 'bg-slate-100 text-slate-500' }
                     ].map((step, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:border-slate-100 transition-colors">
                         <div className="flex items-center gap-3">
                           <span className="text-xs font-bold text-slate-400 w-16">{step.time}</span>
                           <span className="text-sm font-bold text-slate-700">{step.label}</span>
                         </div>
                         <span className={cn("px-2 py-1 rounded-lg text-[10px] font-bold uppercase", step.color)}>
                           {step.status}
                         </span>
                       </div>
                     ))}
                   </div>
                </Card>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl flex items-center justify-between group">
                  <div>
                    <h4 className="font-bold text-lg mb-1">Real-time GPS</h4>
                    <p className="text-indigo-100 text-xs">Currently: At Home (Safe Zone)</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                     <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

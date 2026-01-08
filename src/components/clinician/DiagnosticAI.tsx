import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, MessageSquare, Shield, Activity, Search, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const DiagnosticAI = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleAnalyze = () => {
    if (!query) return;
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setResults({
        diagnosis: "Progressive gait asymmetry detected.",
        confidence: 0.82,
        observations: [
          "12% reduction in stride length over 14 days",
          "Increased vocal tremor during morning check-ins",
          "Sleep latency increased by 45 minutes"
        ],
        recommendations: [
          "Schedule neurological screening",
          "Adjust physical therapy intensity",
          "Review medication adherence"
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[32px] overflow-hidden text-white h-full border-dashed">
      <CardHeader className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-xl font-black uppercase tracking-tighter italic">
              Diagnostic <span className="text-purple-400">Assistant</span>
            </CardTitle>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Neural Pattern Recognition v4.2</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="relative">
          <Input 
            placeholder="Ask about patient PX-100..." 
            className="bg-white/5 border-white/10 h-14 pl-6 pr-16 rounded-2xl text-white placeholder:text-slate-600 focus:ring-purple-400/50"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
          />
          <Button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-purple-500 hover:bg-purple-400 text-white"
          >
            {isAnalyzing ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>

        <div className="min-h-[200px] flex flex-col justify-center border border-white/5 rounded-3xl p-6 bg-black/20">
          <AnimatePresence mode="wait">
            {!results && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-4"
              >
                <MessageSquare className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Awaiting telemetry input...</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex gap-2 justify-center">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_#a855f7]"
                    />
                  ))}
                </div>
                <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-purple-400 animate-pulse">Synthesizing Neural Data...</p>
              </motion.div>
            )}

            {results && !isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-start">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-black uppercase tracking-widest text-[9px]">DIAGNOSIS FOUND</Badge>
                  <span className="text-[10px] font-black text-slate-500">CONFIDENCE: {(results.confidence * 100).toFixed(0)}%</span>
                </div>
                
                <h4 className="text-xl font-bold tracking-tight text-purple-100">{results.diagnosis}</h4>
                
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Observations</p>
                  <ul className="space-y-2">
                    {results.observations.map((obs: string, i: number) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-purple-500 rounded-full" />
                        {obs}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button className="w-full bg-purple-500 hover:bg-purple-400 text-white font-black uppercase tracking-widest rounded-xl h-12">
                    Initialize Protocol
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

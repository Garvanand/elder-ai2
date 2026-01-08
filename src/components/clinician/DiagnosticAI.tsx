import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, Zap, Activity, AlertCircle, ChevronRight, 
  MessageSquare, Sparkles, Terminal, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const DiagnosticAI = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState('');

  const insights = [
    {
      title: "Gait Asymmetry Detected",
      description: "Left stride length decreased 12% in last 48 hours. Correlation with increased pain markers.",
      confidence: 0.92,
      type: "mobility"
    },
    {
      title: "Vocal Tremor Signature",
      description: "Early frequency variations detected in pitch stability. Recommended PD screening.",
      confidence: 0.78,
      type: "neurological"
    }
  ];

  return (
    <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl h-full flex flex-col">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-cyan-400/5">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-black uppercase tracking-widest">Neural Diagnostic Engine</h3>
        </div>
        <Badge className="bg-cyan-400 text-black font-black">v2.4.0-CORE</Badge>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-white/5 border border-white/5 rounded-2xl group hover:border-cyan-400/30 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <h4 className="font-bold text-white text-sm">{insight.title}</h4>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed mb-4">{insight.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-[9px] border-white/10 text-slate-500 uppercase font-bold">{insight.type}</Badge>
                <Badge variant="outline" className="text-[9px] border-cyan-400/20 text-cyan-400 uppercase font-bold">Conf: {Math.round(insight.confidence * 100)}%</Badge>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </div>
          </motion.div>
        ))}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest animate-pulse">Processing Multi-Modal Data...</p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/5 border-t border-white/5">
        <div className="relative">
          <Input 
            placeholder="Ask Diagnostic AI..." 
            className="bg-white/5 border-white/10 pl-4 pr-12 h-12 rounded-xl text-white placeholder:text-slate-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button 
            size="icon" 
            className="absolute right-1 top-1 h-10 w-10 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg"
            onClick={() => setIsAnalyzing(true)}
          >
            <Zap className="w-4 h-4 fill-current" />
          </Button>
        </div>
        <p className="text-[8px] text-slate-600 mt-3 text-center uppercase font-bold tracking-widest">Powered by Gemini 1.5 Pro • Clinical Inference Mode</p>
      </div>
    </div>
  );
};

const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn("flex w-full px-3 py-2 text-sm outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />
);

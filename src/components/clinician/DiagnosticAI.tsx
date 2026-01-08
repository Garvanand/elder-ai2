import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { HolographicCard } from '../ui/HolographicCard';
import { Button } from '@/components/ui/button';

export const DiagnosticAI = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<any>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Mocking AI Analysis
    setTimeout(() => {
      setDiagnosis({
        cause: "Medication side effect (beta blocker)",
        confidence: 0.68,
        recommendations: [
          "Review dosage with pharmacist",
          "Schedule orthopedic consultation"
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <HolographicCard className="space-y-4">
      <div className="flex items-center gap-2 text-purple-400">
        <Brain className="h-6 w-6" />
        <h3 className="text-lg font-bold">AI Diagnostic Assistant</h3>
      </div>
      
      <div className="relative">
        <textarea
          placeholder="Ask about patient health patterns..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 min-h-[100px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button 
          onClick={handleAnalyze}
          disabled={!query || isAnalyzing}
          className="absolute bottom-4 right-4 bg-purple-500 hover:bg-purple-600 h-8 text-xs"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </Button>
      </div>

      {diagnosis && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-bold">Primary Insight</span>
          </div>
          <p className="text-sm font-medium mb-4">{diagnosis.cause}</p>
          <div className="space-y-2">
            {diagnosis.recommendations.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-white/60">
                <AlertCircle className="h-3 w-3 mt-0.5 text-purple-400" />
                {rec}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </HolographicCard>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
    <Card className="p-6 space-y-4 border-border shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        <Brain className="h-6 w-6" />
        <h3 className="text-lg font-bold">AI Diagnostic Assistant</h3>
      </div>
      
      <div className="relative">
        <textarea
          placeholder="Ask about patient health patterns..."
          className="w-full bg-white border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button 
          onClick={handleAnalyze}
          disabled={!query || isAnalyzing}
          className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90 h-8 text-xs text-white"
        >
          {isAnalyzing ? "Analyzing..." : "Analyze"}
        </Button>
      </div>

      {diagnosis && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">Primary Insight</span>
          </div>
          <p className="text-sm font-medium mb-4 text-foreground">{diagnosis.cause}</p>
          <div className="space-y-2">
            {diagnosis.recommendations.map((rec: string, i: number) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 mt-0.5 text-primary" />
                {rec}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  );
};

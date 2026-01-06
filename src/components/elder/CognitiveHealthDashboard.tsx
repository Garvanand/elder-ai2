import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, Activity, Zap, Heart, MessageSquare, X, RefreshCw, Info, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { performCognitiveAssessment, saveCognitiveScore, getCognitiveHistory, CognitiveMetrics } from '@/lib/cognitive-analyzer';
import { useDemo } from '@/contexts/DemoContext';

interface CognitiveHealthDashboardProps {
  elderId: string;
  elderName: string;
  onClose: () => void;
}

const metricLabels: Record<string, { label: string; icon: React.ElementType; description: string }> = {
  vocabularyRichness: { 
    label: 'Vocabulary', 
    icon: MessageSquare,
    description: 'Variety of words used in conversations'
  },
  sentenceComplexity: { 
    label: 'Expression', 
    icon: Zap,
    description: 'Complexity of sentence structures'
  },
  topicCoherence: { 
    label: 'Coherence', 
    icon: Brain,
    description: 'Ability to stay on topic'
  },
  emotionalStability: { 
    label: 'Emotional Balance', 
    icon: Heart,
    description: 'Consistency of mood and emotions'
  },
  memoryRecallAccuracy: { 
    label: 'Memory Recall', 
    icon: Activity,
    description: 'Frequency of memory sharing'
  }
};

const trendConfig = {
  improving: { color: 'text-green-600', bg: 'bg-green-100', icon: TrendingUp, label: 'Improving' },
  stable: { color: 'text-blue-600', bg: 'bg-blue-100', icon: Minus, label: 'Stable' },
  declining: { color: 'text-amber-600', bg: 'bg-amber-100', icon: TrendingDown, label: 'Slight Decline' },
  rapid_decline: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertTriangle, label: 'Needs Attention' }
};

export function CognitiveHealthDashboard({ elderId, elderName, onClose }: CognitiveHealthDashboardProps) {
  const { isGuestMode } = useDemo();
  const [metrics, setMetrics] = useState<CognitiveMetrics | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    if (isGuestMode) {
      setMetrics({
        vocabularyRichness: 0.72,
        sentenceComplexity: 0.65,
        topicCoherence: 0.78,
        responseTimeAvg: 4500,
        emotionalStability: 0.81,
        memoryRecallAccuracy: 0.69,
        overallScore: 0.73,
        trendDirection: 'stable'
      });
      setHistory([
        { assessment_date: '2026-01-01', overall_cognitive_score: 0.71 },
        { assessment_date: '2026-01-02', overall_cognitive_score: 0.72 },
        { assessment_date: '2026-01-03', overall_cognitive_score: 0.70 },
        { assessment_date: '2026-01-04', overall_cognitive_score: 0.74 },
        { assessment_date: '2026-01-05', overall_cognitive_score: 0.73 },
        { assessment_date: '2026-01-06', overall_cognitive_score: 0.73 }
      ]);
      setLoading(false);
      return;
    }

    loadData();
  }, [elderId, isGuestMode]);

  const loadData = async () => {
    setLoading(true);
    const [metricsResult, historyResult] = await Promise.all([
      performCognitiveAssessment(elderId),
      getCognitiveHistory(elderId, 30)
    ]);
    
    if (metricsResult) {
      setMetrics(metricsResult);
      await saveCognitiveScore(elderId, metricsResult);
    }
    setHistory(historyResult);
    setLoading(false);
  };

  const runNewAssessment = async () => {
    setAnalyzing(true);
    const result = await performCognitiveAssessment(elderId);
    if (result) {
      setMetrics(result);
      await saveCognitiveScore(elderId, result);
      const newHistory = await getCognitiveHistory(elderId, 30);
      setHistory(newHistory);
    }
    setAnalyzing(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600';
    if (score >= 0.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 0.7) return 'from-green-400 to-emerald-500';
    if (score >= 0.5) return 'from-amber-400 to-orange-500';
    return 'from-red-400 to-rose-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
    >
      <Card className="w-full max-w-3xl my-4 rounded-[40px] bg-gradient-to-b from-indigo-50 to-violet-50 border-2 border-indigo-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Cognitive Health</h2>
                <p className="text-indigo-100 text-sm">{elderName}'s brain wellness report</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-xl text-indigo-600 font-medium">Analyzing cognitive patterns...</p>
          </div>
        ) : !metrics ? (
          <div className="p-12 text-center">
            <Brain className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Not Enough Data Yet</h3>
            <p className="text-gray-500 mb-4">We need more conversations and memories to analyze cognitive health.</p>
            <p className="text-sm text-indigo-500">Keep sharing memories and stories to enable this feature!</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                  getScoreGradient(metrics.overallScore)
                )}>
                  <span className="text-3xl font-bold text-white">
                    {Math.round(metrics.overallScore * 100)}
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">Overall Score</p>
                  <div className={cn("flex items-center gap-2 mt-1", trendConfig[metrics.trendDirection].color)}>
                    {React.createElement(trendConfig[metrics.trendDirection].icon, { className: "w-5 h-5" })}
                    <span className="font-medium">{trendConfig[metrics.trendDirection].label}</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={runNewAssessment}
                disabled={analyzing}
                className="rounded-full bg-indigo-500 hover:bg-indigo-600"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", analyzing && "animate-spin")} />
                {analyzing ? 'Analyzing...' : 'Refresh'}
              </Button>
            </div>

            {metrics.trendDirection === 'rapid_decline' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3"
              >
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Attention Recommended</p>
                  <p className="text-sm text-red-600">
                    We've noticed some changes in cognitive patterns. Consider scheduling a consultation with a healthcare provider.
                  </p>
                </div>
              </motion.div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(metricLabels).map(([key, config]) => {
                const value = metrics[key as keyof CognitiveMetrics] as number;
                const Icon = config.icon;
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMetric(selectedMetric === key ? null : key)}
                    className={cn(
                      "p-4 rounded-2xl text-left transition-all border-2",
                      selectedMetric === key 
                        ? 'bg-white border-indigo-400 shadow-lg' 
                        : 'bg-white/60 border-transparent hover:border-indigo-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          value >= 0.7 ? 'bg-green-100 text-green-600' :
                          value >= 0.5 ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-800">{config.label}</span>
                      </div>
                      <span className={cn("text-2xl font-bold", getScoreColor(value))}>
                        {Math.round(value * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full bg-gradient-to-r", getScoreGradient(value))}
                      />
                    </div>
                    <AnimatePresence>
                      {selectedMetric === key && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-gray-500 mt-3"
                        >
                          {config.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {history.length > 1 && (
              <div className="bg-white/60 rounded-2xl p-4">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  30-Day Trend
                </h3>
                <div className="h-32 flex items-end justify-between gap-1">
                  {history.slice(-14).map((day, i) => {
                    const score = Number(day.overall_cognitive_score);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${score * 100}%` }}
                          transition={{ duration: 0.5, delay: i * 0.05 }}
                          className={cn(
                            "w-full rounded-t-lg bg-gradient-to-t",
                            getScoreGradient(score)
                          )}
                        />
                        <span className="text-xs text-gray-400">
                          {new Date(day.assessment_date).getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-2xl">
              <Info className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-700">
                <p className="font-medium mb-1">How This Works</p>
                <p>
                  We analyze conversation patterns, vocabulary usage, and emotional expression 
                  to track cognitive wellness over time. This is not a medical diagnosis—always 
                  consult healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

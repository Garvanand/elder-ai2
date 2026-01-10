import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Brain, Heart, Zap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Memory, BehavioralSignal } from '@/types';
import { cn } from '@/lib/utils';

interface WellnessScoreProps {
  memories: Memory[];
  signals: BehavioralSignal[];
}

export default function WellnessScore({ memories, signals }: WellnessScoreProps) {
  const score = useMemo(() => {
    let baseScore = 75; // Start with a decent base score

    // Impact of emotional tone in memories
    const happyMemories = memories.filter(m => m.emotional_tone === 'happy' || m.emotional_tone === 'positive').length;
    const sadMemories = memories.filter(m => m.emotional_tone === 'sad' || m.emotional_tone === 'anxious').length;
    
    baseScore += happyMemories * 2;
    baseScore -= sadMemories * 3;

    // Impact of signals (alerts)
    const highSeveritySignals = signals.filter(s => s.severity === 'high').length;
    const mediumSeveritySignals = signals.filter(s => s.severity === 'medium').length;
    
    baseScore -= highSeveritySignals * 10;
    baseScore -= mediumSeveritySignals * 5;

    // Cap the score
    return Math.max(0, Math.min(100, baseScore));
  }, [memories, signals]);

  const metrics = useMemo(() => {
    const memoryCount = memories.length;
    const signalCount = signals.length;
    const happyRatio = memories.length > 0 ? (memories.filter(m => m.emotional_tone === 'happy').length / memories.length) * 100 : 0;
    
    return [
      { 
        label: 'Cognitive Engagement', 
        value: Math.min(100, memoryCount * 5), 
        icon: Brain, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50',
        trend: memoryCount > 5 ? 'up' : 'stable'
      },
      { 
        label: 'Emotional Balance', 
        value: happyRatio, 
        icon: Heart, 
        color: 'text-rose-500', 
        bg: 'bg-rose-50',
        trend: happyRatio > 60 ? 'up' : happyRatio < 40 ? 'down' : 'stable'
      },
      { 
        label: 'Vitality Index', 
        value: Math.max(0, 100 - (signalCount * 15)), 
        icon: Zap, 
        color: 'text-amber-500', 
        bg: 'bg-amber-50',
        trend: signalCount === 0 ? 'up' : 'down'
      },
      { 
        label: 'Stability', 
        value: Math.max(0, 100 - (signals.filter(s => s.severity === 'high').length * 25)), 
        icon: Activity, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50',
        trend: 'stable'
      }
    ];
  }, [memories, signals]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-blue-500';
    if (s >= 40) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border-0 shadow-xl shadow-black/5 bg-white rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold">Overall Wellness</CardTitle>
          <CardDescription>Daily well-being index</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-100"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={552.92}
                initial={{ strokeDashoffset: 552.92 }}
                animate={{ strokeDashoffset: 552.92 - (552.92 * score) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={cn("transition-colors duration-500", getScoreColor(score))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-5xl font-black", getScoreColor(score))}>{score}</span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Score</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <span className={cn("px-4 py-1.5 rounded-full text-sm font-bold", getScoreColor(score).replace('text-', 'bg-').replace('500', '100'))}>
              {getScoreLabel(score)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 border-0 shadow-xl shadow-black/5 bg-white rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Wellness Metrics
          </CardTitle>
          <CardDescription>Breakdown of cognitive and emotional health</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", metric.bg)}>
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                </div>
                {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                {metric.trend === 'down' && <TrendingDown className="w-4 h-4 text-rose-500" />}
                {metric.trend === 'stable' && <Minus className="w-4 h-4 text-slate-400" />}
              </div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{metric.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-slate-900">{Math.round(metric.value)}%</span>
                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.value}%` }}
                    className={cn("h-full", metric.color.replace('text-', 'bg-'))}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

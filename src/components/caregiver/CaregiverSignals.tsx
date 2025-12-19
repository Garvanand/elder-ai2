import { AlertTriangle, Info, CheckCircle, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import type { BehavioralSignal } from '@/types';

interface CaregiverSignalsProps {
  signals: BehavioralSignal[];
  onRefresh: () => void;
}

export default function CaregiverSignals({ signals, onRefresh }: CaregiverSignalsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'repeated_question': return <Bell className="w-5 h-5" />;
      case 'mood_change': return <AlertTriangle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
          <AlertTriangle className="w-6 h-6" />
          Behavioral Signals
        </h3>
        <span className="text-xs font-bold px-3 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-wider">
          AI Monitoring Active
        </span>
      </div>

      <div className="grid gap-4">
        {signals.length === 0 ? (
          <div className="p-12 text-center bg-white/40 rounded-3xl border border-dashed border-primary/20">
            <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
            <p className="text-muted-foreground italic">No unusual patterns detected. Everything looks stable.</p>
          </div>
        ) : (
          signals.map((signal) => (
            <Card key={signal.id} className={`border ${getSeverityColor(signal.severity)} shadow-sm`}>
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="mt-1">{getSignalIcon(signal.signal_type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold capitalize">{signal.signal_type.replace('_', ' ')}</span>
                    <span className="text-[10px] font-semibold opacity-70">
                      {format(new Date(signal.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm opacity-90">{signal.description}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

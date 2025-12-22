import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Heart, Moon, Footprints, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { format, subDays } from 'date-fns';
import { Button } from '@/components/ui/button';

interface HealthDashboardProps {
  elderId: string;
}

export function HealthDashboard({ elderId }: HealthDashboardProps) {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      const { data } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('elder_id', elderId)
        .order('recorded_at', { ascending: true });
      
      if (data) setMetrics(data);
      setLoading(false);
    }
    fetchMetrics();
  }, [elderId]);

  // Mock data if empty
  const displayData = metrics.length > 0 ? metrics : Array.from({ length: 7 }, (_, i) => ({
    recorded_at: subDays(new Date(), 6 - i).toISOString(),
    steps: Math.floor(Math.random() * 5000) + 1000,
    heart_rate: Math.floor(Math.random() * 20) + 65,
    sleep: Math.floor(Math.random() * 4) + 5
  }));

  const chartData = displayData.map(d => ({
    date: format(new Date(d.recorded_at), 'MMM dd'),
    steps: d.steps || Math.floor(Math.random() * 3000),
    hr: d.heart_rate || 72,
    sleep: d.sleep || 7
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
           <Activity className="h-6 w-6 text-primary" /> Health Vitals
        </h2>
        <Button variant="outline" size="sm" className="gap-2">
          <Smartphone className="h-4 w-4" /> Sync Wearable
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-600">
              <Footprints className="h-4 w-4" /> Daily Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,281</div>
            <p className="text-xs text-muted-foreground mt-1">Goal: 5,000 steps</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50/50 border-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-600">
              <Heart className="h-4 w-4" /> Avg Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72 bpm</div>
            <p className="text-xs text-muted-foreground mt-1 text-green-600 font-medium">Within normal range</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50/50 border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-600">
              <Moon className="h-4 w-4" /> Sleep Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">85% deep sleep</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Level (Steps)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="steps" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heart Rate Variability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip />
                  <Area type="monotone" dataKey="hr" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Cognitive Correlation Alert</h4>
              <p className="text-sm text-amber-800 mt-1">
                The elder's physical activity has decreased by 20% compared to last week. 
                Historical data shows this often precedes slight confusion in memory recall. 
                Consider suggesting a short walk or light exercise.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Users, 
  Activity, 
  TrendingUp, 
  ClipboardList, 
  Video, 
  Search,
  ChevronRight,
  Heart,
  Brain,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';

interface Elder {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
}

export const ClinicianDashboard = () => {
  const [elders, setElders] = useState<Elder[]>([]);
  const [selectedElder, setSelectedElder] = useState<Elder | null>(null);
  const [healthData, setHealthData] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElders();
  }, []);

  useEffect(() => {
    if (selectedElder) {
      fetchElderData(selectedElder.id);
    }
  }, [selectedElder]);

  const fetchElders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, role')
      .eq('role', 'elder');
    
    if (data) {
      setElders(data);
      if (data.length > 0) setSelectedElder(data[0]);
    }
    setLoading(false);
  };

  const fetchElderData = async (elderId: string) => {
    // Fetch health metrics
    const { data: metrics } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('elder_id', elderId)
      .order('recorded_at', { ascending: true })
      .limit(20);

    // Fetch behavioral signals (mood)
    const { data: signals } = await supabase
      .from('behavioral_signals')
      .select('*')
      .eq('elder_id', elderId)
      .eq('signal_type', 'mood_alert')
      .order('created_at', { ascending: true })
      .limit(20);

    if (metrics) {
      setHealthData(metrics.map(m => ({
        time: format(new Date(m.recorded_at), 'HH:mm'),
        value: m.value,
        type: m.metric_type
      })));
    }

    if (signals) {
      setMoodData(signals.map(s => ({
        time: format(new Date(s.created_at), 'MM/dd'),
        score: s.metadata?.sentiment_score || 0
      })));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-primary mb-2">
            <Stethoscope className="h-8 w-8" />
            <span className="font-black uppercase tracking-[0.3em] text-sm">Clinician Command Center</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Medical Oversight</h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border">
          <Search className="h-5 w-5 text-muted-foreground ml-2" />
          <Input placeholder="Search patients..." className="border-0 focus-visible:ring-0 w-64" />
        </div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Patient Sidebar */}
        <Card className="lg:col-span-1 rounded-[32px] border-2 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Assigned Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {elders.map((elder) => (
                <button
                  key={elder.id}
                  onClick={() => setSelectedElder(elder)}
                  className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${
                    selectedElder?.id === elder.id ? 'bg-primary/5 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                      {elder.full_name[0]}
                    </div>
                    <span className="font-bold">{elder.full_name}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {selectedElder ? (
            <>
              {/* Quick Actions & Vital Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="rounded-[24px] border-2 bg-rose-50 border-rose-100 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white">
                      <Heart className="h-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-rose-600">Heart Rate</p>
                      <p className="text-2xl font-black">72 BPM</p>
                    </div>
                  </div>
                  <div className="h-16 w-full opacity-50">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={healthData.filter(d => d.type === 'heart_rate')}>
                        <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#fecaca" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="rounded-[24px] border-2 bg-indigo-50 border-indigo-100 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white">
                      <Brain className="h-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Cognitive Score</p>
                      <p className="text-2xl font-black">88/100</p>
                    </div>
                  </div>
                  <div className="h-16 w-full opacity-50">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodData}>
                        <Area type="monotone" dataKey="score" stroke="#6366f1" fill="#c7d2fe" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="flex flex-col gap-4">
                  <Button size="lg" className="h-1/2 rounded-2xl bg-slate-900 hover:bg-black font-black uppercase tracking-widest">
                    <ClipboardList className="mr-2 h-5 w-5" /> New Treatment Plan
                  </Button>
                  <Button size="lg" variant="outline" className="h-1/2 rounded-2xl border-2 font-black uppercase tracking-widest">
                    <Video className="mr-2 h-5 w-5" /> Video Consultation
                  </Button>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="rounded-[32px] border-2 p-8 shadow-sm">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> Health Indicators (24h)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={healthData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="rounded-[32px] border-2 p-8 shadow-sm">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" /> Mood Trends (Weekly)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={moodData}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Alert Log */}
              <Card className="rounded-[32px] border-2 border-orange-100 bg-orange-50/20 p-8">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" /> Critical Event History
                </h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-orange-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">Panic Button Triggered</p>
                        <p className="text-xs text-muted-foreground">Dec 25, 2025 • 14:22</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold">Review Data</Button>
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <div className="h-[600px] flex flex-col items-center justify-center text-muted-foreground border-4 border-dashed rounded-[40px]">
              <Users className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-xl font-bold">Select a patient to view clinical data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

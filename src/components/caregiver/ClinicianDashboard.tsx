import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  AlertCircle,
  Shield,
  FileText,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { assessHealthRisks, predictMoodAndAnalyzeSentiment } from '@/lib/ai';
import { toast } from 'sonner';

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
  const [moodTrend, setMoodTrend] = useState<any>(null);
  const [healthRisks, setHealthRisks] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'telemedicine'>('overview');

  useEffect(() => {
    fetchElders();
    
    const channel = supabase
      .channel('clinician_alerts')
      .on('postgres_changes', { event: 'INSERT', table: 'alerts' }, (payload) => {
        toast.error(`CRITICAL ALERT: ${payload.new.message}`, {
          description: "Check patient status immediately.",
          duration: 20000
        });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
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
    setLoading(true);
    try {
      const [risks, mood] = await Promise.all([
        assessHealthRisks(elderId),
        predictMoodAndAnalyzeSentiment(elderId)
      ]);
      setHealthRisks(risks);
      setMoodTrend(mood);

      const { data: metrics } = await supabase
        .from('health_metrics')
        .select('*')
        .eq('elder_id', elderId)
        .order('recorded_at', { ascending: true })
        .limit(30);

      if (metrics) {
        setHealthData(metrics.map(m => ({
          time: format(new Date(m.recorded_at), 'HH:mm'),
          value: m.value,
          type: m.metric_type
        })));
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10 font-sans">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
            <span className="font-bold uppercase tracking-[0.2em] text-xs">Clinical Command Center v2.0</span>
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900">Precision Oversight</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border-2 border-slate-100 flex items-center gap-3 pr-6">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400">System Status</p>
              <p className="text-sm font-bold text-slate-900">HIPAA Compliant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-10">
        <aside className="lg:col-span-3 space-y-6">
          <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
            <div className="p-6 bg-slate-900 text-white">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg font-black flex items-center gap-2">
                  <Users className="h-5 w-5" /> Patient Directory
                </CardTitle>
                <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black">
                  {elders.length} ACTIVE
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search MRN or Name..." 
                  className="bg-white/10 border-none text-white placeholder:text-slate-500 rounded-xl pl-10 h-11 focus-visible:ring-primary/50" 
                />
              </div>
            </div>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              {elders.map((elder) => (
                <button
                  key={elder.id}
                  onClick={() => setSelectedElder(elder)}
                  className={`w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-all border-b border-slate-50 ${
                    selectedElder?.id === elder.id ? 'bg-indigo-50/50 border-l-[6px] border-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xl overflow-hidden">
                      {elder.avatar_url ? <img src={elder.avatar_url} className="w-full h-full object-cover" /> : elder.full_name[0]}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-900 leading-tight">{elder.full_name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">MRN: {elder.id.slice(0, 8)}</p>
                    </div>
                  </div>
                  <ChevronRight className={`h-5 w-5 ${selectedElder?.id === elder.id ? 'text-indigo-600' : 'text-slate-200'}`} />
                </button>
              ))}
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-9 space-y-10">
          {selectedElder ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedElder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="md:col-span-2 rounded-[40px] border-none shadow-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 relative overflow-hidden">
                    <Zap className="absolute top-[-20px] right-[-20px] h-40 w-40 text-white/5" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          AI Predictive Risk
                        </div>
                      </div>
                      <div className="flex items-end gap-4 mb-8">
                        <span className="text-7xl font-black leading-none">{healthRisks?.risk_score || '--'}</span>
                        <span className="text-xl font-bold text-slate-400 mb-2">/100 RISK</span>
                      </div>
                      <div className="space-y-4">
                        {healthRisks?.risks?.map((risk: any, i: number) => (
                          <div key={i} className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/5">
                            <div className="flex items-center gap-3">
                              <AlertCircle className={`h-5 w-5 ${risk.probability > 0.6 ? 'text-rose-400' : 'text-amber-400'}`} />
                              <span className="font-bold text-sm capitalize">{risk.type}</span>
                            </div>
                            <span className="text-xs font-black bg-white/10 px-2 py-1 rounded-lg">{(risk.probability * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-[40px] border-none shadow-xl bg-white p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Cognitive Status</p>
                        <Brain className="h-6 w-6 text-indigo-500" />
                      </div>
                      <p className="text-3xl font-black text-slate-900 capitalize">{moodTrend?.mood || 'Stable'}</p>
                      <p className="text-sm font-bold text-indigo-600 mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> {moodTrend?.trend || 'stable'} trend
                      </p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-50">
                      <p className="text-[10px] font-black text-slate-300 uppercase mb-3">AI Explanation</p>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed italic line-clamp-3">
                        "{moodTrend?.explanation}"
                      </p>
                    </div>
                  </Card>

                  <Card className="rounded-[40px] border-none shadow-xl bg-white p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Physiological</p>
                        <Heart className="h-6 w-6 text-rose-500" />
                      </div>
                      <p className="text-3xl font-black text-slate-900">72 <span className="text-sm font-bold text-slate-400">BPM</span></p>
                      <p className="text-xs font-bold text-green-500 mt-1">Normal Range</p>
                    </div>
                    <div className="mt-8 h-16 opacity-30">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={healthData}>
                          <Area type="monotone" dataKey="value" stroke="#ef4444" fill="#fecaca" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>

                <div className="flex gap-4 p-2 bg-slate-100 rounded-[28px] w-fit">
                  {(['overview', 'clinical', 'telemedicine'] as const).map((tab) => (
                    <Button
                      key={tab}
                      variant={activeTab === tab ? 'default' : 'ghost'}
                      onClick={() => setActiveTab(tab)}
                      className={`h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                        activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-white'
                      }`}
                    >
                      {tab}
                    </Button>
                  ))}
                </div>

                {activeTab === 'overview' && (
                  <div className="grid md:grid-cols-2 gap-10">
                    <Card className="rounded-[40px] border-none shadow-xl bg-white p-8">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                          <Activity className="h-6 w-6 text-indigo-600" /> Vital Trends
                        </h3>
                        <Button variant="outline" size="sm" className="rounded-xl font-bold">Last 24h</Button>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={healthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" hide />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={5} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </Card>

                    <Card className="rounded-[40px] border-none shadow-xl bg-white p-8">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-8">
                        <ClipboardList className="h-6 w-6 text-amber-500" /> Preventive Measures
                      </h3>
                      <div className="space-y-4">
                        {healthRisks?.preventive_measures?.map((measure: string, i: number) => (
                          <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-3xl border-2 border-slate-100">
                            <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black text-[10px]">
                              {i + 1}
                            </div>
                            <p className="text-sm font-bold text-slate-700 leading-tight">{measure}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}

                {activeTab === 'telemedicine' && (
                  <Card className="rounded-[40px] border-none shadow-2xl bg-white overflow-hidden">
                    <div className="grid md:grid-cols-3">
                      <div className="md:col-span-2 bg-slate-900 h-[500px] relative">
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                          <Video className="h-24 w-24 opacity-10" />
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                          <Button size="icon" className="h-16 w-16 rounded-full bg-rose-500 hover:bg-rose-600 shadow-xl">
                            <Video className="h-8 w-8 text-white" />
                          </Button>
                          <Button size="icon" className="h-16 w-16 rounded-full bg-slate-800 hover:bg-slate-700 shadow-xl">
                            <Shield className="h-8 w-8 text-indigo-400" />
                          </Button>
                        </div>
                        <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-black tracking-widest flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                          ENCRYPTED P2P CHANNEL
                        </div>
                      </div>
                      <div className="p-8 space-y-8 border-l border-slate-100">
                        <div>
                          <h4 className="font-black text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-600" /> Documents
                          </h4>
                          <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start h-14 rounded-2xl border-2 font-bold text-sm">
                              <FileText className="mr-3 h-4 w-4" /> Latest EHR.pdf
                            </Button>
                          </div>
                        </div>
                        <Button className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 font-black uppercase tracking-widest shadow-lg shadow-indigo-100">
                          Invite Caregiver
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="h-[700px] flex flex-col items-center justify-center text-slate-300 border-4 border-dashed border-slate-200 rounded-[60px] bg-slate-50/50">
              <Users className="h-20 w-20 opacity-20 mb-6" />
              <p className="text-2xl font-black text-slate-400">Select Clinical Record</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

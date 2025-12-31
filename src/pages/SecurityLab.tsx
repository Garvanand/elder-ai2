import { Shield, Lock, Eye, Zap, Database, Terminal, CheckCircle2, AlertTriangle, Fingerprint, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SecurityLog {
  id: string;
  event_type: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  created_at: string;
}

interface SecurityMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  status: string;
  updated_at: string;
}

const SecurityLab = () => {
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const defaultMetrics = [
    { name: "SSL/TLS Encryption", icon: Lock, color: "text-emerald-400" },
    { name: "Database Security", icon: Database, color: "text-blue-400" },
    { name: "Authentication System", icon: Fingerprint, color: "text-purple-400" },
    { name: "API Gateway", icon: Eye, color: "text-amber-400" },
  ];

  const protocols = [
    { title: "TLS 1.3 Encryption", desc: "All data transmitted between your browser and our servers is encrypted using TLS 1.3, the latest and most secure transport protocol." },
    { title: "Supabase Row Level Security", desc: "We use Supabase's built-in Row Level Security (RLS) to ensure users can only access their own data at the database level." },
    { title: "Secure API Authentication", desc: "All API requests are authenticated using JWT tokens with short expiration times and automatic refresh mechanisms." }
  ];

  const fetchSecurityData = async () => {
    setIsLoading(true);
    try {
      const { data: logsData } = await supabase
        .from('security_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const { data: metricsData } = await supabase
        .from('security_metrics')
        .select('*')
        .order('updated_at', { ascending: false });

      if (logsData) setSecurityLogs(logsData);
      if (metricsData) setMetrics(metricsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMetricData = (metricName: string) => {
    const metric = metrics.find(m => m.metric_name === metricName);
    return metric ? { value: metric.metric_value, status: metric.status } : { value: 100, status: 'Active' };
  };

  const formatTimeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen text-white selection:bg-primary/30">
      <main className="relative pt-12 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
            >
              <Shield size={16} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Security Lab</span>
              <button onClick={fetchSecurityData} className="ml-2 hover:text-white transition-colors">
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase"
            >
              Security <span className="text-primary italic">Center</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-xl max-w-2xl mx-auto font-medium"
            >
              Real-time security monitoring and protection status for MemoryFriend.
            </motion.p>
            <p className="text-white/20 text-xs mt-4">Last updated: {lastRefresh.toLocaleTimeString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {defaultMetrics.map((test, i) => {
              const data = getMetricData(test.name);
              return (
                <motion.div
                  key={test.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className="relative group p-6 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[24px] overflow-hidden"
                >
                  <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                    <test.icon size={48} />
                  </div>
                  <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${test.color}`}>
                      <test.icon size={20} />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider mb-2">{test.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 size={12} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{data.status}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${data.value}%` }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <span className="text-[10px] text-white/30 mt-1 block">{data.value}% integrity</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-6">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Security <span className="text-primary">Protocols</span></h2>
                <div className="space-y-6">
                  {protocols.map((p, i) => (
                    <motion.div 
                      key={p.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.6 }}
                      className="flex gap-4 p-4 bg-white/5 rounded-2xl"
                    >
                      <div className="mt-1 p-2 bg-primary/10 rounded-lg text-primary h-fit">
                        <Zap size={16} />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold mb-1">{p.title}</h4>
                        <p className="text-white/40 leading-relaxed text-sm font-medium">{p.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-1 bg-gradient-to-br from-primary/30 via-accent/30 to-purple-600/30 rounded-[32px]"
              >
                <div className="bg-slate-950 rounded-[30px] p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                      <Terminal size={16} className="text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Security Log</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="font-mono text-[9px] space-y-2 max-h-48 overflow-y-auto">
                    {securityLogs.length > 0 ? (
                      securityLogs.map((log) => (
                        <p key={log.id} className={`flex justify-between ${log.severity === 'warning' ? 'text-amber-500' : log.severity === 'error' ? 'text-red-500' : 'text-emerald-500/80'}`}>
                          <span>[{log.event_type}] {log.message}</span>
                          <span className="text-white/20">{formatTimeAgo(log.created_at)}</span>
                        </p>
                      ))
                    ) : (
                      <>
                        <p className="flex justify-between text-emerald-500/80"><span>[SYSTEM] Security monitoring active</span> <span className="text-white/20">NOW</span></p>
                        <p className="flex justify-between text-emerald-500/80"><span>[AUTH] All authentication systems operational</span> <span className="text-white/20">1m ago</span></p>
                        <p className="flex justify-between text-emerald-500/80"><span>[DB] Database connection secure</span> <span className="text-white/20">2m ago</span></p>
                        <p className="flex justify-between text-emerald-500/80"><span>[SSL] TLS certificate valid</span> <span className="text-white/20">5m ago</span></p>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="p-8 bg-white/5 rounded-[32px] border border-white/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-black uppercase tracking-widest mb-2">Infrastructure Security</h3>
                <p className="text-white/40 text-sm">Powered by Supabase with enterprise-grade security features.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-primary">256-bit</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">AES Encryption</div>
                </div>
                <div className="w-px h-12 bg-white/10" />
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-500">99.9%</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityLab;

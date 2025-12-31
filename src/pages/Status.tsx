import { Activity, Globe, Server, Cpu, Database, Cloud, Wifi, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";

const Status = () => {
  const services = [
    { name: "Neural Processing Core", status: "Operational", uptime: "99.99%", latency: "14ms", icon: Cpu },
    { name: "Global Memory Mesh", status: "Operational", uptime: "100%", latency: "32ms", icon: Globe },
    { name: "Family Cloud Sync", status: "Operational", uptime: "99.95%", latency: "45ms", icon: Cloud },
    { name: "Biometric Auth Gateway", status: "Operational", uptime: "100%", latency: "8ms", icon: Server },
    { name: "Emotional Synthesis API", status: "Operational", uptime: "99.98%", latency: "120ms", icon: Activity },
    { name: "Decentralized Storage Node", status: "Operational", uptime: "100%", latency: "210ms", icon: Database },
  ];

  const regions = [
    { name: "North America", status: "Optimal" },
    { name: "European Union", status: "Optimal" },
    { name: "Asia Pacific", status: "Optimal" },
    { name: "South America", status: "Degraded Performance" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <FuturisticBackground />
      <Navbar />

      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Status Header */}
          <div className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-6"
            >
              <CheckCircle2 size={16} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">All Systems Operational</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">
              Network <span className="text-primary italic">Status</span>
            </h1>
            <p className="text-white/40 text-xl max-w-2xl mx-auto font-medium">
              Real-time monitoring of our decentralized neural infrastructure.
            </p>
          </div>

          {/* Main Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {services.map((service, i) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] hover:border-primary/50 transition-colors group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 bg-white/5 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                    <service.icon size={24} />
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black uppercase tracking-widest text-white/30 mb-1">Uptime</span>
                    <span className="text-lg font-black text-white">{service.uptime}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">{service.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{service.status}</span>
                  </div>
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{service.latency}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Regional & Incident History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Regional <span className="text-primary">Nodes</span></h2>
              <div className="space-y-4">
                {regions.map((region) => (
                  <div key={region.name} className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <Wifi size={20} className="text-white/20" />
                      <span className="font-bold text-lg">{region.name}</span>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest ${region.status === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {region.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-black uppercase tracking-tighter">Incident <span className="text-primary">Log</span></h2>
              <div className="p-8 bg-slate-900/50 border border-white/10 rounded-[32px] space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <span className="block text-xs font-black uppercase tracking-widest text-white/30 mb-1">Dec 30, 2025</span>
                    <p className="font-bold">No incidents reported.</p>
                  </div>
                </div>
                <div className="flex gap-4 opacity-50">
                  <div className="mt-1">
                    <AlertCircle size={18} className="text-amber-500" />
                  </div>
                  <div>
                    <span className="block text-xs font-black uppercase tracking-widest text-white/30 mb-1">Dec 28, 2025</span>
                    <p className="font-bold">Scheduled maintenance on Asia-1 node completed successfully.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Status;

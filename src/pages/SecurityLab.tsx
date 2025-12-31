import { Shield, Lock, Eye, Zap, Database, Terminal, CheckCircle2, AlertTriangle, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";

const SecurityLab = () => {
  const securityTests = [
    { name: "End-to-End Encryption", status: "Active", level: 100, icon: Lock, color: "text-emerald-400" },
    { name: "Neural Data Isolation", status: "Secure", level: 98, icon: Database, color: "text-blue-400" },
    { name: "Zero-Knowledge Proofs", status: "Operational", level: 100, icon: Fingerprint, color: "text-purple-400" },
    { name: "Biometric Authentication", status: "Active", level: 99, icon: Eye, color: "text-amber-400" },
  ];

  const protocols = [
    { title: "AES-256 Quantum Resistant", desc: "All user memories are encrypted using military-grade protocols that remain secure even against future quantum computing threats." },
    { title: "Decentralized Storage", desc: "We utilize a sharded IPFS-based architecture ensuring no single point of failure or data breach can expose user identity." },
    { title: "Privacy-First AI", desc: "Our neural models run on edge devices where possible, ensuring sensitive emotional data never leaves your personal network." }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
      <FuturisticBackground />
      <Navbar />

      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
            >
              <Shield size={16} />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Security Lab v4.0.2</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase"
            >
              Fortress of <span className="text-primary italic">Integrity</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-xl max-w-2xl mx-auto font-medium"
            >
              Our multi-layered security architecture ensures your neural legacy remains private, secure, and permanent.
            </motion.p>
          </div>

          {/* Real-time Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {securityTests.map((test, i) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="relative group p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden"
              >
                <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity`}>
                  <test.icon size={64} />
                </div>
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 ${test.color}`}>
                    <test.icon size={24} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-wider mb-2">{test.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{test.status}</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${test.level}%` }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Security Deep Dive */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-6">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Protocol <span className="text-primary">Architecture</span></h2>
                <div className="space-y-8">
                  {protocols.map((p, i) => (
                    <motion.div 
                      key={p.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.6 }}
                      className="flex gap-6"
                    >
                      <div className="mt-1 p-2 bg-primary/10 rounded-lg text-primary h-fit">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{p.title}</h4>
                        <p className="text-white/40 leading-relaxed font-medium">{p.desc}</p>
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
                className="relative p-1 bg-gradient-to-br from-primary/30 via-accent/30 to-purple-600/30 rounded-[40px]"
              >
                <div className="bg-slate-950 rounded-[38px] p-8 space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <Terminal size={18} className="text-primary" />
                      <span className="text-xs font-black uppercase tracking-widest text-white/60">Live Defense Log</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="font-mono text-[10px] space-y-3 text-emerald-500/80">
                    <p className="flex justify-between"><span>[SYSTEM] Monitoring ingress traffic...</span> <span className="text-white/20">NOW</span></p>
                    <p className="flex justify-between"><span>[AUTH] Biometric signature verified.</span> <span className="text-white/20">2s ago</span></p>
                    <p className="flex justify-between"><span>[SHIELD] 128-bit Handshake complete.</span> <span className="text-white/20">15s ago</span></p>
                    <p className="flex justify-between text-amber-500"><span>[WARN] Brute-force attempt neutralized.</span> <span className="text-white/20">1m ago</span></p>
                    <p className="flex justify-between"><span>[CORE] DB parity check: 100% matched.</span> <span className="text-white/20">5m ago</span></p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary hover:text-white transition-all">
                      View Audit Log
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="p-12 bg-white/5 rounded-[48px] border border-white/10 text-center">
            <h3 className="text-2xl font-black uppercase tracking-widest mb-10">Trusted By Global Institutions</h3>
            <div className="flex flex-wrap justify-center gap-12 opacity-30 grayscale contrast-125">
               {/* Placeholders for logos */}
               <div className="text-2xl font-black italic">CLINIC-X</div>
               <div className="text-2xl font-black tracking-tighter uppercase">BioShield</div>
               <div className="text-2xl font-black tracking-widest">NEURAL-LINK</div>
               <div className="text-2xl font-black">PROTO-SAFE</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SecurityLab;

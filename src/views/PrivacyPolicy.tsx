import { motion } from "framer-motion";
import { Lock, Eye, Cookie, UserCheck, ShieldCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-5xl mx-auto py-24 px-6 relative">
      {/* Decorative Blobs for Theme Consistency */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-16"
      >
        <div className="text-center space-y-6">
          <div className="inline-flex p-4 rounded-3xl bg-primary text-white shadow-2xl shadow-primary/20 mb-4 animate-float">
            <Lock size={40} />
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase text-slate-950 leading-none">
            Privacy <span className="text-primary italic">Protocol</span>
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-slate-200" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Neural Security Ver: 2.0.5</p>
            <div className="h-px w-12 bg-slate-200" />
          </div>
        </div>

        <div className="grid gap-10">
          <p className="text-3xl text-slate-800 leading-tight text-center font-black italic max-w-3xl mx-auto tracking-tight">
            "Your biological and digital legacy is a sovereign asset. We architect for absolute sanctity."
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-2xl shadow-black/5 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                <Eye size={120} />
              </div>
              <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Eye size={24} />
                </div>
                Data Ingestion
              </h2>
              <ul className="space-y-5 text-slate-700 font-bold text-lg leading-snug">
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0 shadow-lg shadow-primary/40" />
                  Biometric identifiers and neural patterns for identity verification.
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2.5 flex-shrink-0 shadow-lg shadow-primary/40" />
                  Personal metadata (Name, Email, Node Address) for ecosystem sync.
                </li>
              </ul>
            </section>

            <section className="bg-slate-950 p-10 rounded-[48px] shadow-2xl shadow-black/20 hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <ShieldCheck size={120} />
              </div>
              <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-primary">
                  <Lock size={24} />
                </div>
                Use of Intel
              </h2>
              <p className="text-white/70 font-bold leading-relaxed text-lg">
                Gathered intelligence is strictly utilized to optimize the <span className="text-white">Neural Recovery Engine</span> and synchronize family nodes. No data leaves the decentralised vault without cryptographic consent.
              </p>
            </section>

            <section className="bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-2xl shadow-black/5 hover:border-accent/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                <Cookie size={120} />
              </div>
              <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <Cookie size={24} />
                </div>
                Neural Cookies
              </h2>
              <p className="text-slate-700 font-bold leading-relaxed text-lg">
                We use session-based cryptographic markers to maintain persistence across your neural link. You can terminate these links via your node settings.
              </p>
            </section>

            <section className="bg-primary/5 p-10 rounded-[48px] border-2 border-primary/10 shadow-2xl shadow-primary/5 hover:bg-primary/10 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                <UserCheck size={120} />
              </div>
              <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                  <UserCheck size={24} />
                </div>
                Sovereign Rights
              </h2>
              <div className="space-y-6 text-slate-700 font-bold text-lg">
                <p>
                  You retain 100% ownership of your life-data. You may request a "Neural Wipe" or data export at any point in the cycle.
                </p>
                <div className="p-6 bg-white rounded-3xl border border-primary/10 flex items-center justify-between group-hover:shadow-xl transition-shadow">
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Status: Active Protection</span>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;

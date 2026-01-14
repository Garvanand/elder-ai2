import { motion } from "framer-motion";
import { ShieldCheck, Scale, FileText, Zap, Globe, Lock } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="max-w-5xl mx-auto py-24 px-6 relative">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="space-y-20"
      >
        <div className="text-center space-y-6">
          <div className="inline-flex p-4 rounded-3xl bg-accent text-white shadow-2xl shadow-accent/20 mb-4 animate-float">
            <Scale size={40} />
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase text-slate-950 leading-none">
            Terms of <span className="text-accent italic text-primary">Operations</span>
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-slate-200" />
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Neural Governance Ver: 1.0.4</p>
            <div className="h-px w-12 bg-slate-200" />
          </div>
        </div>

        <div className="grid gap-12">
          <section className="bg-white p-12 rounded-[56px] border-2 border-slate-50 shadow-2xl shadow-black/5 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
              <ShieldCheck size={140} />
            </div>
            <h2 className="text-3xl font-black text-slate-950 mb-8 flex items-center gap-4 uppercase tracking-tighter">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <ShieldCheck size={28} />
              </div>
              1. The Neural Contract
            </h2>
            <p className="text-slate-700 font-bold leading-relaxed text-xl">
              By initializing a link with <span className="text-primary">MemoryFriend</span>, you enter into a binding digital covenant. You agree to utilize our neural synthesis ecosystem exclusively for the preservation of human legacy and cognitive care.
            </p>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-slate-950 p-10 rounded-[48px] shadow-2xl shadow-black/20 text-white group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <Zap size={100} />
              </div>
              <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-2xl text-primary">
                  <FileText size={24} />
                </div>
                Usage Protocol
              </h2>
              <ul className="space-y-4 text-white/70 font-bold text-lg">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                  No reverse engineering of neural logic.
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 flex-shrink-0" />
                  Respect biological sovereignty.
                </li>
              </ul>
            </section>

            <section className="bg-white p-10 rounded-[48px] border-2 border-slate-50 shadow-2xl shadow-black/5 hover:border-accent/20 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
                <Lock size={100} />
              </div>
              <h2 className="text-2xl font-black text-slate-950 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <Lock size={24} />
                </div>
                Vault Security
              </h2>
              <p className="text-slate-700 font-bold leading-relaxed text-lg">
                Your credentials are your unique cryptographic signature. You are 100% responsible for the sanctity of your node access.
              </p>
            </section>
          </div>

          <section className="bg-primary/5 p-12 rounded-[56px] border-2 border-primary/10 shadow-2xl shadow-primary/5 hover:bg-primary/10 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform">
              <Globe size={140} />
            </div>
            <h2 className="text-3xl font-black text-slate-950 mb-8 flex items-center gap-4 uppercase tracking-tighter">
              <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                <Globe size={28} />
              </div>
              Governing Jurisdiction
            </h2>
            <div className="space-y-6 text-slate-700 font-bold text-xl">
              <p>
                This contract is governed by the laws of India. Any disputes will be resolved through neutral arbitration nodes.
              </p>
              <div className="p-8 bg-white rounded-[32px] border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-6 group-hover:shadow-xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">Node Status: Lawful Compliance</span>
                </div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-primary">Neural Core V1.0.4 - Active</div>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;

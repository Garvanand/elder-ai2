import { Book, Code, Cpu, Link as LinkIcon, Share2, Terminal, Zap, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";

const UplinkDocs = () => {
  const sections = [
    {
      title: "Core Concepts",
      items: ["Neural Synthesis Overview", "The Memory Mesh", "Emotional Integrity Protocol", "Decentralized Trust"]
    },
    {
      title: "Integration",
      items: ["Uplink SDK Setup", "API Authentication", "Streaming Memories", "Webhooks & Signals"]
    },
    {
      title: "Security",
      items: ["End-to-End Encryption", "Biometric Handshakes", "Data Sharding", "Audit Logs"]
    }
  ];

  const highlights = [
    { title: "Universal Uplink", desc: "Connect any neural-compatible device to the MemoryFriend network in seconds.", icon: Zap },
    { title: "Legacy Export", desc: "Standardized JSON-LD formats for long-term archival and multi-platform support.", icon: Share2 },
    { title: "Real-time Sync", desc: "Sub-50ms latency for real-time emotional state synchronization across nodes.", icon: LinkIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <FuturisticBackground />
      <Navbar />

      <main className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Sidebar Navigation */}
            <aside className="lg:col-span-3 hidden lg:block space-y-12 sticky top-32 h-fit">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search protocols..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary/50 font-bold text-sm"
                />
              </div>

              {sections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 px-4">{section.title}</h4>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item}>
                        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all font-bold text-sm flex items-center justify-between group">
                          {item}
                          <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </aside>

            {/* Documentation Content */}
            <div className="lg:col-span-9 space-y-20">
              <section>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
                >
                  <Book size={16} />
                  <span className="text-xs font-black uppercase tracking-[0.3em]">Documentation v1.4.0</span>
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 uppercase">
                  Uplink <span className="text-primary italic">Developer Docs</span>
                </h1>
                <p className="text-white/40 text-xl max-w-3xl font-medium leading-relaxed">
                  The technical blueprint for the MemoryFriend ecosystem. Learn how to interface with our neural core, manage distributed storage, and implement high-security authentication.
                </p>
              </section>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {highlights.map((h, i) => (
                  <motion.div
                    key={h.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-slate-900/50 border border-white/10 rounded-[32px] hover:border-primary/30 transition-all"
                  >
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary mb-6">
                      <h.icon size={24} />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-2">{h.title}</h3>
                    <p className="text-sm text-white/40 font-medium leading-relaxed">{h.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Code Example */}
              <section className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Code size={20} />
                  </div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">Quick <span className="text-primary">Start</span></h2>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[32px] blur opacity-50" />
                  <div className="relative bg-slate-950 rounded-[32px] p-8 border border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">uplink-init.ts</span>
                    </div>
                    <pre className="font-mono text-sm text-emerald-400/80 overflow-x-auto leading-relaxed">
{`import { NeuralUplink } from '@memoryfriend/uplink-sdk';

// Initialize the neural handshake
const uplink = new NeuralUplink({
  apiKey: process.env.UPLINK_KEY,
  protocol: 'neural-v4',
  sharding: true
});

// Connect to the memory mesh
await uplink.connect();

uplink.on('memory:sync', (data) => {
  console.log('Neural integrity:', data.checksum);
});`}
                    </pre>
                  </div>
                </div>
              </section>

              {/* Call to Action */}
              <div className="p-12 bg-primary rounded-[48px] text-white flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Ready to Build?</h2>
                  <p className="text-white/70 font-medium">Join our developer ecosystem and help shape the future of legacy.</p>
                </div>
                <button className="px-10 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all">
                  Request API Access
                </button>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UplinkDocs;

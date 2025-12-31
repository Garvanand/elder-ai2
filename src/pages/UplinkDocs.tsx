import { Book, Code, Link as LinkIcon, Share2, Zap, ChevronRight, Search } from "lucide-react";
import { motion } from "framer-motion";

const UplinkDocs = () => {
  const sections = [
    {
      title: "Core Concepts",
      items: ["Getting Started", "Memory Architecture", "User Authentication", "Data Privacy"]
    },
    {
      title: "Integration",
      items: ["Supabase Setup", "API Routes", "Real-time Subscriptions", "File Storage"]
    },
    {
      title: "Security",
      items: ["Row Level Security", "JWT Tokens", "Data Encryption", "Audit Logging"]
    }
  ];

  const highlights = [
    { title: "Supabase Backend", desc: "Powered by Supabase for real-time database, authentication, and storage.", icon: Zap },
    { title: "React + Vite", desc: "Modern frontend stack with TypeScript, Tailwind CSS, and Framer Motion.", icon: Share2 },
    { title: "AI Integration", desc: "Gemini and Groq APIs for intelligent memory processing and analysis.", icon: LinkIcon }
  ];

  return (
    <div className="min-h-screen text-white">
      <main className="relative pt-12 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
              <aside className="lg:col-span-3 hidden lg:block space-y-10 sticky top-32 h-fit">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search docs..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-primary/50 font-bold text-sm text-white placeholder:text-white/20"
                  />
                </div>

                {sections.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary px-3">{section.title}</h4>
                    <ul className="space-y-1">
                      {section.items.map((item) => (
                        <li key={item}>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-all font-bold text-sm flex items-center justify-between group">
                            {item}
                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </aside>

              <div className="lg:col-span-9 space-y-16">
                <section>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
                  >
                    <Book size={16} />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Documentation</span>
                  </motion.div>
                  <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase text-white">
                    Developer <span className="text-primary italic">Docs</span>
                  </h1>
                  <p className="text-white/70 text-lg max-w-3xl font-medium leading-relaxed">
                    Technical documentation for MemoryFriend. Learn about our architecture, APIs, and how to extend the platform.
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {highlights.map((h, i) => (
                    <motion.div
                      key={h.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-6 bg-slate-900/80 border border-white/10 rounded-[24px] hover:border-primary/30 transition-all"
                    >
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary mb-4">
                        <h.icon size={20} />
                      </div>
                      <h3 className="text-base font-black uppercase tracking-tight mb-1 text-white">{h.title}</h3>
                      <p className="text-xs text-white/60 font-medium leading-relaxed">{h.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <section className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <Code size={16} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">Quick <span className="text-primary">Start</span></h2>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-[24px] blur opacity-50" />
                    <div className="relative bg-slate-950 rounded-[24px] p-6 border border-white/10 overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">supabase-client.ts</span>
                      </div>
                      <pre className="font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
  {`import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch memories for a user
const { data: memories } = await supabase
  .from('memories')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });`}
                      </pre>
                    </div>
                  </div>
                </section>

                <section className="space-y-6">
                  <h2 className="text-2xl font-black uppercase tracking-tight text-white">API <span className="text-primary">Endpoints</span></h2>
                  <div className="space-y-3">
                    {[
                      { method: 'GET', path: '/api/memories', desc: 'Fetch all memories for authenticated user' },
                      { method: 'POST', path: '/api/memories', desc: 'Create a new memory entry' },
                      { method: 'POST', path: '/api/questions/answer', desc: 'AI-powered question answering' },
                      { method: 'GET', path: '/api/summaries/daily', desc: 'Generate daily memory summary' },
                    ].map((endpoint) => (
                      <div key={endpoint.path} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                          endpoint.method === 'GET' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-sm font-mono text-white/90">{endpoint.path}</code>
                        <span className="text-xs text-white/60 ml-auto">{endpoint.desc}</span>
                      </div>
                    ))}
                  </div>
                </section>

              <div className="p-8 bg-primary rounded-[32px] text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight mb-1">Need Help?</h2>
                  <p className="text-white/70 text-sm font-medium">Contact our support team for technical assistance.</p>
                </div>
                <a href="/support" className="px-8 py-4 bg-white text-slate-950 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">
                  Get Support
                </a>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default UplinkDocs;

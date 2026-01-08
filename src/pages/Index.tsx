import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Shield, ArrowRight, Sparkles, CheckCircle2, Activity, MessageSquare, Globe, Zap, Database, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { GuestModeModal } from '@/components/GuestModeModal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { isGuestMode } = useDemo();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const isNativeMobile = typeof window !== 'undefined' && (window as any).isNativeMobile;
  
  const scale = useTransform(scrollYProgress, [0, 1], [1, isNativeMobile ? 1 : 0.8]);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'caregiver') navigate('/caregiver');
      else if (profile.role === 'elder') navigate('/elder');
    }
  }, [user, profile, loading, navigate]);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'Neural Recovery',
      description: 'AI-driven memory synthesis designed for cognitive elasticity and dignity.',
      color: 'bg-primary/10'
    },
    {
      icon: <Activity className="w-8 h-8 text-rose-500" />,
      title: 'Bio-Sync Monitoring',
      description: 'Synchronized health telemetry correlates vitals with cognitive readiness.',
      color: 'bg-rose-500/10'
    },
    {
      icon: <Globe className="w-8 h-8 text-amber-500" />,
      title: 'Global Presence',
      description: 'Bridge physical distance with holographic-ready memory sharing.',
      color: 'bg-amber-500/10'
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: 'Quantum Guard',
      description: 'Post-quantum encryption ensuring the sanctity of your life data.',
      color: 'bg-emerald-500/10'
    },
  ];

  return (
    <div className={cn(
      "min-h-screen text-[#1A1A1A] selection:bg-primary/20",
      isNativeMobile ? "overflow-y-auto" : "overflow-x-hidden"
    )}>
      <main className="relative z-10">
        {/* Floating background elements - Hidden on mobile for performance */}
        {!isNativeMobile && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
            <motion.div 
              animate={{ 
                y: [0, -20, 0],
                opacity: [0.3, 0.5, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/20 rounded-full blur-3xl" 
            />
            <motion.div 
              animate={{ 
                y: [0, 20, 0],
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-[40%] right-[10%] w-96 h-96 bg-accent/20 rounded-full blur-3xl" 
            />
          </div>
        )}

        {/* Hero Section */}
        <section className={cn("relative px-6", isNativeMobile ? "pt-10 pb-20" : "pt-32 pb-40")}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={isNativeMobile ? { opacity: 1, y: 0 } : { opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/40 backdrop-blur-md border border-white/40 shadow-xl text-primary text-xs font-black uppercase tracking-[0.2em]">
                <Sparkles className="w-4 h-4" />
                Next-Gen Care Ecosystem
              </div>
              <h1 className="text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground via-foreground to-foreground/40">
                Beyond <span className="text-primary italic">Memory</span>.
              </h1>
              <p className="text-2xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                The first decentralized, emotionally aware platform architected to preserve humanity through technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                  <Link to="/auth">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button size="lg" className="h-20 px-12 text-xl font-black rounded-3xl w-full sm:w-auto shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] bg-primary group uppercase tracking-widest">
                        Enter Collective
                        <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => setShowGuestModal(true)}
                      className="h-20 px-12 text-xl font-black rounded-3xl w-full sm:w-auto border-2 border-amber-400/60 bg-amber-50/80 backdrop-blur-md hover:bg-amber-100 text-amber-700 uppercase tracking-widest group"
                    >
                      <Eye className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" />
                      Try Demo
                    </Button>
                  </motion.div>
                </div>
              
              <div className="flex items-center gap-8 pt-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white bg-slate-200 shadow-lg overflow-hidden relative">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="object-cover w-full h-full grayscale" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="text-foreground block text-lg">99.8%</span> Reliability Score
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="relative perspective-1000"
            >
              <div className="relative z-10 rounded-[60px] border-[1px] border-white/60 shadow-2xl overflow-hidden aspect-[4/3] bg-white/20 backdrop-blur-3xl transform rotate-3 hover:rotate-0 transition-all duration-700 group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full space-y-6">
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="p-8 bg-white/80 backdrop-blur-xl rounded-[32px] shadow-2xl flex gap-6 border border-white"
                    >
                      <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Biometric Sync</p>
                        <p className="text-xl font-bold">Neural Pattern Verified</p>
                        <p className="text-sm text-muted-foreground">Identity hash matches cognitive baseline.</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 10 }}
                      className="p-8 bg-black/5 backdrop-blur-xl rounded-[32px] shadow-2xl flex gap-6 border border-white/30 ml-8"
                    >
                      <div className="w-16 h-16 rounded-[24px] bg-accent/80 flex items-center justify-center shadow-lg shadow-accent/20">
                        <Database className="w-8 h-8 text-white" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Memory Bank</p>
                        <p className="text-xl font-bold">Memory Index Updated</p>
                        <p className="text-sm text-muted-foreground font-medium">"Spring in Kyoto, 1992" archived 2m ago.</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
              {/* Futuristic floating rings */}
              <div className="absolute -top-10 -left-10 w-40 h-40 border-[20px] border-primary/5 rounded-full animate-float" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 border-[40px] border-accent/5 rounded-full animate-float [animation-delay:1s]" />
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-40 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center space-y-6">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-6xl font-black tracking-tighter"
              >
                Synthesized for trust and longevity.
              </motion.h2>
              <p className="text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
                Seamlessly blending empathetic intelligence with clinical-grade analytics to fortify the human experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, ease: "circOut" }}
                >
                  <Card className="border-none bg-white/40 backdrop-blur-xl hover:bg-white/80 transition-all duration-500 p-10 h-full rounded-[48px] shadow-2xl shadow-black/5 group cursor-default">
                    <div className={`w-20 h-20 rounded-[30px] ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg font-medium">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Connected View */}
        <section id="how-it-works" className="py-40 px-6 bg-black/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <h2 className="text-6xl font-black leading-[1.1] tracking-tighter">
                Bridging the <span className="text-primary italic">temporal gap</span>.
              </h2>
              <div className="space-y-8">
                {[
                  { title: "Zero-Knowledge Ingestion", desc: "Speak naturally. Our engine parses memories without compromising biological privacy." },
                  { title: "Predictive Health Logic", desc: "Correlation models detect subtle shifts in cognitive readiness before they manifest." },
                  { title: "Unified Insight Portal", desc: "Every family member synchronized on a single, secure intelligence stream." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 10 }}
                    className="flex gap-6 items-start p-6 rounded-3xl hover:bg-white/40 transition-all"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-2xl uppercase tracking-tighter mb-2">{item.title}</h4>
                      <p className="text-muted-foreground text-lg leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-slate-950 rounded-[80px] p-20 text-white relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 right-0 p-10 opacity-20">
                  <Globe className="w-64 h-64 text-primary animate-spin-[20s]" />
                </div>
                <div className="relative z-10 space-y-10">
                  <div className="inline-flex px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-black tracking-widest uppercase">Testimonial Protocol</div>
                  <blockquote className="text-4xl font-black leading-tight tracking-tight italic">
                    "Cognitive engagement metrics increased by 40% within the first lunar cycle. The emotional bridge is restored."
                  </blockquote>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-slate-800 shadow-xl overflow-hidden grayscale">
                      <img src="https://i.pravatar.cc/150?u=sarah" alt="sarah" />
                    </div>
                    <div>
                      <p className="font-black text-xl tracking-tighter uppercase">Garv Anand</p>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Project Head</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Integrated CTA */}
        <section className="py-40 px-6 relative z-10">
          <motion.div 
            style={{ scale }}
            className="max-w-5xl mx-auto text-center space-y-12 bg-gradient-to-br from-primary via-primary to-accent p-24 rounded-[80px] shadow-[0_40px_120px_rgba(var(--primary-rgb),0.4)] text-white relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-none uppercase">Join the Collective Intelligence.</h2>
              <p className="text-2xl text-white/80 max-w-2xl mx-auto font-medium">
                Synchronize your lineage. Preserve your legacy. Ensure the future of care.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Link to="/auth">
                  <Button size="lg" className="h-20 px-16 text-xl font-black rounded-3xl bg-white text-primary hover:bg-slate-50 shadow-2xl shadow-black/20 uppercase tracking-widest group">
                    Initialize Setup
                    <Zap className="w-6 h-6 ml-3 group-hover:fill-current transition-all" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost" size="lg" className="h-20 px-16 text-xl font-black rounded-3xl text-white hover:bg-white/10 border-2 border-white/20 uppercase tracking-widest">
                    Network Status
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute -top-10 -right-10">
              <Sparkles className="w-40 h-40 text-white/10 animate-pulse" />
            </div>
          </motion.div>
        </section>
        </main>
        
        <GuestModeModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
      </div>
    );
  };
  
  export default Index;

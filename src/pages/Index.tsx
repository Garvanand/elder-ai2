import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Shield, ArrowRight, Sparkles, CheckCircle2, Activity, MessageSquare, Globe, Zap, Database, Play, Eye, Lock, Smartphone, Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useDemo } from '@/contexts/DemoContext';
import { GuestModeModal } from '@/components/GuestModeModal';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const InteractiveHero = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [heartRate, setHeartRate] = useState(72);
  const [residentIndex, setResidentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useSpring(0, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 20 });

  const residents = [
    { 
      name: "Margaret Wilson", 
      img: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&q=80&w=400", 
      memory: "1965 Summer Trip", 
      status: "Stable",
      vitals: { bpm: 72, oxygen: 98, sleep: "8.2h" },
      activeCaregivers: 2
    },
    { 
      name: "Arthur Chen", 
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400", 
      memory: "First Piano Recital", 
      status: "Resting",
      vitals: { bpm: 68, oxygen: 97, sleep: "7.5h" },
      activeCaregivers: 1
    },
    { 
      name: "Eleanor Rigby", 
      img: "https://images.unsplash.com/photo-1544120190-275d3f2375fd?auto=format&fit=crop&q=80&w=400", 
      memory: "Blueberry Picking", 
      status: "Active",
      vitals: { bpm: 76, oxygen: 99, sleep: "6.8h" },
      activeCaregivers: 3
    },
  ];

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x * 20);
    mouseY.set(y * -20);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setHeartRate(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newVal = prev + change;
        return newVal > 85 ? 84 : newVal < 60 ? 61 : newVal;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        mouseX.set(0);
        mouseY.set(0);
      }}
      className="relative w-full aspect-[4/3] group perspective-2000"
    >
      <motion.div 
        style={{ rotateY: mouseX, rotateX: mouseY }}
        className="relative z-10 w-full h-full preserve-3d cursor-default"
      >
        {/* Shadow Casting Layer */}
        <div className="absolute inset-10 bg-black/20 blur-[60px] rounded-[60px] translate-z-[-50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Main Dashboard Card */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-3xl border border-white/80 rounded-[48px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] overflow-hidden">
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner"
                >
                  <Brain className="w-7 h-7 text-primary" />
                </motion.div>
                <div>
                  <h4 className="font-black text-xl tracking-tight text-slate-900 uppercase">Care OS</h4>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">System Online</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setResidentIndex((prev) => (prev + 1) % residents.length)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 text-white shadow-xl text-xs font-bold hover:bg-slate-800 transition-all duration-300"
                >
                  <Users className="w-3.5 h-3.5" />
                  Switch Resident
                </motion.button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-5 rounded-[32px] bg-white border border-slate-100 shadow-xl shadow-black/5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-rose-500" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Live Vitals</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700 uppercase">{residents[residentIndex].status}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <motion.span 
                          key={heartRate}
                          initial={{ opacity: 0.5, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-4xl font-black tracking-tighter text-slate-900"
                        >
                          {heartRate}
                        </motion.span>
                        <span className="text-[9px] font-black text-rose-500 uppercase">bpm</span>
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Heart Rate</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black tracking-tighter text-slate-900">{residents[residentIndex].vitals.oxygen}</span>
                        <span className="text-[9px] font-black text-primary uppercase">%</span>
                      </div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Oxygen</p>
                    </div>
                  </div>

                  <div className="mt-6 h-14 flex items-end gap-[4px]">
                    {[...Array(24)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          height: [10, (15 + Math.random() * 35), 10],
                          opacity: [0.3, 0.7, 0.3]
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 1.5, 
                          delay: i * 0.05,
                          ease: "easeInOut"
                        }}
                        className="w-full bg-rose-500/40 rounded-full"
                      />
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-5 rounded-[32px] bg-amber-50/70 border border-amber-200 shadow-xl shadow-amber-900/5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Memory Log</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={residentIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="text-sm font-bold text-slate-800 leading-tight group-hover:text-amber-800 transition-colors"
                    >
                      AI Discovery: <br/>
                      <span className="italic text-amber-600 font-black">"{residents[residentIndex].memory}"</span>
                    </motion.p>
                  </AnimatePresence>
                </motion.div>
              </div>

              <motion.div 
                key={residentIndex}
                initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                className="relative rounded-[40px] overflow-hidden bg-slate-200 shadow-2xl group/img"
              >
                <img 
                  src={residents[residentIndex].img} 
                  alt="Elder" 
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-2000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Resident View</p>
                  </div>
                  <p className="text-2xl font-black tracking-tight mb-3">{residents[residentIndex].name}</p>
                  
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].slice(0, residents[residentIndex].activeCaregivers).map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-300">
                            <img src={`https://i.pravatar.cc/100?u=${i + residentIndex}`} alt="caregiver" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{residents[residentIndex].activeCaregivers} Caregivers Connected</span>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="mt-8 flex items-center justify-between p-5 rounded-3xl bg-slate-900/5 border border-slate-900/10 group/cta cursor-pointer hover:bg-slate-900/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md">
                  <Smartphone className="w-6 h-6 text-slate-900" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Connected Device</p>
                  <p className="text-sm font-black text-slate-900">Health Hub v2.4 Active</p>
                </div>
              </div>
              <motion.div 
                whileHover={{ x: 5 }}
                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/20"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Floating Technical Elements */}
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-12 -right-12 z-20 p-5 rounded-[32px] bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
              <Lock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
              <p className="text-sm font-black text-slate-900">Encrypted</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-8 -left-12 z-20 p-5 rounded-[32px] bg-white/80 backdrop-blur-xl shadow-2xl border border-white/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">AI Assist</p>
              <p className="text-sm font-black text-slate-900">Ready to chat</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { isGuestMode } = useDemo();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const isNativeMobile = typeof window !== 'undefined' && (window as any).isNativeMobile;
  
  const scale = useTransform(scrollYProgress, [0.8, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0.8, 1], [1, 0.5]);
  
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'caregiver') navigate('/caregiver');
      else if (profile.role === 'elder') navigate('/elder');
    }
  }, [user, profile, loading, navigate]);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'Cognitive Sync',
      description: 'AI-powered memory companion that adapts to individual cognitive patterns.',
      color: 'bg-primary/10'
    },
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: 'Vitals Stream',
      description: 'Real-time biometric monitoring shared instantly with designated family.',
      color: 'bg-rose-500/10'
    },
    {
      icon: <Smartphone className="w-8 h-8 text-amber-500" />,
      title: 'Unified Hub',
      description: 'A single dashboard for caregivers to manage medication, mood, and safety.',
      color: 'bg-amber-500/10'
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: 'Bio-Privacy',
      description: 'Medical-grade encryption ensuring sensitive family data stays within the family.',
      color: 'bg-emerald-500/10'
    },
  ];

  return (
    <div className={cn(
      "min-h-screen bg-[#FDFCFB] text-[#1A1A1A] selection:bg-primary/20 relative overflow-hidden",
      isNativeMobile ? "overflow-y-auto" : "overflow-x-hidden"
    )}>
      {/* Advanced Animated Mesh Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Deep Vibrant Mesh Blobs */}
        <motion.div 
          animate={{ 
            x: [0, 150, 0],
            y: [0, 80, 0],
            scale: [1, 1.4, 1],
            rotate: [0, 45, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-15%] left-[-5%] w-[80vw] h-[80vw] rounded-full bg-primary/15 blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -120, 0],
            y: [0, -60, 0],
            scale: [1.2, 0.9, 1.2],
            rotate: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[90vw] h-[90vw] rounded-full bg-amber-200/25 blur-[140px]"
        />
        <motion.div 
          animate={{ 
            x: [0, 80, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[5%] w-[50vw] h-[50vw] rounded-full bg-rose-200/15 blur-[110px]"
        />

        {/* Dynamic Mouse Light Leak */}
        {!isNativeMobile && (
          <motion.div 
            className="absolute w-[1200px] h-[1200px] rounded-full opacity-30 mix-blend-soft-light blur-[160px] pointer-events-none"
            animate={{
              x: mousePosition.x - 600,
              y: mousePosition.y - 600,
            }}
            transition={{ type: 'spring', damping: 50, stiffness: 100 }}
            style={{
              background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.6) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Structured Technical Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06]" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, #0F172A 1px, transparent 1px),
              linear-gradient(to bottom, #0F172A 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
          }} 
        />
        
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #0F172A 1.5px, transparent 0)`,
            backgroundSize: '40px 40px' 
          }} 
        />

        {/* Grain/Texture */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3Y%3Cfilter id='noiseFilter'%3Y%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3Y%3C/filter%3Y%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3Y%3C/svg%3Y")` }}></div>
      </div>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className={cn("relative px-6", isNativeMobile ? "pt-10 pb-20" : "pt-32 pb-40")}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-12"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-primary/10 shadow-xl text-primary text-xs font-black uppercase tracking-widest"
              >
                <Sparkles className="w-4 h-4" />
                Next-Gen Care Intelligence
              </motion.div>
              
              <div className="space-y-6">
                <h1 className="text-7xl md:text-8xl font-black leading-[0.9] tracking-tighter text-slate-900">
                  Care <br/> 
                  <span className="text-primary italic">Redefined.</span>
                </h1>
                <p className="text-2xl text-slate-600 leading-tight max-w-xl font-medium tracking-tight">
                  The first AI-native ecosystem designed to bridge the gap between memory care and family connection.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 pt-4">
                <Link to="/auth">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="h-18 px-10 text-xl font-black rounded-[24px] w-full sm:w-auto shadow-2xl shadow-primary/30 bg-primary group overflow-hidden relative">
                      <span className="relative z-10 flex items-center gap-3">
                        Join the Future
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
                      </span>
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        animate={{ x: ['100%', '-100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </Button>
                  </motion.div>
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => setShowGuestModal(true)}
                    className="h-18 px-10 text-xl font-black rounded-[24px] w-full sm:w-auto border-2 border-slate-900 bg-transparent text-slate-900 hover:bg-slate-900 hover:text-white transition-all duration-500"
                  >
                    <Eye className="w-6 h-6 mr-3" />
                    Live Preview
                  </Button>
                </motion.div>
              </div>
              
              <div className="flex items-center gap-8 pt-6">
                <div className="flex -space-x-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-12 h-12 rounded-2xl border-4 border-[#FDFCFB] bg-slate-300 shadow-lg overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=user${i}`} alt="user" className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    {[...Array(5)].map((_, i) => <Heart key={i} className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />)}
                  </div>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Trusted by 4,200+ Global Families</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-tr from-primary/30 to-rose-400/30 blur-[60px] opacity-40 -z-10" />
              <InteractiveHero />
            </motion.div>
          </div>
        </section>

        {/* Meaningful Innovation Section: "Live Network" */}
        <section className="py-40 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="aspect-square relative flex items-center justify-center w-[450px] h-[450px] md:w-[600px] md:h-[600px] mx-auto">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                    
                    {/* Central Node */}
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="relative z-30 w-32 h-32 rounded-[40px] bg-slate-900 shadow-2xl flex items-center justify-center border border-white/20"
                    >
                      <Brain className="w-16 h-16 text-primary" />
                    </motion.div>
  
                    {/* Satellite Nodes */}
                    {[
                      { icon: <Heart className="w-6 h-6"/>, label: "Family", angle: 0 },
                      { icon: <Activity className="w-6 h-6"/>, label: "Biometrics", angle: 72 },
                      { icon: <Shield className="w-6 h-6"/>, label: "Privacy", angle: 144 },
                      { icon: <Globe className="w-6 h-6"/>, label: "Clinician", angle: 216 },
                      { icon: <MessageSquare className="w-6 h-6"/>, label: "AI Hub", angle: 288 },
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        animate={{ 
                          rotate: [node.angle, node.angle + 360],
                        }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 pointer-events-none"
                      >
                        <motion.div 
                          animate={{ rotate: [node.angle, node.angle - 360] }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[260px] w-24 h-24 rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 pointer-events-auto cursor-pointer hover:scale-110 transition-transform z-20"
                        >
                          <div className="text-primary">{node.icon}</div>
                          <span className="text-[10px] font-black uppercase tracking-tighter">{node.label}</span>
                        </motion.div>
                      </motion.div>
                    ))}
  
                    {/* Connecting Lines (SVG) */}
                    <svg className="absolute inset-0 w-full h-full opacity-20 z-10">
                      <circle cx="50%" cy="50%" r="260" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" className="text-primary" />
                    </svg>
                  </div>
                </div>

              <div className="space-y-10 order-1 lg:order-2">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900">A Living <br/><span className="text-primary">Care Network.</span></h2>
                  <p className="text-xl text-slate-600 font-medium leading-relaxed">
                    We don't just provide an app. We create a real-time neural connection between the elder, the family, and medical professionals. 
                  </p>
                </div>

                <div className="grid gap-6">
                  {[
                    { title: "AI-Driven Memory Retrieval", desc: "Our engine scans conversation patterns to surface dormant memories." },
                    { title: "Emergency Bio-Link", desc: "Instant alert system that triggers if vitals deviate from baseline." },
                    { title: "Intergenerational Legacy", desc: "Preserving stories in a digital vault for future generations." },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 10 }}
                      className="flex gap-5 items-start p-6 rounded-3xl bg-white/50 border border-slate-200 hover:border-primary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-40 px-6 bg-slate-900 text-white relative overflow-hidden rounded-[80px] mx-4 md:mx-10 mb-20">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #3B82F6 0%, transparent 50%)' }} />
          </div>
          
          <div className="max-w-7xl mx-auto space-y-24 relative z-10">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter">Engineered for Humanity.</h2>
              <p className="text-xl text-slate-400 font-medium">
                Advanced technology that fades into the background, letting life take center stage.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-slate-800 bg-slate-800/50 hover:bg-slate-800 transition-all duration-500 p-10 h-full rounded-[40px] group border">
                    <div className={`w-18 h-18 rounded-3xl ${feature.color} flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Innovative Interactive CTA Section */}
        <section className="py-40 px-6">
          <motion.div 
            style={{ scale, opacity }}
            className="max-w-6xl mx-auto bg-slate-900 p-1 rounded-[80px] shadow-[0_100px_100px_-50px_rgba(0,0,0,0.5)] overflow-hidden group"
          >
            <div className="bg-primary/5 rounded-[78px] p-16 md:p-32 text-center relative overflow-hidden">
              {/* Background Animation */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-10 pointer-events-none"
              >
                <Globe className="w-full h-full text-white" />
              </motion.div>

              <div className="relative z-10 space-y-12">
                <div className="space-y-6">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-black tracking-tighter text-white"
                  >
                    Care <span className="text-primary italic">Starts Here.</span>
                  </motion.h2>
                  <p className="text-2xl text-slate-300 max-w-2xl mx-auto font-medium tracking-tight">
                    Experience the tranquility of knowing your loved ones are connected, safe, and heard. 
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link to="/auth">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="h-20 px-12 text-2xl font-black rounded-full bg-white text-slate-900 hover:bg-primary hover:text-white shadow-2xl transition-all duration-500 group">
                        Enter Care OS
                        <Zap className="w-7 h-7 ml-3 group-hover:fill-current" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/auth">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="lg" className="h-20 px-12 text-2xl font-black rounded-full text-white hover:bg-white/10 border-4 border-white/20">
                        View Ecosystem
                      </Button>
                    </motion.div>
                  </Link>
                </div>

                <div className="pt-10 flex items-center justify-center gap-10 opacity-60">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">HIPAA Ready</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">AES-256 Secure</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      
      <GuestModeModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </div>
  );
};

export default Index;

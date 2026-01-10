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

  const InteractiveHero = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [heartRate, setHeartRate] = useState(72);
    const [residentIndex, setResidentIndex] = useState(0);
    const [showAlert, setShowAlert] = useState(false);

    const residents = [
      { name: "Margaret Wilson", img: "https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&q=80&w=400", memory: "1965 Summer Trip", status: "Stable" },
      { name: "Arthur Chen", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400", memory: "First Piano Recital", status: "Resting" },
      { name: "Eleanor Rigby", img: "https://images.unsplash.com/photo-1544120190-275d3f2375fd?auto=format&fit=crop&q=80&w=400", memory: "Blueberry Picking", status: "Active" },
    ];

    useEffect(() => {
      const interval = setInterval(() => {
        setHeartRate(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const newVal = prev + change;
          return newVal > 80 ? 79 : newVal < 65 ? 66 : newVal;
        });
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="relative w-full aspect-[4/3] group perspective-2000">
        <motion.div 
          className="relative z-10 w-full h-full preserve-3d cursor-default"
          initial={{ rotateY: -15, rotateX: 10 }}
          whileHover={{ rotateY: -5, rotateX: 2 }}
          transition={{ type: 'spring', stiffness: 80, damping: 25 }}
        >
          {/* Main Dashboard Card */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl border border-white/80 rounded-[48px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.12)] overflow-hidden">
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
                    <h4 className="font-extrabold text-xl tracking-tight">Care OS</h4>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Monitoring</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setResidentIndex((prev) => (prev + 1) % residents.length)}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-lg border border-slate-100 text-xs font-bold hover:bg-primary hover:text-white transition-all duration-300"
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
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-rose-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Vital Signs</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700 uppercase">{residents[residentIndex].status}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <motion.span 
                        key={heartRate}
                        initial={{ opacity: 0.5, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-black tracking-tighter text-slate-900"
                      >
                        {heartRate}
                      </motion.span>
                      <span className="text-xs font-bold text-muted-foreground uppercase">BPM</span>
                    </div>
                    <div className="mt-4 h-12 flex items-end gap-[3px]">
                      {[...Array(24)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            height: [12, 24 + Math.random() * 24, 12],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 1.2, 
                            delay: i * 0.04,
                            ease: "easeInOut"
                          }}
                          className="w-full bg-rose-500/30 rounded-full"
                        />
                      ))}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="p-5 rounded-[32px] bg-amber-50/50 border border-amber-100 shadow-xl shadow-amber-900/5 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Memory Sync</span>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 leading-snug group-hover:text-amber-700 transition-colors">
                      Latest discovery: <br/>
                      <span className="italic">"{residents[residentIndex].memory}"</span>
                    </p>
                  </motion.div>
                </div>

                <motion.div 
                  key={residentIndex}
                  initial={{ opacity: 0, scale: 0.95, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className="relative rounded-[40px] overflow-hidden bg-slate-100 shadow-2xl group/img"
                >
                  <img 
                    src={residents[residentIndex].img} 
                    alt="Elder" 
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Resident Profile</p>
                    <p className="text-2xl font-black tracking-tight">{residents[residentIndex].name}</p>
                    <div className="flex items-center gap-2 mt-2 opacity-80">
                      <div className="flex -space-x-2">
                        {[1,2].map(i => (
                          <div key={i} className="w-5 h-5 rounded-full border border-white overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?u=${i + residentIndex}`} alt="caregiver" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">2 Caregivers Active</span>
                    </div>
                  </div>
                  
                  {/* Photo Edit Badge */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[9px] font-bold text-white uppercase tracking-widest">
                      Live Feed
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 flex items-center justify-between p-5 rounded-3xl bg-primary/5 border border-primary/10 group/cta cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                    <Zap className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Quick Action</p>
                    <p className="text-sm font-black">Open Family Connect</p>
                  </div>
                </div>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30"
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Floating Decoration Cards */}
          <motion.div 
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, 2, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-16 -right-16 z-20 p-5 rounded-[32px] bg-white shadow-2xl shadow-black/10 border border-slate-50 hidden lg:block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">Security</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-base font-black tracking-tight text-slate-800">End-to-End</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ 
              y: [0, -25, 0],
              rotate: [0, -2, 0]
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-12 -left-16 z-20 p-5 rounded-[32px] bg-white shadow-2xl shadow-black/10 border border-slate-50 hidden lg:block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">AI Hub</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </div>
                <p className="text-base font-black tracking-tight text-slate-800">Assistant Ready</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Background Depth Effects */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-500/20 rounded-full blur-[120px] -z-10" />
      </div>
    );
  };

const Index = () => {
  const { user, profile, loading } = useAuth();
  const { isGuestMode } = useDemo();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const isNativeMobile = typeof window !== 'undefined' && (window as any).isNativeMobile;
  
  const scale = useTransform(scrollYProgress, [0, 1], [1, isNativeMobile ? 1 : 0.8]);
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
      title: 'Memory Preservation',
      description: 'AI-powered memory companion that helps seniors preserve and share their life stories.',
      color: 'bg-primary/10'
    },
    {
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      title: 'Family Connection',
      description: 'Keep the whole family connected with real-time updates and shared memories.',
      color: 'bg-rose-500/10'
    },
    {
      icon: <Users className="w-8 h-8 text-amber-500" />,
      title: 'Caregiver Support',
      description: 'Comprehensive tools for caregivers to monitor well-being and manage daily care.',
      color: 'bg-amber-500/10'
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: 'Secure & Private',
      description: 'Your family data is encrypted and protected with enterprise-grade security.',
      color: 'bg-emerald-500/10'
    },
  ];

  return (
    <div className={cn(
      "min-h-screen bg-white text-[#1A1A1A] selection:bg-primary/20 relative overflow-hidden",
      isNativeMobile ? "overflow-y-auto" : "overflow-x-hidden"
    )}>
      {/* Advanced Animated Mesh Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Base Mesh Gradients */}
        <div className="absolute inset-0 bg-[#FDFCFB]" />
        
        {/* Large Animated Blobs for "Mesh" feel */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-primary/10 blur-[120px] mix-blend-multiply"
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] rounded-full bg-amber-200/20 blur-[150px] mix-blend-multiply"
        />
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -80, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-rose-100/10 blur-[100px] mix-blend-multiply"
        />

        {/* Dynamic Interactive Light Leak */}
        {!isNativeMobile && (
          <motion.div 
            className="absolute w-[1000px] h-[1000px] rounded-full opacity-40 mix-blend-soft-light blur-[140px] pointer-events-none"
            animate={{
              x: mousePosition.x - 500,
              y: mousePosition.y - 500,
            }}
            transition={{ type: 'spring', damping: 40, stiffness: 150 }}
            style={{
              background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.5) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Enhanced Technical Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, #1A1A1A 1px, transparent 1px),
              linear-gradient(to bottom, #1A1A1A 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
            maskImage: 'radial-gradient(ellipse at center, black, transparent 80%)'
          }} 
        />
        
        {/* Subtle Dot Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.1]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #1A1A1A 1px, transparent 0)`,
            backgroundSize: '32px 32px' 
          }} 
        />

        {/* Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3Y%3Cfilter id='noiseFilter'%3Y%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3Y%3C/filter%3Y%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3Y%3C/svg%3Y")` }}></div>
      </div>

      <main className="relative z-10">
        {/* Removed old floating elements as they are integrated into Dynamic Background above */}

        {/* Hero Section */}
        <section className={cn("relative px-6", isNativeMobile ? "pt-10 pb-20" : "pt-32 pb-40")}>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={isNativeMobile ? { opacity: 1, y: 0 } : { opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-primary/10 shadow-sm text-primary text-sm font-bold">
                <Sparkles className="w-4 h-4" />
                Empowering Elder Independence
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                Preserve Every <span className="text-primary italic">Memory</span>.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl font-medium">
                The smart AI companion that helps seniors maintain cognitive health while keeping families closer than ever.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/auth">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button size="lg" className="h-16 px-8 text-lg font-bold rounded-2xl w-full sm:w-auto shadow-xl shadow-primary/20 bg-primary group">
                        Get Started Free
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={() => setShowGuestModal(true)}
                      className="h-16 px-8 text-lg font-bold rounded-2xl w-full sm:w-auto border-2 border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-700 group"
                    >
                      <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      View Demo
                    </Button>
                  </motion.div>
                </div>
              
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-xl border-2 border-white bg-slate-200 shadow-sm overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Joined by <span className="text-foreground font-bold">2,000+</span> happy families
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <InteractiveHero />
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-32 px-6 bg-white/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything you need for better care.</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                Comprehensive tools designed with empathy and accessibility in mind.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none bg-white hover:shadow-2xl transition-all duration-300 p-8 h-full rounded-3xl shadow-xl shadow-black/5 group">
                    <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <motion.div 
            style={{ scale }}
            className="max-w-5xl mx-auto text-center space-y-10 bg-primary p-16 md:p-24 rounded-[60px] shadow-2xl shadow-primary/20 text-white relative overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to transform elder care?</h2>
              <p className="text-xl text-white/80 max-w-xl mx-auto font-medium">
                Join thousands of families already using Elder AI to stay connected and provide better care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Link to="/auth">
                  <Button size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl bg-white text-primary hover:bg-slate-50 shadow-xl">
                    Get Started Now
                    <Zap className="w-5 h-5 ml-2 fill-current" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost" size="lg" className="h-16 px-10 text-lg font-bold rounded-2xl text-white hover:bg-white/10 border-2 border-white/20">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Sparkles className="w-32 h-32" />
            </div>
          </motion.div>
        </section>
      </main>
      
      <GuestModeModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
    </div>
  );
};

export default Index;

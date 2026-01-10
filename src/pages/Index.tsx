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
      "min-h-screen bg-[#FDFCFB] text-[#1A1A1A] selection:bg-primary/20 relative overflow-hidden",
      isNativeMobile ? "overflow-y-auto" : "overflow-x-hidden"
    )}>
      {/* Dynamic Innovative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Main Gradient Surface */}
        <div className="absolute inset-0 bg-[#FDFCFB]" />
        
        {/* Mouse Following Glow */}
        {!isNativeMobile && (
          <motion.div 
            className="absolute w-[800px] h-[800px] rounded-full opacity-30 mix-blend-soft-light blur-[120px] pointer-events-none"
            animate={{
              x: mousePosition.x - 400,
              y: mousePosition.y - 400,
            }}
            transition={{ type: 'spring', damping: 50, stiffness: 200 }}
            style={{
              background: 'radial-gradient(circle, rgba(var(--primary-rgb), 0.4) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Floating Abstract Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[100px]"
          />
          <motion.div 
            animate={{ 
              y: [0, 30, 0],
              rotate: [0, -10, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-amber-200/20 to-transparent blur-[120px]"
          />
        </div>

        {/* Grid & Noise Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, #1A1A1A 1px, transparent 0)`,
            backgroundSize: '48px 48px' 
          }} 
        />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3Y%3Cfilter id='noiseFilter'%3Y%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3Y%3C/filter%3Y%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3Y%3C/svg%3Y")` }}></div>
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
              <div className="relative z-10 rounded-[40px] border-[8px] border-white shadow-2xl overflow-hidden aspect-[4/3] bg-white">
                <img 
                  src="https://images.unsplash.com/photo-1581579186913-45ac3e6efe93?auto=format&fit=crop&q=80&w=800" 
                  alt="Elder using technology" 
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-xl flex items-center gap-4 border border-white/50">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary uppercase tracking-wider">Health Alert</p>
                      <p className="font-bold">Heart rate stable at 72 BPM</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent/10 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
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

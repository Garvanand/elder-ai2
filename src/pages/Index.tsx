import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Heart, Users, Shield, ArrowRight, Sparkles, CheckCircle2, Activity, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

const Index = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'caregiver') navigate('/caregiver');
      else if (profile.role === 'elder') navigate('/elder');
    }
  }, [user, profile, loading, navigate]);

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary" />,
      title: 'Cognitive Support',
      description: 'AI-driven memory retrieval designed for cognitive ease and dignity.',
      color: 'bg-blue-50'
    },
    {
      icon: <Activity className="w-8 h-8 text-rose-500" />,
      title: 'Real-time Insights',
      description: 'Caregivers monitor cognitive trends and behavioral signals passively.',
      color: 'bg-rose-50'
    },
    {
      icon: <Heart className="w-8 h-8 text-amber-500" />,
      title: 'Emotional Connection',
      description: 'Bridge the gap between family and elders with shared life highlights.',
      color: 'bg-amber-50'
    },
    {
      icon: <Shield className="w-8 h-8 text-emerald-500" />,
      title: 'Secure & Private',
      description: 'Enterprise-grade security ensuring memories stay within the family circle.',
      color: 'bg-emerald-50'
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] selection:bg-primary/20">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6 border-b border-black/5 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Memory Friend</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
              <a href="#features" className="hover:text-primary transition-colors">Features</a>
              <a href="#security" className="hover:text-primary transition-colors">Security</a>
            </nav>
            {!loading && user && profile ? (
              <Button onClick={() => navigate(`/${profile.role}`)} className="rounded-full px-6 shadow-xl shadow-primary/20">
                Go to Dashboard
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth" className="hidden sm:block text-sm font-semibold px-4">Sign In</Link>
                <Link to="/auth">
                  <Button className="rounded-full px-6 shadow-xl shadow-primary/20">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                Trusted by 5,000+ families
              </div>
              <h1 className="text-6xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                A digital <span className="text-primary italic">companion</span> for every memory.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                The first emotionally intelligent platform designed to preserve life stories for elders while providing real-time peace of mind for families.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="h-16 px-10 text-lg rounded-2xl w-full sm:w-auto shadow-2xl shadow-primary/30">
                    Join as an Elder
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="outline" size="lg" className="h-16 px-10 text-lg rounded-2xl w-full sm:w-auto border-2 hover:bg-black/5">
                    I&apos;m a Caregiver
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[40px] border-[12px] border-white shadow-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-primary/20 to-rose-500/20">
                <div className="absolute inset-0 flex items-center justify-center p-12">
                  <div className="w-full space-y-4">
                    <div className="p-6 bg-white rounded-3xl shadow-xl flex gap-4 animate-slide-up">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">Memory Captured</p>
                        <p className="text-xs text-muted-foreground">"I remember my first day in London, 1968..."</p>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-3xl shadow-xl flex gap-4 animate-slide-up [animation-delay:0.2s]">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-rose-500" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">Insight for Family</p>
                        <p className="text-xs text-muted-foreground">Cognitive engagement is 15% higher this week.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
              <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-rose-500/20 rounded-full blur-2xl" />
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold tracking-tight">Designed for trust and dignity</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We combine empathetic AI with clinical-adjacent insights to support both elders and their support network.
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
                  <Card className="border-none shadow-none hover:bg-slate-50 transition-colors p-8 h-full">
                    <div className={`w-16 h-16 rounded-[24px] ${feature.color} flex items-center justify-center mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                Empowering the <span className="text-primary italic">golden years</span> with technology that cares.
              </h2>
              <div className="space-y-6">
                {[
                  { title: "One-tap Memory Capture", desc: "No complex forms. Just talk or type, and our AI does the rest." },
                  { title: "Intelligent Q&A", desc: "Natural language retrieval that feels like talking to a friend." },
                  { title: "Behavioral Alert System", desc: "Peace of mind for families through automated signal detection." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <blockquote className="text-2xl font-medium italic leading-relaxed">
                  "This app changed our family dynamic. My grandmother feels heard, and I finally have clarity on how she's doing day-to-day."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800" />
                  <div>
                    <p className="font-bold">Sarah Jenkins</p>
                    <p className="text-sm text-slate-400">Primary Caregiver</p>
                  </div>
                </div>
              </div>
              <Brain className="absolute right-[-20%] bottom-[-20%] w-64 h-64 text-white/5" />
            </div>
          </div>
        </section>

        {/* Trust/Security Section */}
        <section id="security" className="py-24 px-6 border-t border-black/5 bg-[#FDFDFD]">
          <div className="max-w-7xl mx-auto text-center space-y-12">
            <div className="flex justify-center">
              <Shield className="w-16 h-16 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold">Your privacy is our baseline.</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-bold mb-2">End-to-End Encryption</h4>
                <p className="text-sm text-muted-foreground">All memory data is encrypted at rest and in transit.</p>
              </div>
              <div>
                <h4 className="font-bold mb-2">Role-Based Access</h4>
                <p className="text-sm text-muted-foreground">Strict permission controls ensure only linked caregivers have access.</p>
              </div>
              <div>
                <h4 className="font-bold mb-2">HIPAA Compliant Architecture</h4>
                <p className="text-sm text-muted-foreground">Built on infrastructure designed for sensitive healthcare data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-12 bg-primary p-16 rounded-[48px] shadow-2xl shadow-primary/20 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h2 className="text-5xl font-bold">Start your journey today.</h2>
              <p className="text-xl text-white/80 max-w-xl mx-auto">
                Join thousands of families who are preserving memories with dignity and care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/auth">
                  <Button size="lg" className="h-16 px-12 text-lg rounded-2xl bg-white text-primary hover:bg-slate-100 shadow-xl">
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="ghost" size="lg" className="h-16 px-12 text-lg rounded-2xl text-white hover:bg-white/10">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="w-12 h-12 text-white/20 animate-pulse" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-black/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" />
            <span className="font-bold">Memory Friend</span>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Contact Support</a>
          </div>
          <p className="text-sm text-muted-foreground">© 2025 Memory Friend. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

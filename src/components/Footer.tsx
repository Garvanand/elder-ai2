import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Phone, LifeBuoy, Brain, Shield, Zap, Activity, Globe, Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="relative w-full py-20 px-6 mt-20">
      {/* Neural Link Decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Futuristic Background Container */}
      <div className="max-w-7xl mx-auto relative group">
        {/* Background Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-purple-600/20 rounded-[48px] blur-2xl group-hover:blur-3xl transition-all duration-1000 opacity-50" />
        
        <div className="relative bg-slate-950/90 backdrop-blur-3xl border border-white/10 rounded-[48px] p-12 md:p-20 overflow-hidden shadow-2xl">
          {/* Animated Background Patterns */}
          <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
            <Globe className="w-96 h-96 text-primary animate-spin-[60s]" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 relative z-10">
            {/* Brand Intelligence Column */}
            <div className="lg:col-span-5 space-y-10">
              <Link to="/" className="flex items-center gap-4 group/logo">
                <div className="p-3 bg-gradient-to-br from-primary via-primary to-purple-600 rounded-2xl text-white shadow-2xl shadow-primary/20 group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500">
                  <Brain className="w-8 h-8" />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black tracking-tighter uppercase text-white leading-none">
                    Memory<span className="text-primary italic">Friend</span>
                  </span>
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase text-primary/60 mt-1">Neural Core v1.0.4</span>
                </div>
              </Link>
              
              <p className="text-white/60 text-xl leading-relaxed max-w-md font-medium">
                The world's first emotionally aware decentralised ecosystem designed to preserve human legacy through <span className="text-white">Neural Synthesis</span>.
              </p>

              <div className="flex gap-4">
                {[
                  { icon: Twitter, href: "#", color: "hover:bg-sky-500" },
                  { icon: Linkedin, href: "#", color: "hover:bg-blue-600" },
                  { icon: Github, href: "#", color: "hover:bg-slate-800" },
                  { icon: Heart, href: "#", color: "hover:bg-rose-500" }
                ].map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ y: -8, scale: 1.1 }}
                    className={`p-4 bg-white/5 rounded-2xl text-white/40 hover:text-white transition-all duration-500 border border-white/5 ${social.color} hover:shadow-2xl hover:border-transparent`}
                  >
                    <social.icon size={24} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Navigation Matrix */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-8">
              <div className="space-y-8">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Ecosystem</h4>
                <ul className="space-y-5">
                  {[
                    { label: "Elder Portal", to: "/elder" },
                    { label: "Caregiver Axis", to: "/caregiver" },
                    { label: "Clinical Suite", to: "/clinician" },
                    { label: "Family Cloud", to: "/family" }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-white/40 hover:text-white transition-all font-bold hover:pl-3 duration-300 block text-lg group/link">
                        <span className="group-hover/link:text-primary transition-colors inline-block mr-2 opacity-0 group-hover/link:opacity-100 -ml-4 group-hover/link:ml-0">•</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-accent">Intelligence</h4>
                <ul className="space-y-5">
                  {[
                    { label: "Smart Help", to: "/support" },
                    { label: "Neural FAQ", to: "/support" },
                    { label: "Network Status", to: "#" },
                    { label: "Uplink Docs", to: "#" }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-white/40 hover:text-white transition-all font-bold hover:pl-3 duration-300 block text-lg group/link">
                        <span className="group-hover/link:text-accent transition-colors inline-block mr-2 opacity-0 group-hover/link:opacity-100 -ml-4 group-hover/link:ml-0">•</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-8 col-span-2 sm:col-span-1">
                <h4 className="text-sm font-black uppercase tracking-[0.3em] text-purple-400">Governance</h4>
                <ul className="space-y-5">
                  {[
                    { label: "Privacy Protocol", to: "/privacy" },
                    { label: "Terms of Ops", to: "/terms" },
                    { label: "Bio-Ethics", to: "#" },
                    { label: "Security Lab", to: "#" }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-white/40 hover:text-white transition-all font-bold hover:pl-3 duration-300 block text-lg group/link">
                        <span className="group-hover/link:text-purple-400 transition-colors inline-block mr-2 opacity-0 group-hover/link:opacity-100 -ml-4 group-hover/link:ml-0">•</span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Terminal Bar */}
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex flex-col md:flex-row items-center gap-10 text-sm font-black uppercase tracking-widest">
              <div className="flex items-center gap-3 text-white/30 hover:text-white transition-colors cursor-pointer group/contact">
                <div className="p-2 rounded-lg bg-white/5 group-hover/contact:bg-primary/20 group-hover/contact:text-primary transition-all">
                  <Mail size={16} />
                </div>
                garvanand03@gmail.com
              </div>
              <div className="flex items-center gap-3 text-white/30 hover:text-white transition-colors cursor-pointer group/contact">
                <div className="p-2 rounded-lg bg-white/5 group-hover/contact:bg-primary/20 group-hover/contact:text-primary transition-all">
                  <Phone size={16} />
                </div>
                +91 80541 82892
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-xs font-black uppercase tracking-[0.3em] text-white/10">
                © 2025 ALL PROTOCOLS RESERVED
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Network: Stable
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Floating Help Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="fixed bottom-10 right-10 z-50"
      >
        <Link 
          to="/support"
          className="relative flex items-center gap-4 p-5 bg-primary text-white rounded-3xl shadow-[0_20px_60px_rgba(var(--primary-rgb),0.5)] hover:scale-110 transition-all duration-500 group overflow-hidden border border-white/20"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          <div className="relative z-10 p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div className="relative z-10 flex flex-col pr-2">
            <span className="font-black tracking-[0.2em] uppercase text-[10px] opacity-70 leading-none mb-1">Support</span>
            <span className="font-black tracking-widest uppercase text-xs leading-none">AI Assistant</span>
          </div>
        </Link>
      </motion.div>
    </footer>
  );
};

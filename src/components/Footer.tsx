import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Phone, Brain, Globe, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="relative w-full py-8 px-6 mt-8">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="relative bg-slate-950/70 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 md:p-8 overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Globe className="w-40 h-40 text-primary" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
            <div className="lg:col-span-4 space-y-4">
              <Link to="/" className="flex items-center gap-2 group/logo">
                <div className="p-1.5 bg-gradient-to-br from-primary to-purple-600 rounded-lg text-white">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter uppercase text-white leading-none">
                    Memory<span className="text-primary italic">Friend</span>
                  </span>
                  <span className="text-[7px] font-black tracking-[0.3em] uppercase text-primary/50">v1.0.4</span>
                </div>
              </Link>
              
              <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                AI-powered memory care platform for elders and caregivers.
              </p>

              <div className="flex gap-2">
                {[
                  { icon: Twitter, href: "#" },
                  { icon: Linkedin, href: "#" },
                  { icon: Github, href: "#" }
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="p-2 bg-white/5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                  >
                    <social.icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Platform</h4>
                <ul className="space-y-2">
                  {[
                    { label: "Elder Portal", to: "/elder" },
                    { label: "Caregiver", to: "/caregiver" },
                    { label: "Clinician", to: "/clinician" },
                    { label: "Family", to: "/family" }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-white/30 hover:text-white transition-colors text-xs font-semibold">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Resources</h4>
                <ul className="space-y-2">
                  {[
                    { label: "Support", to: "/support" },
                    { label: "Status", to: "/status" },
                    { label: "Docs", to: "/docs" },
                    { label: "Security", to: "/security" }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-white/30 hover:text-white transition-colors text-xs font-semibold">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Legal</h4>
                <ul className="space-y-2">
                  {[
                    { label: "Privacy", to: "/privacy" },
                    { label: "Terms", to: "/terms" }
                  ].map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="text-white/30 hover:text-white transition-colors text-xs font-semibold">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-[9px] font-semibold text-white/20">
              <div className="flex items-center gap-1.5">
                <Mail size={10} />
                garvanand03@gmail.com
              </div>
              <div className="flex items-center gap-1.5">
                <Phone size={10} />
                +91 80541 82892
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[8px] font-semibold text-white/10">© 2025 MemoryFriend</span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[7px] font-bold border border-emerald-500/20">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: "spring" }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Link 
          to="/support"
          className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-105 transition-all group"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-bold text-xs">Help</span>
        </Link>
      </motion.div>
    </footer>
  );
};

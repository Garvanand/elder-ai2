import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Phone, LifeBuoy, Brain, Shield, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden pt-24 pb-12 px-6">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black/80 -z-20" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Decorative Circles */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-4 space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-2.5 bg-gradient-to-br from-primary to-purple-600 rounded-xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                <Brain className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-white">
                Memory<span className="text-primary italic">Friend</span>
              </span>
            </Link>
            
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Architecting the future of human legacy through empathetic AI. We preserve cognitive elasticity and ensure no memory is ever lost.
            </p>

            <div className="flex gap-5">
              {[
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Github, href: "#" }
              ].map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  whileHover={{ y: -5, scale: 1.1 }}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/40 hover:text-primary transition-all duration-300 border border-white/5"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Ecosystem</h4>
              <ul className="space-y-4">
                {[
                  { label: "Elder Portal", to: "/elder" },
                  { label: "Caregiver Axis", to: "/caregiver" },
                  { label: "Clinical Suite", to: "/clinician" },
                  { label: "Family Cloud", to: "/family" }
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-white/60 hover:text-primary transition-colors font-medium hover:pl-2 duration-300 block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Intelligence</h4>
              <ul className="space-y-4">
                {[
                  { label: "Smart Help", to: "/support" },
                  { label: "Neural FAQ", to: "/support" },
                  { label: "Status Page", to: "#" },
                  { label: "API Docs", to: "#" }
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-white/60 hover:text-primary transition-colors font-medium hover:pl-2 duration-300 block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6 col-span-2 sm:col-span-1">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Governance</h4>
              <ul className="space-y-4">
                {[
                  { label: "Privacy Protocol", to: "/privacy" },
                  { label: "Terms of Ops", to: "/terms" },
                  { label: "Bio-Ethics", to: "#" },
                  { label: "Security Lab", to: "#" }
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-white/60 hover:text-primary transition-colors font-medium hover:pl-2 duration-300 block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-sm text-white/30 font-medium">
            <span className="flex items-center gap-2">
              <Mail size={14} className="text-primary" /> garvanand03@gmail.com
            </span>
            <span className="flex items-center gap-2">
              <Phone size={14} className="text-primary" /> +91 80541 82892
            </span>
          </div>
          
          <div className="text-xs font-black uppercase tracking-widest text-white/20">
            © 2025 Neural Core v1.0.4 • Pulse: Stable
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring" }}
        className="fixed bottom-8 right-8 z-50"
      >
        <Link 
          to="/support"
          className="relative flex items-center gap-3 p-4 bg-primary text-white rounded-2xl shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <LifeBuoy className="w-5 h-5 relative z-10 animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-xs relative z-10 pr-1">Intelligent Help</span>
        </Link>
      </motion.div>
    </footer>
  );
};

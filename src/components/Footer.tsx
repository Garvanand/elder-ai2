import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Phone, LifeBuoy } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full bg-black/40 backdrop-blur-xl border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Elder AI
          </h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Revolutionizing elder care through compassionate AI technology, keeping memories alive and families connected.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-white transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Product</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><Link to="/elder" className="hover:text-cyan-400 transition-colors">For Elders</Link></li>
            <li><Link to="/caregiver" className="hover:text-cyan-400 transition-colors">For Caregivers</Link></li>
            <li><Link to="/clinician" className="hover:text-cyan-400 transition-colors">For Clinicians</Link></li>
            <li><Link to="/family" className="hover:text-cyan-400 transition-colors">For Families</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><Link to="/support" className="hover:text-cyan-400 transition-colors">Support Center</Link></li>
            <li><Link to="/support" className="hover:text-cyan-400 transition-colors">Help Bot</Link></li>
            <li><Link to="/support" className="hover:text-cyan-400 transition-colors">FAQ</Link></li>
            <li><Link to="/support" className="hover:text-cyan-400 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-6">Legal</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li><Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/support" className="hover:text-cyan-400 transition-colors">Accessibility</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-white/40 text-sm">
          © 2025 Elder AI. All rights reserved.
        </p>
        <div className="flex gap-8 text-sm text-white/40">
          <span className="flex items-center gap-2">
            <Mail size={16} /> garvanand03@gmail.com
          </span>
          <span className="flex items-center gap-2">
            <Phone size={16} /> +91 80541 82892
          </span>
        </div>
      </div>

      {/* Floating Help Button */}
      <Link 
        to="/support"
        className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full shadow-lg shadow-cyan-500/20 hover:scale-110 transition-transform flex items-center gap-2 group"
      >
        <LifeBuoy className="text-white group-hover:rotate-45 transition-transform" />
        <span className="text-white font-medium pr-2 max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-300">
          Help
        </span>
      </Link>
    </footer>
  );
};

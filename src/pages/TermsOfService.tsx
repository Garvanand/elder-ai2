import { motion } from "framer-motion";
import { ShieldCheck, Scale, FileText } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-4">
              <Scale size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900">
              Terms of <span className="text-primary italic">Operations</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last updated: December 31, 2025</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                1. Welcome to MemoryFriend
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">
                Welcome to MemoryFriend! By accessing or using our website, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of the terms, please refrain from using our website. We reserve the right to modify or update these terms at any time, and your continued use of the website indicates acceptance of any changes.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                2. Use of Website
              </h2>
              <ul className="space-y-4 text-slate-600 font-medium list-none">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  You agree to use the website for lawful purposes only.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  You may not engage in any activity that could harm, disable, or overburden the website.
                </li>
              </ul>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">3. User Account</h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">
                You may need to register for an account to access certain features. You are responsible for maintaining the confidentiality of your account details.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">4. Content Ownership</h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">
                All content, logos, images, and software on the website are owned by MemoryFriend or its licensors. You may not use, reproduce, or distribute any of this content without permission.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">5. Limitation of Liability</h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">
                MemoryFriend is not liable for any damages arising from the use or inability to use the website.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">6. Governing Law</h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">
                These Terms of Service are governed by the laws of India.
              </p>
            </section>
          </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;

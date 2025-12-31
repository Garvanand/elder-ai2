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
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-400 mb-4">
            <Scale size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Terms of Service
          </h1>
          <p className="text-white/60">Last updated: December 31, 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <ShieldCheck className="text-purple-400" />
              1. Welcome to Elder AI
            </h2>
            <p className="text-white/70 leading-relaxed">
              Welcome to Elder AI! By accessing or using our website, you agree to comply with and be bound by these Terms of Service. If you disagree with any part of the terms, please refrain from using our website. We reserve the right to modify or update these terms at any time, and your continued use of the website indicates acceptance of any changes.
            </p>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <FileText className="text-cyan-400" />
              2. Use of Website
            </h2>
            <ul className="list-disc list-inside space-y-3 text-white/70">
              <li>You agree to use the website for lawful purposes only.</li>
              <li>You may not engage in any activity that could harm, disable, or overburden the website.</li>
            </ul>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Account</h2>
            <p className="text-white/70 leading-relaxed">
              You may need to register for an account to access certain features. You are responsible for maintaining the confidentiality of your account details.
            </p>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4">4. Content Ownership</h2>
            <p className="text-white/70 leading-relaxed">
              All content, logos, images, and software on the website are owned by Elder AI or its licensors. You may not use, reproduce, or distribute any of this content without permission.
            </p>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
            <p className="text-white/70 leading-relaxed">
              Elder AI is not liable for any damages arising from the use or inability to use the website.
            </p>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4">6. Governing Law</h2>
            <p className="text-white/70 leading-relaxed">
              These Terms of Service are governed by the laws of India.
            </p>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;

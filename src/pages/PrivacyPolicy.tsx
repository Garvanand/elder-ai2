import { motion } from "framer-motion";
import { Lock, Eye, Cookie, UserCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Privacy Policy
          </h1>
          <p className="text-white/60">Last updated: December 31, 2025</p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <p className="text-xl text-white/80 leading-relaxed text-center italic">
            "We respect your privacy and are committed to protecting your personal data."
          </p>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <Eye className="text-purple-400" />
              Data Collection
            </h2>
            <ul className="list-disc list-inside space-y-3 text-white/70">
              <li>We collect personal information such as your name, email, and phone number when you register or contact us through the website.</li>
              <li>We may collect non-personal information like browser type and IP address for analytical purposes.</li>
            </ul>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4">Use of Data</h2>
            <p className="text-white/70 leading-relaxed">
              The data we collect is used to improve the user experience, provide customer support, and communicate relevant updates. We will never share your personal information with third parties unless required by law.
            </p>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-purple-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <Cookie className="text-purple-400" />
              Cookies
            </h2>
            <p className="text-white/70 leading-relaxed">
              Our website uses cookies to enhance user experience. You can adjust your cookie preferences in your browser settings.
            </p>
          </section>

          <section className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:border-cyan-500/30 transition-colors">
            <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-3">
              <UserCheck className="text-cyan-400" />
              Data Security & Rights
            </h2>
            <div className="space-y-4 text-white/70">
              <p>
                We implement strict security measures to protect your data from unauthorized access, loss, or misuse.
              </p>
              <p>
                <strong>User Rights:</strong> You can request access, correction, or deletion of your personal data by contacting us.
              </p>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;

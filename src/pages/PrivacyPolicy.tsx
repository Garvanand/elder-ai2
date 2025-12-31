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
            <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-slate-900">
              Privacy <span className="text-primary italic">Protocol</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Last updated: December 31, 2025</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8">
            <p className="text-2xl text-slate-600 leading-relaxed text-center font-medium italic">
              "We respect your privacy and are architecting systems to protect your biological and digital legacy."
            </p>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <Eye size={24} />
                </div>
                Data Collection
              </h2>
              <ul className="space-y-4 text-slate-600 font-medium list-none">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  We collect personal information such as your name, email, and phone number when you register or contact us through the website.
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  We may collect non-personal information like browser type and IP address for analytical purposes.
                </li>
              </ul>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tighter">Use of Data</h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">
                The data we collect is used to improve the user experience, provide customer support, and communicate relevant updates. We will never share your personal information with third parties unless required by law.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <Cookie size={24} />
                </div>
                Cookies
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed text-lg">
                Our website uses cookies to enhance user experience. You can adjust your cookie preferences in your browser settings.
              </p>
            </section>

            <section className="bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white shadow-2xl shadow-black/5 hover:bg-white transition-all duration-500 group">
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-2 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                  <UserCheck size={24} />
                </div>
                Data Security & Rights
              </h2>
              <div className="space-y-6 text-slate-600 font-medium text-lg">
                <p>
                  We implement strict security measures to protect your data from unauthorized access, loss, or misuse.
                </p>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-black text-slate-900 uppercase tracking-widest text-sm mb-2">User Rights</p>
                  <p>You can request access, correction, or deletion of your personal data by contacting us.</p>
                </div>
              </div>
            </section>
          </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Video, 
  Search, 
  HelpCircle, 
  ArrowRight, 
  Send, 
  User, 
  Stethoscope, 
  Heart, 
  Users,
  ChevronDown,
  Volume2,
  CheckCircle2,
  LifeBuoy,
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSupportAIResponse } from "@/lib/ai";
import { toast } from "sonner";

const CATEGORIES = [
  { id: 'elder', label: 'Elders', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { id: 'caregiver', label: 'Caregivers', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'clinician', label: 'Clinicians', icon: Stethoscope, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'family', label: 'Families', icon: User, color: 'text-orange-400', bg: 'bg-orange-400/10' },
];

const Support = () => {
  const [activeCategory, setActiveCategory] = useState('elder');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! How can I help you today? I'm your Elder AI support assistant." }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Text to Speech for Accessibility
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsAiLoading(true);
    try {
      const response = await getSupportAIResponse(searchQuery, activeCategory);
      setAiResponse(response);
    } catch (error) {
      toast.error("Failed to get AI help. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsAiLoading(true);
    const response = await getSupportAIResponse(userMsg, activeCategory);
    setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsAiLoading(false);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketStatus('sending');
    
    // Simulate routing to email/phone
    setTimeout(() => {
      setTicketStatus('success');
      toast.success("Ticket submitted! Our team will contact you shortly.");
      setTimeout(() => setTicketStatus('idle'), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-20 pb-32">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium border border-cyan-500/20"
        >
          <LifeBuoy size={16} /> 24/7 Intelligent Support
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient-x">
          How can we help you today?
        </h1>
        <p className="text-xl text-white/60 max-w-2xl mx-auto">
          Choose your category for personalized assistance or use our AI-powered Smart Help system.
        </p>
      </section>

      {/* Category Selection */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {CATEGORIES.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat.id)}
            className={`p-8 rounded-3xl border transition-all duration-300 flex flex-col items-center gap-4 text-center ${
              activeCategory === cat.id 
              ? 'bg-white/10 border-white/20 shadow-lg shadow-white/5' 
              : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}
          >
            <div className={`p-4 rounded-2xl ${cat.bg} ${cat.color}`}>
              <cat.icon size={32} />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${activeCategory === cat.id ? 'text-white' : 'text-white/60'}`}>
                {cat.label}
              </h3>
            </div>
          </motion.button>
        ))}
      </section>

      {/* Smart Help AI Section */}
      <section className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-[2rem] p-8 md:p-12 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <HelpCircle size={200} className="text-cyan-400" />
        </div>
        
        <div className="relative z-10 max-w-3xl space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Search size={24} />
              </span>
              Smart Help AI
            </h2>
            <p className="text-white/60">Ask anything! Our AI will find the best answers and guides for you.</p>
          </div>

          <form onSubmit={handleAiSearch} className="flex gap-4 p-2 bg-black/40 rounded-2xl border border-white/10">
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. How do I add a memory?"
              className="bg-transparent border-none text-lg h-12 focus-visible:ring-0 placeholder:text-white/30"
            />
            <Button 
              disabled={isAiLoading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl px-8 h-12"
            >
              {isAiLoading ? <Loader2 className="animate-spin" /> : "Ask AI"}
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <p className="text-lg text-white/80 leading-relaxed">{aiResponse}</p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/40 hover:text-white"
                    onClick={() => speak(aiResponse)}
                  >
                    <Volume2 size={20} />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="link" className="text-cyan-400 p-0 h-auto flex items-center gap-2">
                    View full guide <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Multi-Channel Support Tabs */}
      <section className="space-y-8">
        <h2 className="text-3xl font-bold text-white text-center">More Support Options</h2>
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/5 p-1 rounded-2xl h-auto">
            <TabsTrigger value="faq" className="rounded-xl py-4 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">FAQ</TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-xl py-4 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">Ticket System</TabsTrigger>
            <TabsTrigger value="video" className="rounded-xl py-4 data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400">Video Support</TabsTrigger>
            <TabsTrigger value="phone" className="rounded-xl py-4 data-[state=active]:bg-rose-500/20 data-[state=active]:text-rose-400">Phone & Email</TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="faq" className="space-y-6">
              <Accordion type="single" collapsible className="space-y-4">
                {[
                  { q: "How do I reset my password?", a: "Go to the login page, click 'Forgot Password', and follow the instructions sent to your registered email." },
                  { q: "Can I manage multiple elder accounts?", a: "Yes, caregivers can link multiple elders from their dashboard. Go to 'Settings' > 'Link Elder'." },
                  { q: "Is my medical data secure?", a: "Absolutely. We use end-to-end encryption and follow strict HIPAA-compliant practices for all health-related data." },
                  { q: "How does the AI memory extraction work?", a: "Our AI analyzes your conversations or voice logs to automatically identify events, people, and emotions, organizing them into a visual timeline." }
                ].map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-white/5 border border-white/10 rounded-2xl px-6 border-none overflow-hidden">
                    <AccordionTrigger className="text-lg font-medium text-white/90 hover:no-underline hover:text-cyan-400">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-white/60 text-lg leading-relaxed pb-6">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="tickets">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white">Open a Support Ticket</h3>
                  <p className="text-white/60 leading-relaxed">
                    Have a complex issue? Submit a ticket and our technical team will get back to you within 24 hours.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-cyan-400">
                      <CheckCircle2 size={20} />
                      <span>Direct route to garvanand03@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-purple-400">
                      <CheckCircle2 size={20} />
                      <span>Priority tracking for clinicians</span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmitTicket} className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Issue Type</label>
                    <select className="w-full bg-black/40 border-white/10 rounded-xl p-3 text-white focus:ring-cyan-500">
                      <option>Technical Issue</option>
                      <option>Account Access</option>
                      <option>Billing</option>
                      <option>Feature Request</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Description</label>
                    <Textarea 
                      placeholder="Tell us what's happening..." 
                      className="bg-black/40 border-white/10 rounded-xl h-32"
                    />
                  </div>
                  <Button 
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl py-6"
                    disabled={ticketStatus !== 'idle'}
                  >
                    {ticketStatus === 'sending' ? <Loader2 className="animate-spin" /> : 
                     ticketStatus === 'success' ? "Ticket Sent!" : "Submit Ticket"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-12">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: "Getting Started", duration: "2:45", thumbnail: "bg-purple-500/20" },
                  { title: "Managing Memories", duration: "4:12", thumbnail: "bg-cyan-500/20" },
                  { title: "Health Monitoring", duration: "3:30", thumbnail: "bg-rose-500/20" },
                ].map((v, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05 }}
                    className="group cursor-pointer space-y-4"
                  >
                    <div className={`aspect-video rounded-2xl ${v.thumbnail} border border-white/10 flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                      <div className="p-4 rounded-full bg-white/20 backdrop-blur-md group-hover:scale-110 transition-transform">
                        <Video size={32} className="text-white" />
                      </div>
                      <span className="absolute bottom-4 right-4 text-xs font-mono bg-black/60 px-2 py-1 rounded text-white">{v.duration}</span>
                    </div>
                    <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{v.title}</h4>
                  </motion.div>
                ))}
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Need Hands-on Help?</h3>
                  <p className="text-white/60">Schedule a 1-on-1 video call with our support specialists.</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-8 py-6 h-auto">
                  Schedule a Call
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-rose-500/5 border border-rose-500/10 space-y-6">
                <div className="p-4 w-fit rounded-2xl bg-rose-500/20 text-rose-400">
                  <Phone size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Direct Hotline</h3>
                <p className="text-white/60 leading-relaxed">Call us directly for urgent matters. Available 9 AM - 6 PM IST.</p>
                <div className="text-2xl font-mono text-rose-400">+91 80541 82892</div>
                <Button variant="outline" className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10">Request Call-back</Button>
              </div>
              <div className="p-8 rounded-3xl bg-cyan-500/5 border border-cyan-500/10 space-y-6">
                <div className="p-4 w-fit rounded-2xl bg-cyan-500/20 text-cyan-400">
                  <Mail size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">Email Support</h3>
                <p className="text-white/60 leading-relaxed">Send us your detailed queries and we'll reply within a business day.</p>
                <div className="text-2xl font-mono text-cyan-400">garvanand03@gmail.com</div>
                <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">Draft Email</Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      {/* Floating Chat Bot UI */}
      <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-80 md:w-96 h-[500px] bg-black/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-purple-600/80 to-cyan-600/80 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <MessageSquare size={18} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Instant Help</h4>
                    <span className="text-white/60 text-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> AI Agent Online
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/60 hover:text-white"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                      ? 'bg-cyan-500 text-white rounded-tr-none' 
                      : 'bg-white/10 text-white/80 rounded-tl-none border border-white/5'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce delay-100" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce delay-200" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="bg-black/40 border-white/10 rounded-xl"
                />
                <Button size="icon" className="bg-cyan-500 hover:bg-cyan-600 shrink-0" onClick={handleSendMessage}>
                  <Send size={18} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button 
          size="lg"
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="rounded-full w-16 h-16 bg-gradient-to-r from-purple-600 to-cyan-600 shadow-xl shadow-cyan-500/20 group"
        >
          {isChatOpen ? <X size={28} /> : <MessageSquare size={28} className="group-hover:scale-110 transition-transform" />}
        </Button>
      </div>
    </div>
  );
};

export default Support;

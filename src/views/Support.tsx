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
  Loader2,
  Zap,
  Database,
  Activity,
  Brain,
  History,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { getSupportAIResponse } from "@/lib/ai";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: 'elder', label: 'Elders', icon: Heart, color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { id: 'caregiver', label: 'Caregivers', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'clinician', label: 'Clinicians', icon: Stethoscope, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'family', label: 'Families', icon: User, color: 'text-orange-400', bg: 'bg-orange-400/10' },
];

const Support = () => {
  const [activeCategory, setActiveCategory] = useState('elder');
  const [searchQuery, setSearchQuery] = useState('');
  const [faqFilter, setFaqFilter] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<'idle' | 'sending' | 'success'>('idle');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketCategory, setTicketCategory] = useState('System Malfunction');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! How can I help you today? I'm your Elder AI support assistant." }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Past Tickets State
  const [pastTickets, setPastTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);

  // Callback Form State
  const [isCallbackDialogOpen, setIsCallbackDialogOpen] = useState(false);
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTime, setCallbackTime] = useState('');
  const [isSubmittingCallback, setIsSubmittingCallback] = useState(false);

  useEffect(() => {
    fetchPastTickets();
  }, []);

  const fetchPastTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingTickets(false);
        return;
      }

      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPastTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const getEmailTemplate = (type: string, details: any) => {
    const isTicket = type === 'ticket';
    const accentColor = isTicket ? '#6366f1' : '#f43f5e';
    const typeLabel = isTicket ? 'Support Ticket' : 'Callback Request';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${typeLabel}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <tr>
              <td style="padding: 40px 40px 30px; background: linear-gradient(135deg, ${accentColor} 0%, #4338ca 100%); text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Elder AI</h1>
                <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">Neural Support Link</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 40px;">
                <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">New ${typeLabel} Received</h2>
                <p style="margin: 0 0 30px; color: #64748b; font-size: 16px; line-height: 1.6;">A new ${type === 'ticket' ? 'system anomaly report' : 'human-to-human sync request'} has been transmitted to your node.</p>

                <!-- Details Table -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; border-radius: 16px; border-collapse: separate; border-spacing: 0;">
                  ${details.name ? `
                  <tr>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600; width: 30%;">User Identity</td>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700;">${details.name}</td>
                  </tr>` : ''}
                  ${details.phone ? `
                  <tr>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600;">Comm Number</td>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700;">${details.phone}</td>
                  </tr>` : ''}
                  ${details.time ? `
                  <tr>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600;">Sync Window</td>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700;">${details.time}</td>
                  </tr>` : ''}
                  ${details.category ? `
                  <tr>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #64748b; font-weight: 600;">Anomaly Type</td>
                    <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0f172a; font-weight: 700;">
                      <span style="background-color: ${accentColor}15; color: ${accentColor}; padding: 4px 12px; border-radius: 99px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">${details.category}</span>
                    </td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 16px 20px; font-size: 14px; color: #64748b; font-weight: 600;">Timestamp</td>
                    <td style="padding: 16px 20px; font-size: 14px; color: #0f172a; font-weight: 700;">${format(new Date(), 'MMM d, yyyy • HH:mm:ss')}</td>
                  </tr>
                </table>

                <!-- Content Area -->
                <div style="margin-top: 30px;">
                  <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">Transmission Log</h3>
                  <div style="background-color: #ffffff; border: 2px solid #f1f5f9; border-radius: 16px; padding: 20px; color: #334155; font-size: 16px; line-height: 1.6; font-style: italic;">
                    "${details.content}"
                  </div>
                </div>

                <!-- Action Button -->
                <div style="margin-top: 40px; text-align: center;">
                  <a href="https://nwnexkbndpngmqfqnogh.supabase.co" style="display: inline-block; background-color: ${accentColor}; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">Open Control Center</a>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Elder AI System • Neural Link Protocol v2.4.0</p>
                <p style="margin: 10px 0 0; color: #cbd5e1; font-size: 11px;">Automated system notification. Please do not reply directly to this transmission.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  };

  const sendEmailNotification = async (type: string, details: any) => {
    try {
      console.log(`Sending ${type} notification via Supabase Function...`);
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'garvanand03@gmail.com',
          subject: `[SYSTEM] New ${type === 'ticket' ? 'Ticket' : 'Callback'}: ${details.category || 'Priority'}`,
          html: getEmailTemplate(type, details)
        }
      });

      if (error) {
        console.error("Failed to send email notification via Supabase:", error);
        // Fallback or just log
      } else {
        console.log("Email notification sent successfully:", data);
      }
    } catch (error) {
      console.error("Email notification error:", error);
    }
  };

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

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDescription.trim()) {
      toast.error("Please provide details for the anomaly.");
      return;
    }
    setTicketStatus('sending');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('support_requests').insert({
        user_id: user?.id,
        type: 'ticket',
        category: ticketCategory,
        content: ticketDescription,
        contact_info: { email: user?.email || 'unknown' }
      });

      if (error) throw error;

      await sendEmailNotification('ticket', {
        category: ticketCategory,
        content: ticketDescription,
        name: user?.email || 'Registered User'
      });

      setTicketStatus('success');
      toast.success("Ticket submitted! Our team will contact you shortly.");
      setTicketDescription('');
      fetchPastTickets();
      setTimeout(() => setTicketStatus('idle'), 3000);
    } catch (error: any) {
      toast.error("Failed to transmit ticket: " + error.message);
      setTicketStatus('idle');
    }
  };

  const handleCallbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) {
      toast.error("Please provide a contact number.");
      return;
    }
    
    setIsSubmittingCallback(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('support_requests').insert({
        user_id: user?.id,
        type: 'callback',
        content: `Callback requested by ${callbackName} at ${callbackTime || 'as soon as possible'}.`,
        contact_info: { phone: callbackPhone, name: callbackName, preferred_time: callbackTime }
      });

      if (error) throw error;

      await sendEmailNotification('callback', {
        name: callbackName,
        phone: callbackPhone,
        time: callbackTime,
        content: `User ${callbackName} requested a callback.`
      });

      toast.success("Callback requested! We'll call you shortly.");
      setIsCallbackDialogOpen(false);
      setCallbackName('');
      setCallbackPhone('');
      setCallbackTime('');
      fetchPastTickets();
    } catch (error: any) {
      toast.error("Failed to request callback: " + error.message);
    } finally {
      setIsSubmittingCallback(false);
    }
  };

  const handleComposeMessage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('support_requests').insert({
        user_id: user?.id,
        type: 'message',
        content: 'User initiated neural mail compose.',
        contact_info: { email: 'garvanand03@gmail.com' }
      });

      if (error) throw error;
      toast.success("Message session initiated. Check your garvanand03@gmail.com inbox.");
      window.location.href = "mailto:garvanand03@gmail.com";
      fetchPastTickets();
    } catch (error: any) {
      toast.error("Failed to initiate message: " + error.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-6 space-y-20 pb-32">
      {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest border border-primary/20"
          >
            <LifeBuoy size={16} /> 24/7 Intelligent Support
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-slate-950 leading-none">
            How can we <span className="text-primary italic text-6xl md:text-8xl block md:inline">Help</span>?
          </h1>
          <p className="text-xl text-slate-700 max-w-2xl mx-auto font-bold leading-relaxed">
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
            className={`p-8 rounded-[40px] border transition-all duration-500 flex flex-col items-center gap-4 text-center ${
              activeCategory === cat.id 
              ? 'bg-white border-white shadow-2xl shadow-primary/20 scale-105' 
              : 'bg-white/40 border-white/60 hover:border-white hover:bg-white/60'
            }`}
          >
            <div className={`p-5 rounded-3xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
              <cat.icon size={40} />
            </div>
              <div>
                <h3 className={`font-black uppercase tracking-tighter text-xl ${activeCategory === cat.id ? 'text-slate-950' : 'text-slate-600'}`}>
                  {cat.label}
                </h3>
              </div>
          </motion.button>
        ))}
      </section>

      {/* Smart Help AI Section */}
      <section className="bg-white/40 backdrop-blur-2xl rounded-[60px] p-10 md:p-16 border border-white shadow-2xl shadow-black/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12">
          <HelpCircle size={300} className="text-primary" />
        </div>
        
          <div className="relative z-10 max-w-3xl space-y-10">
            <div className="space-y-3">
              <h2 className="text-4xl font-black text-slate-950 flex items-center gap-4 uppercase tracking-tighter">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Search size={32} />
                </div>
                Smart Help AI
              </h2>
              <p className="text-slate-700 font-bold text-lg">Neural core active. Ask anything to access the global knowledge base.</p>
            </div>

          <form onSubmit={handleAiSearch} className="flex flex-col sm:flex-row gap-4 p-3 bg-white/80 rounded-3xl border border-white shadow-xl shadow-black/5">
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. How do I synchronize my neural bank?"
              className="bg-transparent border-none text-xl h-14 focus-visible:ring-0 placeholder:text-slate-300 font-medium"
            />
            <Button 
              disabled={isAiLoading}
              className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-12 h-14 text-lg font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {isAiLoading ? <Loader2 className="animate-spin" /> : "Initiate Ask"}
            </Button>
          </form>

          <AnimatePresence mode="wait">
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-10 rounded-[40px] bg-slate-900 text-white shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
                <div className="space-y-6">
                  <div className="flex justify-between items-start gap-8">
                    <p className="text-xl text-white/90 leading-relaxed font-medium italic">"{aiResponse}"</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/40 hover:text-primary hover:bg-white/10 flex-shrink-0"
                      onClick={() => speak(aiResponse)}
                    >
                      <Volume2 size={24} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/10" />
                    <Button variant="link" className="text-primary p-0 h-auto flex items-center gap-2 font-black uppercase tracking-widest text-xs hover:text-white transition-colors">
                      Deep Protocol Scan <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Multi-Channel Support Tabs */}
      <section className="space-y-12">
        <h2 className="text-4xl font-black text-slate-900 text-center uppercase tracking-tighter">Support Channels</h2>
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/40 backdrop-blur-md p-2 rounded-3xl h-auto border border-white gap-2">
            {[
              { value: 'faq', label: 'Neural FAQ', icon: MessageSquare },
              { value: 'tickets', label: 'Ticket Hub', icon: LifeBuoy },
              { value: 'video', label: 'Video Sync', icon: Video },
              { value: 'phone', label: 'Direct Comm', icon: Phone }
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="rounded-2xl py-5 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-xl font-black uppercase tracking-widest text-xs gap-2"
              >
                <tab.icon size={16} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-12">
            <TabsContent value="faq" className="space-y-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <Input 
                    value={faqFilter}
                    onChange={(e) => setFaqFilter(e.target.value)}
                    placeholder="Search FAQ archives..."
                    className="pl-12 h-14 bg-white/60 border-white rounded-2xl shadow-sm focus:ring-primary/20"
                  />
                </div>
                <div className="flex gap-2">
                  {['General', 'Security', 'Entity'].map(tag => (
                    <Button 
                      key={tag} 
                      variant="ghost" 
                      onClick={() => setFaqFilter(tag)}
                      className={cn(
                        "rounded-full text-[10px] font-black uppercase tracking-widest h-8 px-4",
                        faqFilter === tag ? "bg-primary text-white" : "bg-white/40 text-slate-500 hover:bg-white"
                      )}
                    >
                      {tag}
                    </Button>
                  ))}
                  {faqFilter && <Button variant="ghost" size="icon" onClick={() => setFaqFilter('')} className="rounded-full h-8 w-8 text-slate-400"><X size={14} /></Button>}
                </div>
              </div>

              <Accordion type="single" collapsible className="space-y-6">
                {[
                  { q: "How do I reset my credentials?", a: "Go to the authentication portal, initiate 'Credential Recovery', and follow the neural-link instructions sent to your registered node.", tags: ['Security'] },
                  { q: "Can I manage multiple elder entities?", a: "Yes, caregiver nodes can synchronize with multiple elders from their primary dashboard. Protocol: 'Settings' > 'Link Entity'.", tags: ['Entity', 'General'] },
                  { q: "Is my biological data encrypted?", a: "Every byte of medical data is protected by quantum-resistant encryption (QRE) and adheres to global Bio-Ethics standards.", tags: ['Security'] },
                  { q: "How does the AI memory synthesis operate?", a: "Our engine processes natural language and emotional frequency to automatically archive events, entities, and sentiments into a persistent legacy timeline.", tags: ['General'] }
                ].filter(item => 
                  !faqFilter || 
                  item.q.toLowerCase().includes(faqFilter.toLowerCase()) || 
                  item.tags.some(t => t.toLowerCase().includes(faqFilter.toLowerCase()))
                ).map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="bg-white/60 backdrop-blur-md border border-white rounded-[32px] px-8 border-none overflow-hidden shadow-xl shadow-black/5 hover:bg-white transition-all duration-500">
                    <AccordionTrigger className="text-xl font-black text-slate-900 hover:no-underline hover:text-primary uppercase tracking-tighter py-8">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-lg leading-relaxed pb-8 font-medium italic">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="tickets">
              <div className="grid lg:grid-cols-2 gap-20">
                <div className="space-y-12">
                  <div className="space-y-8">
                    <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Initiate Support Ticket</h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                      Experiencing a system anomaly? Submit a high-priority ticket and our neural-technicians will respond within 24 standard hours.
                    </p>
                    <div className="space-y-4 font-black uppercase tracking-widest text-xs">
                      <div className="flex items-center gap-4 text-emerald-600">
                        <div className="p-1 rounded-full bg-emerald-100"><CheckCircle2 size={16} /></div>
                        <span>Priority node: garvanand03@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-4 text-primary">
                        <div className="p-1 rounded-full bg-primary/10"><CheckCircle2 size={16} /></div>
                        <span>Clinical suite tracking enabled</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmitTicket} className="bg-white p-10 rounded-[40px] border border-white shadow-2xl shadow-primary/5 space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">Anomaly Type</label>
                      <select 
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-slate-900 font-bold focus:ring-primary appearance-none cursor-pointer"
                      >
                        <option>System Malfunction</option>
                        <option>Entity Synchronization</option>
                        <option>Resource Billing</option>
                        <option>Protocol Request</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400">System Report</label>
                      <Textarea 
                        value={ticketDescription}
                        onChange={(e) => setTicketDescription(e.target.value)}
                        placeholder="Detail the anomaly parameters..." 
                        className="bg-slate-50 border-slate-100 rounded-2xl h-40 font-medium text-lg focus-visible:ring-primary p-4"
                      />
                    </div>
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl py-8 font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20"
                      disabled={ticketStatus !== 'idle'}
                    >
                      {ticketStatus === 'sending' ? <Loader2 className="animate-spin" /> : 
                       ticketStatus === 'success' ? "Transmission Success!" : "Transmit Ticket"}
                    </Button>
                  </form>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-4">
                      <History size={32} className="text-primary" />
                      Ticket History
                    </h3>
                  </div>

                  <div className="bg-white/40 backdrop-blur-md rounded-[40px] border border-white p-8 space-y-6 max-h-[700px] overflow-y-auto">
                    {isLoadingTickets ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="animate-spin text-primary" size={40} />
                        <p className="font-black uppercase tracking-widest text-xs text-slate-400">Syncing History...</p>
                      </div>
                    ) : pastTickets.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                        <div className="p-8 rounded-full bg-slate-100 text-slate-300">
                          <LifeBuoy size={64} />
                        </div>
                        <div className="space-y-2">
                          <p className="font-black text-xl text-slate-900 uppercase tracking-tighter">No Active Anomaly Logs</p>
                          <p className="text-slate-500 font-medium">Your system is currently operating at peak efficiency.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pastTickets.map((ticket) => (
                          <motion.div 
                            key={ticket.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                          >
                            <div className="flex justify-between items-start gap-4 mb-4">
                              <div className="space-y-1">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                  ticket.type === 'ticket' ? 'bg-primary/10 text-primary' : 
                                  ticket.type === 'callback' ? 'bg-rose-100 text-rose-600' : 
                                  'bg-emerald-100 text-emerald-600'
                                }`}>
                                  {ticket.type}
                                </span>
                                <h4 className="font-black text-slate-900 uppercase tracking-tight line-clamp-1">{ticket.category || 'General Interaction'}</h4>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                              }`}>
                                {ticket.status || 'pending'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-sm font-medium line-clamp-2 mb-4 leading-relaxed italic">"{ticket.content}"</p>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                              <div className="flex items-center gap-2">
                                <Clock size={12} />
                                {format(new Date(ticket.created_at), "MMM d, yyyy • HH:mm")}
                              </div>
                              <span className="text-slate-300 group-hover:text-primary transition-colors">ID: {ticket.id.slice(0, 8)}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-12">
              <div className="grid md:grid-cols-3 gap-10">
                {[
                  { title: "Node Initialization", duration: "2:45", thumbnail: "bg-primary/10", icon: Zap },
                  { title: "Archive Management", duration: "4:12", thumbnail: "bg-accent/10", icon: Database },
                  { title: "Health Telemetry", duration: "3:30", thumbnail: "bg-rose-500/10", icon: Activity },
                ].map((v, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="group cursor-pointer space-y-6"
                  >
                    <div className={`aspect-video rounded-[32px] ${v.thumbnail} border border-white shadow-xl flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors" />
                      <div className="p-6 rounded-3xl bg-white/80 backdrop-blur-md group-hover:scale-110 transition-all duration-500 shadow-xl text-primary">
                        <v.icon size={40} />
                      </div>
                      <span className="absolute bottom-6 right-6 text-xs font-black tracking-widest bg-slate-900/80 px-3 py-1.5 rounded-full text-white backdrop-blur-md uppercase">{v.duration}</span>
                    </div>
                    <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors text-xl uppercase tracking-tighter">{v.title}</h4>
                  </motion.div>
                ))}
              </div>
              <div className="bg-slate-900 rounded-[40px] p-12 flex flex-col md:flex-row justify-between items-center gap-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-rose-500" />
                <div className="space-y-3 relative z-10 text-center md:text-left">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Request Human Sync?</h3>
                  <p className="text-white/60 font-medium text-lg">Schedule a high-bandwidth video consultation with a support engineer.</p>
                </div>
                <Button 
                  onClick={() => window.open('https://calendly.com/garvanand03/30min', '_blank')}
                  className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl px-12 py-8 h-auto font-black uppercase tracking-widest text-sm shadow-xl transition-all hover:scale-105"
                >
                  Schedule Uplink
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="grid md:grid-cols-2 gap-10">
              <div className="p-12 rounded-[40px] bg-white border border-white shadow-2xl shadow-black/5 space-y-8 group hover:bg-slate-900 hover:text-white transition-all duration-500">
                <div className="p-5 w-fit rounded-3xl bg-rose-500/10 text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                  <Phone size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Direct Comm Line</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed group-hover:text-white/60">Voice-to-voice synchronization for urgent system criticalities.</p>
                  <div className="text-3xl font-black tracking-tighter text-primary group-hover:text-white">+91 80541 82892</div>
                </div>
                
                <Dialog open={isCallbackDialogOpen} onOpenChange={setIsCallbackDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="border-slate-200 text-slate-900 rounded-2xl h-14 font-black uppercase tracking-widest text-xs px-8 group-hover:border-white/20 group-hover:text-white"
                    >
                      Request Callback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] rounded-[40px] border-none p-0 overflow-hidden bg-white">
                    <div className="p-10 space-y-8">
                      <div className="space-y-2">
                        <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-slate-950">Callback Request</DialogTitle>
                        <DialogDescription className="text-lg font-medium text-slate-500 italic">Initiate human-to-human verbal link.</DialogDescription>
                      </div>

                      <form onSubmit={handleCallbackSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Your Identity</label>
                          <Input 
                            value={callbackName}
                            onChange={(e) => setCallbackName(e.target.value)}
                            placeholder="Full Name" 
                            className="bg-slate-50 border-slate-100 rounded-2xl h-14 px-6 font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Comm Number</label>
                          <Input 
                            value={callbackPhone}
                            onChange={(e) => setCallbackPhone(e.target.value)}
                            placeholder="+91 00000 00000" 
                            className="bg-slate-50 border-slate-100 rounded-2xl h-14 px-6 font-bold"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">Preferred Sync Window</label>
                          <select 
                            value={callbackTime}
                            onChange={(e) => setCallbackTime(e.target.value)}
                            className="w-full bg-slate-50 border-slate-100 rounded-2xl p-4 text-slate-900 font-bold focus:ring-primary appearance-none cursor-pointer"
                          >
                            <option value="">Select Preferred Time</option>
                            <option value="ASAP">As soon as possible</option>
                            <option value="Morning">Morning (9 AM - 12 PM)</option>
                            <option value="Afternoon">Afternoon (1 PM - 5 PM)</option>
                            <option value="Evening">Evening (6 PM - 9 PM)</option>
                          </select>
                        </div>
                        <Button 
                          type="submit"
                          disabled={isSubmittingCallback}
                          className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-16 font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                        >
                          {isSubmittingCallback ? <Loader2 className="animate-spin" /> : "Initiate Request"}
                        </Button>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="p-12 rounded-[40px] bg-white border border-white shadow-2xl shadow-black/5 space-y-8 group hover:bg-slate-900 hover:text-white transition-all duration-500">
                <div className="p-5 w-fit rounded-3xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Mail size={40} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tighter">Neural Mail</h3>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed group-hover:text-white/60">Submit long-form asynchronous queries to the core engineering team.</p>
                  <div className="text-3xl font-black tracking-tighter text-primary group-hover:text-white overflow-hidden text-ellipsis">garvanand03@gmail.com</div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleComposeMessage}
                  className="border-slate-200 text-slate-900 rounded-2xl h-14 font-black uppercase tracking-widest text-xs px-8 group-hover:border-white/20 group-hover:text-white"
                >
                  Compose Message
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      {/* Floating Chat Bot UI */}
      <div className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-6">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="w-[90vw] md:w-96 h-[600px] bg-white/95 backdrop-blur-2xl border border-white rounded-[40px] shadow-[0_50px_100px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden"
            >
              {/* Chat Header */}
              <div className="p-8 bg-slate-900 border-b border-white/10 flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/20 text-primary ring-1 ring-primary/30">
                    <Brain size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-black uppercase tracking-widest text-xs">Neural Assistant</h4>
                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
                    </span>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white/40 hover:text-white hover:bg-white/10 rounded-xl"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X size={24} />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-5 rounded-[24px] text-lg font-medium leading-relaxed ${
                      msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none shadow-xl shadow-primary/20' 
                      : 'bg-slate-50 text-slate-600 rounded-tl-none border border-slate-100 shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 p-5 rounded-[24px] rounded-tl-none border border-slate-100 flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4 items-center">
                <Input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask the collective..."
                  className="bg-white border-slate-200 rounded-2xl h-16 px-6 text-lg font-medium focus-visible:ring-primary shadow-inner"
                />
                <Button size="icon" className="w-16 h-16 rounded-2xl bg-primary hover:bg-primary/90 shrink-0 shadow-xl shadow-primary/20" onClick={handleSendMessage}>
                  <Send size={24} />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-20 h-20 rounded-3xl bg-slate-900 shadow-2xl shadow-black/20 flex items-center justify-center text-white relative group"
        >
          <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10 blur-xl" />
          {isChatOpen ? <X size={32} /> : <MessageSquare size={32} />}
        </motion.button>
      </div>
    </div>
  );
};

export default Support;

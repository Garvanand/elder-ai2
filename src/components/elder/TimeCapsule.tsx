import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Gift, GraduationCap, Heart, Baby, Calendar, X, Plus, Send, Mic, Video, Image as ImageIcon, Sparkles, Check, Trash2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useDemo } from '@/contexts/DemoContext';

interface TimeCapsule {
  id: string;
  recipient_name: string;
  recipient_relation: string;
  event_type: string;
  delivery_date: string;
  message_text?: string;
  voice_url?: string;
  video_url?: string;
  status: 'scheduled' | 'delivered' | 'cancelled';
  created_at: string;
}

const eventTypes = [
  { id: 'graduation', label: 'Graduation', icon: GraduationCap, color: 'from-blue-400 to-indigo-500' },
  { id: 'wedding', label: 'Wedding Day', icon: Heart, color: 'from-pink-400 to-rose-500' },
  { id: 'baby', label: 'New Baby', icon: Baby, color: 'from-purple-400 to-violet-500' },
  { id: 'birthday', label: 'Special Birthday', icon: Gift, color: 'from-amber-400 to-orange-500' },
  { id: 'anniversary', label: 'Anniversary', icon: Calendar, color: 'from-green-400 to-emerald-500' },
  { id: 'custom', label: 'Custom Date', icon: Clock, color: 'from-gray-400 to-slate-500' }
];

const demoTimeCapsules: TimeCapsule[] = [
  {
    id: '1',
    recipient_name: 'Sarah',
    recipient_relation: 'Granddaughter',
    event_type: 'graduation',
    delivery_date: '2027-06-15',
    message_text: "My dearest Sarah, I'm writing this on your 16th birthday, but you'll read it when you graduate college. I am so proud of the woman you've become...",
    status: 'scheduled',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: '2',
    recipient_name: 'Tommy',
    recipient_relation: 'Grandson',
    event_type: 'wedding',
    delivery_date: '2035-01-01',
    message_text: "To Tommy on your wedding day: Marriage is the greatest adventure of all. Your grandmother and I were married for 52 beautiful years...",
    status: 'scheduled',
    created_at: new Date(Date.now() - 86400000 * 60).toISOString()
  }
];

interface TimeCapsuleProps {
  elderId: string;
  elderName: string;
  onClose: () => void;
}

export function TimeCapsuleFeature({ elderId, elderName, onClose }: TimeCapsuleProps) {
  const { isGuestMode } = useDemo();
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);
  const [loading, setLoading] = useState(true);

  const [recipientName, setRecipientName] = useState('');
  const [recipientRelation, setRecipientRelation] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [messageText, setMessageText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isGuestMode) {
      setCapsules(demoTimeCapsules);
      setLoading(false);
      return;
    }
    fetchCapsules();
  }, [elderId, isGuestMode]);

  const fetchCapsules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('time_capsules')
      .select('*')
      .eq('elder_id', elderId)
      .order('delivery_date', { ascending: true });
    
    if (!error && data) {
      setCapsules(data as TimeCapsule[]);
    }
    setLoading(false);
  };

  const handleCreateCapsule = async () => {
    if (!recipientName || !selectedEvent || !deliveryDate || !messageText) return;

    setSaving(true);

    if (isGuestMode) {
      const newCapsule: TimeCapsule = {
        id: Date.now().toString(),
        recipient_name: recipientName,
        recipient_relation: recipientRelation,
        event_type: selectedEvent,
        delivery_date: deliveryDate,
        message_text: messageText,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };
      setCapsules(prev => [...prev, newCapsule]);
      resetForm();
      setView('list');
      setSaving(false);
      return;
    }

    try {
      const worldContext = {
        createdAt: new Date().toISOString(),
        elderAge: 75,
        currentEvents: "The year is 2026...",
      };

      const { error } = await supabase
        .from('time_capsules')
        .insert({
          elder_id: elderId,
          recipient_name: recipientName,
          recipient_relation: recipientRelation,
          event_type: selectedEvent,
          delivery_date: deliveryDate,
          message_text: messageText,
          world_context: worldContext
        });

      if (error) throw error;
      
      await fetchCapsules();
      resetForm();
      setView('list');
    } catch (error) {
      console.error('Error creating time capsule:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setRecipientName('');
    setRecipientRelation('');
    setSelectedEvent(null);
    setDeliveryDate('');
    setMessageText('');
  };

  const getEventConfig = (eventType: string) => {
    return eventTypes.find(e => e.id === eventType) || eventTypes[5];
  };

  const formatDeliveryDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getDaysUntil = (date: string) => {
    const delivery = new Date(date);
    const today = new Date();
    const diff = Math.ceil((delivery.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
    >
      <Card className="w-full max-w-2xl my-4 rounded-[40px] bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Time Capsules</h2>
                <p className="text-amber-100 text-sm">Messages for the future</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 space-y-4"
            >
              <Button
                onClick={() => setView('create')}
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg font-bold"
              >
                <Plus className="w-6 h-6 mr-2" />
                Create New Time Capsule
              </Button>

              {loading ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-amber-600">Loading your time capsules...</p>
                </div>
              ) : capsules.length === 0 ? (
                <div className="py-12 text-center">
                  <Clock className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Time Capsules Yet</h3>
                  <p className="text-gray-500">Create your first message to the future!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {capsules.map((capsule) => {
                    const event = getEventConfig(capsule.event_type);
                    const daysUntil = getDaysUntil(capsule.delivery_date);
                    const Icon = event.icon;
                    
                    return (
                      <motion.button
                        key={capsule.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedCapsule(capsule);
                          setView('detail');
                        }}
                        className="w-full p-4 rounded-2xl bg-white border-2 border-amber-100 hover:border-amber-300 text-left transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br",
                            event.color
                          )}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-gray-800">
                                For {capsule.recipient_name}
                              </h3>
                              <span className="text-sm text-amber-600 font-medium">
                                {daysUntil > 0 ? `${daysUntil} days` : 'Ready!'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {capsule.recipient_relation} • {event.label}
                            </p>
                            <p className="text-xs text-amber-500 mt-1">
                              Delivery: {formatDeliveryDate(capsule.delivery_date)}
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              <div className="p-4 bg-amber-100 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    <strong>Legacy Tip:</strong> Your words today will be treasured gifts tomorrow. 
                    Consider recording messages for graduations, weddings, or special birthdays.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                Back to list
              </button>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Who is this for?
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Name (e.g., Sarah)"
                      className="p-4 rounded-2xl border-2 border-amber-200 focus:border-amber-400 text-lg"
                    />
                    <input
                      type="text"
                      value={recipientRelation}
                      onChange={(e) => setRecipientRelation(e.target.value)}
                      placeholder="Relation (e.g., Granddaughter)"
                      className="p-4 rounded-2xl border-2 border-amber-200 focus:border-amber-400 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    What occasion?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {eventTypes.map((event) => {
                      const Icon = event.icon;
                      return (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event.id)}
                          className={cn(
                            "p-3 rounded-xl flex flex-col items-center gap-2 transition-all",
                            selectedEvent === event.id
                              ? `bg-gradient-to-br ${event.color} text-white shadow-lg scale-105`
                              : 'bg-white border-2 border-amber-100 hover:border-amber-300'
                          )}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-medium">{event.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    When should it be delivered?
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-amber-400 text-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 mb-2 block">
                    Your message
                  </label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Write from your heart... This message will be delivered on their special day."
                    rows={6}
                    className="w-full p-4 rounded-2xl border-2 border-amber-200 focus:border-amber-400 text-lg resize-none"
                  />
                </div>

                <Button
                  onClick={handleCreateCapsule}
                  disabled={!recipientName || !selectedEvent || !deliveryDate || !messageText || saving}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg font-bold"
                >
                  {saving ? 'Creating...' : 'Seal Time Capsule'}
                  <Send className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {view === 'detail' && selectedCapsule && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6 space-y-6"
            >
              <button
                onClick={() => {
                  setView('list');
                  setSelectedCapsule(null);
                }}
                className="flex items-center gap-2 text-amber-600 hover:text-amber-800 font-medium"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                Back to list
              </button>

              <div className="text-center">
                {(() => {
                  const event = getEventConfig(selectedCapsule.event_type);
                  const Icon = event.icon;
                  return (
                    <div className={cn(
                      "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white bg-gradient-to-br mb-4",
                      event.color
                    )}>
                      <Icon className="w-10 h-10" />
                    </div>
                  );
                })()}
                <h3 className="text-2xl font-bold text-gray-800">
                  For {selectedCapsule.recipient_name}
                </h3>
                <p className="text-amber-600">{selectedCapsule.recipient_relation}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Delivers on {formatDeliveryDate(selectedCapsule.delivery_date)}
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border-2 border-amber-100 shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-bold text-sm">
                      {elderName.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    Written by {elderName}
                  </span>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedCapsule.message_text}
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-2 border-amber-200"
                >
                  Edit Message
                </Button>
                <Button
                  variant="outline"
                  className="h-12 px-4 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

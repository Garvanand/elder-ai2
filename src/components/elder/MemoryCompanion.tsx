import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Mic, MicOff, Volume2, VolumeX, Heart, Sparkles, X, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDemo } from '@/contexts/DemoContext';
import { useSpeech } from '@/hooks/useSpeech';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'companion';
  content: string;
  timestamp: Date;
  emotion?: 'happy' | 'nostalgic' | 'curious' | 'supportive';
}

const companionResponses = {
  greeting: [
    "Hello dear! I've been thinking about our conversations. How are you feeling today?",
    "It's so lovely to see you! What's on your mind today?",
    "Welcome back, friend! I remember you were telling me about your family. Would you like to continue?"
  ],
  memory_prompt: [
    "That reminds me of something you shared before. Would you like to tell me more about those days?",
    "What a beautiful memory! Can you describe the sounds or smells you remember?",
    "I can hear how special that was to you. Who else was there with you?"
  ],
  supportive: [
    "Thank you for sharing that with me. Your stories are precious.",
    "I'm always here to listen whenever you want to talk.",
    "It sounds like that was a meaningful time in your life."
  ],
  curious: [
    "That's fascinating! What happened next?",
    "I'd love to hear more about that. How did it make you feel?",
    "Tell me more about the people in that memory."
  ]
};

interface MemoryCompanionProps {
  elderId: string;
  elderName: string;
  onClose: () => void;
}

export function MemoryCompanion({ elderId, elderName, onClose }: MemoryCompanionProps) {
  const { isGuestMode, demoMemories } = useDemo();
  const { isListening, isSpeaking, supported, startListening, speak, stopSpeaking } = useSpeech();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [memories, setMemories] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isGuestMode) {
      setMemories(demoMemories);
    } else {
      fetchMemories();
    }
    
    const greeting = companionResponses.greeting[Math.floor(Math.random() * companionResponses.greeting.length)];
    setMessages([{
      id: '1',
      role: 'companion',
      content: `Hello ${elderName.split(' ')[0]}! ${greeting}`,
      timestamp: new Date(),
      emotion: 'happy'
    }]);
  }, [elderId, elderName, isGuestMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMemories = async () => {
    const { data } = await supabase
      .from('memories')
      .select('*')
      .eq('elder_id', elderId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setMemories(data);
  };

  const generateCompanionResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    
    const relevantMemories = memories.filter(m => {
      const text = m.raw_text?.toLowerCase() || '';
      return lowerMessage.split(' ').some(word => word.length > 3 && text.includes(word));
    });

    if (relevantMemories.length > 0) {
      const memory = relevantMemories[0];
      return `I remember you telling me about "${memory.raw_text?.slice(0, 50)}..." That sounds like such a wonderful memory! ${companionResponses.curious[Math.floor(Math.random() * companionResponses.curious.length)]}`;
    }

    if (lowerMessage.includes('family') || lowerMessage.includes('children') || lowerMessage.includes('grandchildren')) {
      return "Family is so important. I'd love to hear more about them. What's your favorite memory with your family?";
    }

    if (lowerMessage.includes('remember') || lowerMessage.includes('forgot') || lowerMessage.includes('memory')) {
      return "It's okay to forget sometimes - that's why I'm here to help you remember. Would you like me to remind you of any stories you've shared with me?";
    }

    if (lowerMessage.includes('sad') || lowerMessage.includes('lonely') || lowerMessage.includes('miss')) {
      return "I'm sorry you're feeling that way. Remember, you're not alone - I'm always here to talk. Sometimes looking at happy memories can help. Would you like to explore your photo album together?";
    }

    if (lowerMessage.includes('happy') || lowerMessage.includes('good') || lowerMessage.includes('great')) {
      return "That makes me so happy to hear! What's making today a good day for you?";
    }

    return companionResponses.memory_prompt[Math.floor(Math.random() * companionResponses.memory_prompt.length)];
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

    const response = await generateCompanionResponse(inputText);
    
    const companionMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'companion',
      content: response,
      timestamp: new Date(),
      emotion: 'supportive'
    };

    setMessages(prev => [...prev, companionMessage]);
    setIsTyping(false);

    if (supported.tts) {
      speak(response);
    }
  };

  const handleVoiceInput = () => {
    startListening((text) => {
      setInputText(prev => prev ? `${prev} ${text}` : text);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col rounded-[48px] bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Memory Friend</h2>
              <p className="text-amber-100 text-sm">Your personal companion</p>
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

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                )}>
                  {message.role === 'user' ? <User className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                <div className={cn(
                  "max-w-[75%] p-5 rounded-3xl",
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-tr-lg'
                    : 'bg-white border border-amber-200 shadow-lg rounded-tl-lg'
                )}>
                  <p className="text-lg leading-relaxed">{message.content}</p>
                  <p className={cn(
                    "text-xs mt-2",
                    message.role === 'user' ? 'text-blue-100' : 'text-amber-400'
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="bg-white border border-amber-200 p-5 rounded-3xl rounded-tl-lg shadow-lg">
                <div className="flex gap-2">
                  <span className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-amber-200">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message or press the microphone..."
                className="w-full p-4 pr-14 rounded-2xl border-2 border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 resize-none text-lg"
                rows={2}
              />
              {supported.stt && (
                <button
                  onClick={handleVoiceInput}
                  className={cn(
                    "absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                  )}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="h-14 w-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
            >
              <Send className="w-6 h-6" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {[
              "Tell me a story",
              "How am I feeling?",
              "Show my photos",
              "Who visited me?"
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInputText(prompt)}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 rounded-full text-amber-700 text-sm font-medium whitespace-nowrap transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Play, Pause, Heart, X, Users, Video, Mic, Send, Clock, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDemo } from '@/contexts/DemoContext';
import { cn } from '@/lib/utils';

interface FamilyMessage {
  id: string;
  sender_name: string;
  sender_relation: string;
  sender_avatar?: string;
  type: 'text' | 'voice' | 'video';
  content: string;
  media_url?: string;
  duration?: number;
  is_read: boolean;
  created_at: string;
}

const demoMessages: FamilyMessage[] = [
  {
    id: '1',
    sender_name: 'Sarah',
    sender_relation: 'Daughter',
    type: 'voice',
    content: 'Hi Mom! Just wanted to say I love you and I\'ll visit this Sunday. The kids are so excited to see you!',
    duration: 15,
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    sender_name: 'Tommy',
    sender_relation: 'Grandson',
    type: 'video',
    content: 'Look grandma, I scored a goal today! Coach said it was the best one all season!',
    duration: 22,
    is_read: false,
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    sender_name: 'Michael',
    sender_relation: 'Son',
    type: 'text',
    content: 'Happy Thursday Mom! Remember your doctor appointment is at 2pm tomorrow. I\'ll pick you up at 1:30. Love you!',
    is_read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '4',
    sender_name: 'Emily',
    sender_relation: 'Granddaughter',
    type: 'voice',
    content: 'Grandma, I learned your cookie recipe! I made them for my class and everyone loved them!',
    duration: 18,
    is_read: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

interface FamilyMessagesProps {
  elderId: string;
  onClose: () => void;
}

export function FamilyMessages({ elderId, onClose }: FamilyMessagesProps) {
  const { isGuestMode } = useDemo();
  const [messages, setMessages] = useState<FamilyMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<FamilyMessage | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (isGuestMode) {
      setMessages(demoMessages);
    }
  }, [isGuestMode]);

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const handleMarkRead = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedMessage) return;
    setReplyText('');
    setSelectedMessage(null);
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <Card className="w-full max-w-xl h-[80vh] flex flex-col rounded-[40px] bg-gradient-to-b from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center relative">
              <Users className="w-7 h-7" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Family Messages</h2>
              <p className="text-blue-100 text-sm">Messages from your loved ones</p>
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

        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ChevronRight className="w-5 h-5 rotate-180" />
                  Back to messages
                </button>

                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
                    {selectedMessage.sender_name[0]}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{selectedMessage.sender_name}</h3>
                  <p className="text-blue-500">{selectedMessage.sender_relation}</p>
                  <p className="text-gray-400 text-sm mt-1">{getTimeAgo(selectedMessage.created_at)}</p>
                </div>

                <Card className="p-6 bg-white rounded-3xl shadow-lg">
                  {selectedMessage.type === 'voice' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
                        >
                          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                            animate={{ width: isPlaying ? '100%' : '0%' }}
                            transition={{ duration: selectedMessage.duration || 10 }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{selectedMessage.duration}s</span>
                      </div>
                      <p className="text-gray-600 text-center italic mt-4">"{selectedMessage.content}"</p>
                    </div>
                  )}

                  {selectedMessage.type === 'video' && (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-indigo-600/20" />
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-20 h-20 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-lg hover:bg-white transition-colors z-10"
                        >
                          {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                        </button>
                        <Video className="absolute bottom-4 right-4 w-8 h-8 text-white/60" />
                      </div>
                      <p className="text-gray-600 text-center italic">"{selectedMessage.content}"</p>
                    </div>
                  )}

                  {selectedMessage.type === 'text' && (
                    <p className="text-xl text-gray-700 leading-relaxed text-center">
                      "{selectedMessage.content}"
                    </p>
                  )}
                </Card>

                <div className="space-y-3">
                  <p className="text-center text-gray-500 font-medium">Reply to {selectedMessage.sender_name}</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                        isRecording 
                          ? 'bg-red-500 text-white animate-pulse' 
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      )}
                    >
                      <Mic className="w-6 h-6" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type a message..."
                        className="w-full h-14 px-5 pr-14 rounded-2xl border-2 border-blue-200 focus:border-blue-400 text-lg"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center disabled:opacity-50"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    className="rounded-full px-6 border-2 border-red-300 text-red-500 hover:bg-red-50"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Send Love
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-blue-300 mb-4" />
                    <p className="text-xl text-gray-500">No messages yet</p>
                    <p className="text-gray-400">Your family's messages will appear here</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.button
                      key={message.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedMessage(message);
                        handleMarkRead(message.id);
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl flex items-center gap-4 text-left transition-all",
                        message.is_read 
                          ? 'bg-white hover:bg-gray-50' 
                          : 'bg-blue-100 hover:bg-blue-200 border-2 border-blue-300'
                      )}
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                          {message.sender_name[0]}
                        </div>
                        {message.type === 'voice' && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Mic className="w-3 h-3 text-white" />
                          </div>
                        )}
                        {message.type === 'video' && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                            <Video className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-800">{message.sender_name}</h3>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-blue-500 mb-1">{message.sender_relation}</p>
                        <p className="text-gray-600 truncate">{message.content}</p>
                      </div>
                      {!message.is_read && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </motion.button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}

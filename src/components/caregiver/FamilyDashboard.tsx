import { Heart, Camera, Calendar, MessageSquare, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import type { Memory, Profile } from '@/types';

interface FamilyDashboardProps {
  elderProfile: Profile | null;
  memories: Memory[];
}

export default function FamilyDashboard({ elderProfile, memories }: FamilyDashboardProps) {
  const highlights = memories.filter(m => m.emotional_tone === 'happy' || m.emotional_tone === 'nostalgic').slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-fade-in">
      {/* Hero Section */}
      <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-rose-400 to-orange-400 p-12 text-white">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 overflow-hidden bg-white/20">
              {elderProfile?.avatar_url ? (
                <img src={elderProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold">
                  {elderProfile?.full_name?.[0] || 'E'}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-4xl font-bold">{elderProfile?.full_name || 'Your Loved One'}'s Journey</h2>
              <p className="text-white/80 text-lg">Connected and cared for by Memory Friend</p>
            </div>
          </div>
        </div>
        <Heart className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/10" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Emotional Highlights */}
        <div className="lg:col-span-2 space-y-8">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            Beautiful Moments
          </h3>
          <div className="grid gap-6">
            {highlights.map((memory) => (
              <Card key={memory.id} className="border-none shadow-xl shadow-black/5 overflow-hidden rounded-3xl hover:scale-[1.01] transition-transform">
                <CardContent className="p-0">
                  <div className="p-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase">
                        {memory.emotional_tone}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {format(new Date(memory.created_at), 'MMMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-xl leading-relaxed font-medium text-slate-800 italic">
                      "{memory.raw_text}"
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {memory.tags?.map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-md bg-slate-100 text-slate-500 lowercase">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {highlights.length === 0 && (
              <div className="p-12 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                <Camera className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 italic">No highlights to show yet. Memories will appear here as they are shared.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Updates & Routine */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              Day at a Glance
            </h3>
            <Card className="rounded-[32px] border-none shadow-xl shadow-black/5">
              <CardContent className="p-6 space-y-6">
                <div className="flex gap-4 items-start pb-6 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Last Active</p>
                    <p className="text-xs text-muted-foreground">Captured a story 2 hours ago</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Upcoming Event</p>
                    <p className="text-xs text-muted-foreground">Doctor visit tomorrow at 10 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <Card className="bg-slate-900 text-white rounded-[32px] p-8 space-y-4">
            <Heart className="w-8 h-8 text-rose-500" />
            <h4 className="text-xl font-bold">Family Note</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sharing memories helps keep the cognitive mind active. Consider adding a photo of a family gathering to spark a new story!
            </p>
            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-xl">
              Add a Family Note
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { Star } from 'lucide-react';

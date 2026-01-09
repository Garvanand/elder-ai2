import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, AlertTriangle, TrendingUp, Search, 
  Activity, Bell, Calendar, Video, Filter,
  Brain, Heart, Smartphone, ArrowLeft,
  ChevronRight, Clock, MapPin, MoreHorizontal
} from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { DiagnosticAI } from './DiagnosticAI';
import { HealthTimeline } from './HealthTimeline';
import { HealthHeatmap } from './HealthHeatmap';
import { BrainModel3D } from './BrainModel3D';

export const CommandCenter = () => {
  const [activeView, setActiveView] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [teleconsultations, setTeleconsultations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch patients
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'elder');
      
      setPatients(profilesData || []);

      // Fetch alerts
      const { data: alertsData } = await supabase
        .from('alerts')
        .select('*, profiles!alerts_elder_id_fkey(full_name)')
        .order('created_at', { ascending: false });
      
      setAlerts(alertsData || []);

      // Fetch consultations
      const { data: teleData } = await supabase
        .from('teleconsultations')
        .select('*, profiles!teleconsultations_elder_id_fkey(full_name)')
        .order('scheduled_at', { ascending: true });
      
      setTeleconsultations(teleData || []);
    } catch (error) {
      console.error('Error fetching clinician data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.slice(0, 8).includes(searchQuery)
  );

  const renderMainContent = () => {
    if (selectedPatient) {
      return (
        <PatientDetail 
          patient={selectedPatient} 
          onBack={() => setSelectedPatient(null)} 
        />
      );
    }

    switch (activeView) {
      case 'grid':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <PatientCard 
                  key={patient.id} 
                  patient={patient} 
                  onViewRecords={() => setSelectedPatient(patient)}
                />
              ))
            ) : (
              <div className="col-span-2 text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No patients found matching your search.</p>
              </div>
            )}
          </div>
        );
      case 'alerts':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Alert Management Center</h2>
            {alerts.length > 0 ? (
              alerts.map(alert => (
                <DetailedAlertRow key={alert.id} alert={alert} />
              ))
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No active alerts at this time.</p>
              </div>
            )}
          </div>
        );
      case 'trends':
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold mb-6">Population Health Analytics</h2>
            <div className="grid grid-cols-2 gap-6">
              <HealthHeatmap />
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Cognitive Trends (Aggregate)</h3>
                  <div className="h-48 bg-muted/20 rounded-xl flex items-center justify-center border border-dashed">
                    <TrendingUp className="h-8 w-8 text-muted-foreground/30 mr-2" />
                    <span className="text-muted-foreground">Historical data loading...</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold mb-4">Adherence Overview</h3>
                  <div className="space-y-4">
                    <AdherenceStat label="Medication" value={94} color="bg-success" />
                    <AdherenceStat label="Exercises" value={82} color="bg-primary" />
                    <AdherenceStat label="Dietary" value={76} color="bg-amber-500" />
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'tele':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Virtual Rounds</h2>
              <Button className="bg-primary text-white">
                <Video className="h-4 w-4 mr-2" />
                Schedule New Round
              </Button>
            </div>
            {teleconsultations.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {teleconsultations.map(session => (
                  <TeleSessionCard key={session.id} session={session} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No upcoming rounds scheduled.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
            <Activity className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Health Mission Control</h1>
            <p className="text-muted-foreground">Comprehensive Multi-Patient Monitoring</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search patients..."
              className="bg-white border border-border rounded-full py-3 pl-12 pr-6 w-80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-full bg-white border border-border relative shadow-sm"
          >
            <Bell className="h-6 w-6 text-muted-foreground" />
            {alerts.length > 0 && (
              <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
            )}
          </motion.button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white shadow-md" />
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="col-span-1 flex flex-col gap-6 items-center py-8 rounded-3xl bg-white border border-border shadow-sm h-fit sticky top-8">
          <SidebarIcon icon={Users} active={activeView === 'grid'} onClick={() => { setActiveView('grid'); setSelectedPatient(null); }} label="Patients" />
          <SidebarIcon icon={AlertTriangle} active={activeView === 'alerts'} onClick={() => { setActiveView('alerts'); setSelectedPatient(null); }} label="Priority" />
          <SidebarIcon icon={TrendingUp} active={activeView === 'trends'} onClick={() => { setActiveView('trends'); setSelectedPatient(null); }} label="Analytics" />
          <SidebarIcon icon={Video} active={activeView === 'tele'} onClick={() => { setActiveView('tele'); setSelectedPatient(null); }} label="Rounds" />
          <div className="mt-auto">
            <SidebarIcon icon={Filter} active={false} onClick={() => {}} label="Filters" />
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="col-span-11 xl:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView + (selectedPatient?.id || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-40">
                  <Activity className="h-12 w-12 text-primary animate-pulse" />
                </div>
              ) : renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Right Sidebar - Dynamic Insight Panel */}
        {!selectedPatient && (
          <aside className="hidden xl:block col-span-3 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-destructive" />
              Live Feed
            </h3>
            <div className="space-y-4">
              {alerts.slice(0, 3).map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
            
            <Card className="p-6 border-primary/20 bg-primary/5">
              <h4 className="font-bold flex items-center gap-2 mb-4 text-primary">
                <Brain className="h-5 w-5" />
                AI Population Insight
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {patients.length > 0 
                  ? `Observing a 12% increase in nocturnal activity across the elder group over the last 48 hours. Consider investigating environmental factors like temperature.`
                  : "Scanning patient data for trends. Connect elder profiles to begin population monitoring."}
              </p>
            </Card>

            <Card className="p-6 border-border bg-white">
              <h4 className="font-bold flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                Upcoming Rounds
              </h4>
              <div className="space-y-3">
                {teleconsultations.slice(0, 2).map(session => (
                  <div key={session.id} className="text-sm flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-medium">{session.profiles?.full_name}</span>
                    <span className="text-muted-foreground ml-auto">{new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
                {teleconsultations.length === 0 && <p className="text-xs text-muted-foreground">No rounds scheduled for today.</p>}
              </div>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
};

const SidebarIcon = ({ icon: Icon, active, onClick, label }: any) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={cn(
      "p-4 rounded-2xl transition-all duration-300 relative group",
      active ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
    )}
  >
    <Icon className="h-6 w-6" />
    <span className="absolute left-full ml-4 px-3 py-1 rounded bg-primary text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-md z-50">
      {label}
    </span>
  </motion.button>
);

const PatientCard = ({ patient, onViewRecords }: any) => (
  <Card className="p-0 overflow-hidden border-border hover:shadow-xl transition-all duration-300 rounded-3xl group">
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
            {patient.avatar_url ? (
              <img src={patient.avatar_url} alt="" className="h-full w-full object-cover rounded-2xl" />
            ) : (
              <Users className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <h4 className="text-xl font-bold">{patient.full_name || 'Anonymous Elder'}</h4>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Monitoring Active
            </div>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
          ID: {patient.id.slice(0, 4)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Metric icon={Brain} value="84" label="Cognitive" color="text-amber-500" />
        <Metric icon={Activity} value="92%" label="Mobility" color="text-primary" />
        <Metric icon={Smartphone} value="100%" label="Adherence" color="text-success" />
      </div>
    </div>
    
    <div className="bg-muted/30 border-t border-border p-4 flex justify-between items-center">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 shadow-sm" />
        ))}
      </div>
      <button 
        onClick={onViewRecords}
        className="text-primary text-sm font-bold hover:underline"
      >
        View Records →
      </button>
    </div>
  </Card>
);

const Metric = ({ icon: Icon, value, label, color }: any) => (
  <div className="text-center p-3 rounded-2xl bg-white border border-border shadow-sm">
    <Icon className={cn("h-5 w-5 mx-auto mb-2", color)} />
    <div className="text-xl font-bold">{value}</div>
    <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{label}</div>
  </div>
);

const AlertCard = ({ alert }: any) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "p-4 rounded-2xl border backdrop-blur-md transition-all",
      alert.priority === 'high' || alert.type === 'critical' ? "bg-red-500/10 border-red-500/30" : "bg-orange-500/10 border-orange-500/30"
    )}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        alert.priority === 'high' || alert.type === 'critical' ? "bg-red-500 text-white" : "bg-orange-500 text-white"
      )}>
        {alert.type || 'Alert'}
      </span>
      <span className="text-[10px] text-muted-foreground">{new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
    <h5 className="font-bold">{alert.profiles?.full_name || 'Elder'}</h5>
    <p className="text-xs text-muted-foreground">{alert.title || alert.message}</p>
  </motion.div>
);

const DetailedAlertRow = ({ alert }: any) => (
  <Card className="p-6 border-border hover:shadow-md transition-shadow">
    <div className="flex flex-col md:flex-row md:items-center gap-6">
      <div className={cn(
        "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
        alert.priority === 'high' ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
      )}>
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-bold text-lg">{alert.title}</h4>
          <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
            alert.priority === 'high' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
          )}>
            {alert.priority}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">{alert.message}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {alert.profiles?.full_name}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(alert.created_at).toLocaleString()}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">Dismiss</Button>
        <Button size="sm" className="bg-primary text-white">Intervene</Button>
      </div>
    </div>
  </Card>
);

const TeleSessionCard = ({ session }: any) => (
  <Card className="p-6 border-border hover:border-primary/50 transition-all">
    <div className="flex flex-col md:flex-row md:items-center gap-6">
      <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
        <Video className="h-8 w-8 text-primary" />
      </div>
      <div className="flex-1">
        <h4 className="font-bold text-lg">{session.consultation_type || 'Follow-up Consultation'}</h4>
        <p className="text-muted-foreground text-sm">Patient: <span className="text-foreground font-medium">{session.profiles?.full_name}</span></p>
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-full">
            <Clock className="h-3 w-3" /> 
            {new Date(session.scheduled_at).toLocaleDateString()} @ {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className={cn(
            "text-[10px] font-bold uppercase px-2 py-1 rounded-full",
            session.status === 'scheduled' ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
          )}>
            {session.status}
          </span>
        </div>
      </div>
      <Button className="bg-primary text-white">
        Join Room
      </Button>
    </div>
  </Card>
);

const AdherenceStat = ({ label, value, color }: any) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="font-medium">{label}</span>
      <span className="font-bold">{value}%</span>
    </div>
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div className={cn("h-full", color)} style={{ width: `${value}%` }} />
    </div>
  </div>
);

const PatientDetail = ({ patient, onBack }: any) => (
  <div className="space-y-8">
    <div className="flex items-center gap-4">
      <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-10 w-10">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div>
        <h2 className="text-3xl font-bold">{patient.full_name}</h2>
        <p className="text-muted-foreground">Detailed Health Record & Diagnostics</p>
      </div>
      <div className="ml-auto flex gap-2">
        <Button variant="outline"><Calendar className="h-4 w-4 mr-2" /> Schedule Call</Button>
        <Button className="bg-primary text-white"><Video className="h-4 w-4 mr-2" /> Start Consultation</Button>
      </div>
    </div>

    <div className="grid grid-cols-12 gap-8">
      {/* Bio & Stats */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        <Card className="p-6 text-center">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            {patient.avatar_url ? (
              <img src={patient.avatar_url} alt="" className="h-full w-full object-cover rounded-3xl" />
            ) : (
              <Users className="h-10 w-10 text-primary" />
            )}
          </div>
          <h3 className="text-xl font-bold">{patient.full_name}</h3>
          <p className="text-muted-foreground text-sm mb-6">Patient ID: {patient.id.slice(0, 8)}</p>
          
          <div className="space-y-4 text-left border-t pt-6">
            <InfoRow icon={Calendar} label="Last Check" value={patient.last_health_check ? new Date(patient.last_health_check).toLocaleDateString() : 'Pending'} />
            <InfoRow icon={MapPin} label="Location" value="Home Monitoring" />
            <InfoRow icon={Activity} label="Risk Profile" value="Moderate" />
          </div>
        </Card>

        <BrainModel3D />
      </div>

      {/* Charts & AI */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <HealthTimeline />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DiagnosticAI />
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MoreHorizontal className="h-5 w-5 text-primary" />
              Care Notes
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-muted/30 rounded-lg text-sm italic">
                "Patient reported mild fatigue during morning routine. Cognitive scores slightly lower than baseline."
                <div className="mt-2 text-[10px] text-muted-foreground font-bold uppercase">Caregiver Log - 4h ago</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-sm italic">
                "Medication adherence remains 100%. Fall detection sensors tested and operational."
                <div className="mt-2 text-[10px] text-muted-foreground font-bold uppercase">System Auto-Log - 1d ago</div>
              </div>
              <textarea 
                className="w-full bg-white border border-border rounded-lg p-3 text-xs focus:outline-none" 
                placeholder="Add clinician note..."
              />
              <Button className="w-full bg-primary text-white h-8 text-xs">Save Note</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center justify-between text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
    <span className="font-semibold">{value}</span>
  </div>
);

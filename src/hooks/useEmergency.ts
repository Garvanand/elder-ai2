import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PendingAlert {
  id: string;
  type: 'panic' | 'fall' | 'health';
  timestamp: string;
  location: { lat: number; lng: number } | null;
}

export const useEmergency = (elderId: string | undefined) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Proactively fetch location on mount
    useEffect(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          (error) => console.warn("Initial location fetch failed:", error.message),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      }
    }, []);

    // Sync pending alerts when back online

  const syncPendingAlerts = useCallback(async () => {
    if (!elderId || !navigator.onLine) return;

    const pending = localStorage.getItem('pending_emergency_alerts');
    if (!pending) return;

    const alerts: PendingAlert[] = JSON.parse(pending);
    if (alerts.length === 0) return;

    console.log(`Syncing ${alerts.length} pending emergency alerts...`);
    
    for (const alert of alerts) {
      try {
        const { error } = await supabase.from('alerts').insert({
          elder_id: elderId,
          type: alert.type === 'panic' ? 'emergency' : alert.type,
          message: `${alert.type.toUpperCase()} ALERT (Synced): Emergency triggered while offline.`,
          status: 'active',
          metadata: {
            location: alert.location,
            triggered_at: alert.timestamp,
            is_offline_sync: true
          }
        });

        if (error) throw error;
      } catch (err) {
        console.error("Failed to sync alert:", err);
      }
    }

    localStorage.removeItem('pending_emergency_alerts');
    toast.success("Offline emergency alerts synchronized with server.");
  }, [elderId]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingAlerts();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncPendingAlerts]);

    const triggerEmergency = useCallback(async (type: 'panic' | 'fall' | 'health' = 'panic') => {
      if (!elderId) return;
  
      setIsEmergency(true);
      
      // High Precision Location with better error handling and timeout
      let currentLocation = location;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 5000
            });
          });
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLoc);
          currentLocation = newLoc;
        } catch (error) {
          console.warn("Location fetch failed, using last known or null:", error);
          // If high accuracy fails, try a quick low accuracy fetch as fallback
          try {
             const fallbackPos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: false,
                  timeout: 5000,
                  maximumAge: 60000
                });
             });
             const fallbackLoc = {
               lat: fallbackPos.coords.latitude,
               lng: fallbackPos.coords.longitude
             };
             setLocation(fallbackLoc);
             currentLocation = fallbackLoc;
          } catch (fallbackError) {
             console.error("Fallback location also failed:", fallbackError);
          }
        }
      }


    const alertData = {
      id: crypto.randomUUID(),
      type,
      timestamp: new Date().toISOString(),
      location: currentLocation
    };

    if (!navigator.onLine) {
      const pending = JSON.parse(localStorage.getItem('pending_emergency_alerts') || '[]');
      localStorage.setItem('pending_emergency_alerts', JSON.stringify([...pending, alertData]));
      toast.warning("You are offline. Emergency alert saved locally and will sync once connection is restored.", {
        duration: 10000
      });
      return;
    }

    try {
      const { error: alertError } = await supabase.from('alerts').insert({
        elder_id: elderId,
        type: type === 'panic' ? 'emergency' : type,
        message: `${type.toUpperCase()} ALERT: Emergency triggered by elder.`,
        status: 'active',
        metadata: {
          location: currentLocation,
          triggered_at: alertData.timestamp
        }
      });

      if (alertError) throw alertError;

      if (currentLocation) {
        await supabase.from('profiles').update({
          current_location: currentLocation,
          last_health_check: new Date().toISOString()
        }).eq('id', elderId);
      }

      toast.error(`Emergency ${type} alert sent!`, {
        description: "Caregivers and emergency services have been notified.",
        duration: 10000,
      });

    } catch (error) {
      console.error("Error triggering emergency:", error);
      // Fallback to local storage on failure
      const pending = JSON.parse(localStorage.getItem('pending_emergency_alerts') || '[]');
      localStorage.setItem('pending_emergency_alerts', JSON.stringify([...pending, alertData]));
      toast.error("Failed to reach server. Alert saved locally.");
    }
  }, [elderId, location]);

  // Enhanced Fall Detection Logic
  useEffect(() => {
    let impactDetected = false;
    let stillnessCounter = 0;
    const IMPACT_THRESHOLD = 25; // m/s^2
    const STILLNESS_THRESHOLD = 5; // Low movement for 2 seconds
    const CHECK_INTERVAL = 200; // ms

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const totalAcc = Math.sqrt(
        (acc.x || 0) ** 2 + 
        (acc.y || 0) ** 2 + 
        (acc.z || 0) ** 2
      );

      if (totalAcc > IMPACT_THRESHOLD) {
        impactDetected = true;
        stillnessCounter = 0;
        console.warn("High impact detected:", totalAcc);
      } else if (impactDetected) {
        // After impact, check for stillness
        if (totalAcc < 12 && totalAcc > 8) { // Gravity is ~9.8, so totalAcc around 10 means stillness
          stillnessCounter++;
          if (stillnessCounter > (2000 / CHECK_INTERVAL)) {
            console.error("Fall confirmed: Impact followed by stillness.");
            triggerEmergency('fall');
            impactDetected = false;
            stillnessCounter = 0;
          }
        } else if (totalAcc > 15) {
          // Significant movement detected after impact, maybe not a fall or user got up
          impactDetected = false;
          stillnessCounter = 0;
        }
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [triggerEmergency]);

  return {
    isEmergency,
    triggerEmergency,
    location,
    isOnline
  };
};

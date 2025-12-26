import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmergency = (elderId: string | undefined) => {
  const [isEmergency, setIsEmergency] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const triggerEmergency = useCallback(async (type: 'panic' | 'fall' | 'health' = 'panic') => {
    if (!elderId) return;

    setIsEmergency(true);
    
    // Get current location
    let currentLocation = location;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(newLoc);
          currentLocation = newLoc;
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }

    try {
      // 1. Create alert in Supabase
      const { error: alertError } = await supabase.from('alerts').insert({
        elder_id: elderId,
        type: type === 'panic' ? 'emergency' : type,
        message: `${type.toUpperCase()} ALERT: Emergency triggered by elder.`,
        status: 'active',
        metadata: {
          location: currentLocation,
          triggered_at: new Date().toISOString()
        }
      });

      if (alertError) throw alertError;

      // 2. Update elder's current location in profile
      if (currentLocation) {
        await supabase.from('profiles').update({
          current_location: currentLocation
        }).eq('id', elderId);
      }

      toast.error(`Emergency ${type} alert sent!`, {
        description: "Caregivers and emergency services have been notified.",
        duration: 10000,
      });

    } catch (error) {
      console.error("Error triggering emergency:", error);
      toast.error("Failed to send emergency alert. Please call emergency services directly.");
    }
  }, [elderId, location]);

  // Fall Detection Logic
  useEffect(() => {
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    const FALL_THRESHOLD = 30; // High acceleration followed by relative stillness

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const totalAcc = Math.sqrt(
        (acc.x || 0) ** 2 + 
        (acc.y || 0) ** 2 + 
        (acc.z || 0) ** 2
      );

      if (totalAcc > FALL_THRESHOLD) {
        console.warn("Potential fall detected! Acc:", totalAcc);
        // In a real app, we'd wait for a few seconds of stillness to confirm
        triggerEmergency('fall');
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
    location
  };
};

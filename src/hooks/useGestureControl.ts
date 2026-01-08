import { useEffect } from 'react';
import Hammer from 'hammerjs';
import { toast } from 'sonner';

export const useGestureControl = (targetRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!targetRef.current) return;

    const mc = new Hammer(targetRef.current);

    // Swipe up for emergency panic
    mc.get('swipe').set({ direction: Hammer.DIRECTION_UP });
    mc.on('swipeup', () => {
      toast.error("EMERGENCY PROTOCOL INITIALIZED", {
        description: "Alerting all caregivers and emergency services.",
        duration: 5000,
      });
    });

    // Pinch for zoom/focus mode
    mc.get('pinch').set({ enable: true });
    mc.on('pinch', (ev) => {
      if (ev.scale > 1.5) {
        toast.info("Entering Focus Mode");
      }
    });

    return () => {
      mc.destroy();
    };
  }, [targetRef]);
};

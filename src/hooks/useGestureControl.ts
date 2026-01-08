import { useEffect } from 'react';
import Hammer from 'hammerjs';
import { toast } from 'sonner';

export const useGestureControl = (elementRef: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!elementRef.current) return;

    const mc = new Hammer(elementRef.current);
    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL });

    mc.on('swipeup', () => {
      toast.error("EMERGENCY SIGNAL ACTIVATED (Swipe Up)");
      // Emergency logic
    });

    mc.on('swipedown', () => {
      window.location.reload();
      toast("Refreshing clinical data...");
    });

    mc.on('press', () => {
      toast("Voice Assistant Activated (Long Press)");
      // Voice activation logic
    });

    return () => {
      mc.destroy();
    };
  }, [elementRef]);
};

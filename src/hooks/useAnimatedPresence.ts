import { useEffect, useState } from 'react';

export type AnimatedPresencePhase = 'entering' | 'entered' | 'exiting';

export interface AnimatedPresence {
  shouldRender: boolean;
  phase: AnimatedPresencePhase;
}

export function useAnimatedPresence(isOpen: boolean, exitDurationMs = 160): AnimatedPresence {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [phase, setPhase] = useState<AnimatedPresencePhase>(isOpen ? 'entering' : 'exiting');

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isOpen) {
      setShouldRender(true);
      setPhase('entering');
      timeoutId = window.setTimeout(() => setPhase('entered'), 0);
    } else {
      setPhase('exiting');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        setShouldRender(false);
      } else {
        timeoutId = window.setTimeout(() => setShouldRender(false), exitDurationMs);
      }
    }

    return () => {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [exitDurationMs, isOpen]);

  return { shouldRender, phase };
}

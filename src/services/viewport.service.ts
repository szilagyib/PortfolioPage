import { useEffect, useState } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 1024;

function detect(): Breakpoint {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < BREAKPOINT_MOBILE) return 'mobile';
  if (w < BREAKPOINT_TABLET) return 'tablet';
  return 'desktop';
}

/** Returns the current breakpoint and re-renders on viewport resize. */
export function useBreakpoint(): Breakpoint {
  const [bp, setBp] = useState<Breakpoint>(detect);
  useEffect(() => {
    const onResize = () => setBp(detect());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return bp;
}

/** Returns whether the user has opted into reduced motion via OS / browser settings. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

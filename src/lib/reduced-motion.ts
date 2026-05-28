import { prefersReducedMotionMediaQuery } from '@/design-system/motion';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(prefersReducedMotionMediaQuery).matches;
}

export function subscribeReducedMotion(callback: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia(prefersReducedMotionMediaQuery);
  const listener = (e: MediaQueryListEvent) => callback(e.matches);
  mq.addEventListener('change', listener);
  return () => mq.removeEventListener('change', listener);
}

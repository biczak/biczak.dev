import { useEffect, useRef, useState } from 'react';
import { decodeState, encodeState } from './url-state';
import type { EasingState } from './types';
import { DEFAULT_STATE } from './types';

export function useURLState(): [EasingState, (next: EasingState) => void] {
  const [state, setState] = useState<EasingState>(() => {
    if (typeof window === 'undefined') return DEFAULT_STATE;
    return decodeState(window.location.hash);
  });
  const skipNextSyncRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => {
      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }
      setState(decodeState(window.location.hash));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = `#${encodeState(state)}`;
    if (window.location.hash !== hash) {
      skipNextSyncRef.current = true;
      window.history.replaceState(null, '', hash);
    }
  }, [state]);

  return [state, setState];
}

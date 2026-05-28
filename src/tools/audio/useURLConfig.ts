import { useEffect, useRef, useState } from 'react';
import { decodeConfig, encodeConfig } from './url-state';
import type { VisualizerConfig } from './config';
import { DEFAULT_CONFIG } from './config';

export function useURLConfig(): [VisualizerConfig, (next: VisualizerConfig) => void] {
  const [config, setConfig] = useState<VisualizerConfig>(() => {
    if (typeof window === 'undefined') return DEFAULT_CONFIG;
    return decodeConfig(window.location.hash);
  });
  const skipNextSyncRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHash = () => {
      if (skipNextSyncRef.current) {
        skipNextSyncRef.current = false;
        return;
      }
      setConfig(decodeConfig(window.location.hash));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = `#${encodeConfig(config)}`;
    if (window.location.hash !== hash) {
      skipNextSyncRef.current = true;
      window.history.replaceState(null, '', hash);
    }
  }, [config]);

  return [config, setConfig];
}

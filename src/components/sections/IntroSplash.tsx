import { useEffect, useState } from 'react';
import { INTRO_DURATION_MS, introAlreadySeen, markIntroSeen } from '../../lib/intro';

export default function IntroSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (introAlreadySeen()) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setVisible(false);
      markIntroSeen();
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-ink"
      style={{ animation: 'afWipe 2.3s cubic-bezier(.76,0,.24,1) forwards' }}
    >
      <div className="grid justify-items-center gap-[22px]">
        <div
          className="flex h-[124px] w-[124px] items-center justify-center overflow-hidden bg-volt text-ink"
          style={{ animation: 'afTile 1.5s cubic-bezier(.16,1,.3,1) both' }}
        >
          <span
            className="font-display text-[64px] leading-[.8] tracking-[-.07em]"
            style={{ animation: 'afLeft 1.5s cubic-bezier(.16,1,.3,1) both' }}
          >
            A
          </span>
          <span
            className="font-display text-[64px] leading-[.8] tracking-[-.07em]"
            style={{ animation: 'afRight 1.5s cubic-bezier(.16,1,.3,1) both' }}
          >
            F
          </span>
        </div>
        <div
          className="h-[2px] w-[180px] origin-left bg-border-hover"
          style={{ animation: 'afRule 1.8s cubic-bezier(.76,0,.24,1) both' }}
        />
        <div
          className="font-mono text-[11px] uppercase tracking-[.34em] text-muted-label"
          style={{ animation: 'afFadeUp .9s .5s cubic-bezier(.16,1,.3,1) both' }}
        >
          André Freitas
        </div>
      </div>
    </div>
  );
}

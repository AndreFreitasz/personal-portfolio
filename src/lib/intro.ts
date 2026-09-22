const STORAGE_KEY = 'af-intro-seen';

export const INTRO_DURATION_MS = 2400;

export function introAlreadySeen(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(STORAGE_KEY) === '1';
}

export function markIntroSeen(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, '1');
}

import type { SoundProfile } from './types';

const CATHEDRAL_BELL_AUDIO_URL = '/audio/cathedral_bell.mp3';

let activeAudio: HTMLAudioElement | null = null;
let vibrateIntervalId: number | null = null;

function stopAudioElement(): void {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {
      // Ignore media pause errors
    }
    activeAudio = null;
  }
}

function playRealCathedralBell(
  volumePercent: number,
  loop: boolean,
  playbackRate = 1.0
): void {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  stopAudioElement();

  try {
    const audio = new Audio(CATHEDRAL_BELL_AUDIO_URL);
    audio.loop = loop;
    audio.volume = Math.min(1, Math.max(0.05, volumePercent / 100));
    audio.playbackRate = playbackRate;
    audio.preload = 'auto';
    activeAudio = audio;

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Ignore autoplay or headless browser playback restrictions
      });
    }
  } catch {
    // Ignore when Audio API is unavailable
  }
}

export function playLiturgicalChime(profile: SoundProfile, volumePercent: number): void {
  const rate =
    profile === 'cloister_bell' || profile === 'sanctus_chime'
      ? 1.06
      : profile === 'gregorian_tone'
      ? 1.03
      : 1.0;
  playRealCathedralBell(volumePercent, false, rate);
}

export function startRepeatingAlarm(
  profile: SoundProfile,
  volumePercent: number,
  vibrate: boolean
): void {
  stopRepeatingAlarm();
  const rate =
    profile === 'cloister_bell' || profile === 'sanctus_chime'
      ? 1.06
      : profile === 'gregorian_tone'
      ? 1.03
      : 1.0;

  playRealCathedralBell(volumePercent, true, rate);

  if (vibrate && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([500, 300, 500]);
    } catch {
      // Ignore
    }
    vibrateIntervalId = window.setInterval(() => {
      try {
        navigator.vibrate([500, 300, 500]);
      } catch {
        // Ignore
      }
    }, 4500);
  }
}

export function stopRepeatingAlarm(): void {
  stopAudioElement();
  if (vibrateIntervalId !== null) {
    window.clearInterval(vibrateIntervalId);
    vibrateIntervalId = null;
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(0);
    } catch {
      // Ignore
    }
  }
}

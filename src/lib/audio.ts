'use client';

import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Sound effects manager
class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private masterVolume: number = 1;
  private enabled: boolean = true;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds(): void {
    // Initialize all sound effects
    // These files will be added in public/sounds/
    const soundsToLoad = [
      { key: 'correct', path: '/sounds/correct.mp3' },
      { key: 'incorrect', path: '/sounds/incorrect.mp3' },
      { key: 'complete', path: '/sounds/complete.mp3' },
      { key: 'level-up', path: '/sounds/level-up.mp3' },
    ];

    soundsToLoad.forEach(({ key, path }) => {
      const sound = new Howl({
        src: [path],
        volume: this.masterVolume,
        preload: true,
        onload: () => {
          // Sound loaded successfully
        },
        onloaderror: () => {
          console.warn(`Failed to load sound: ${key}`);
        },
      });
      this.sounds.set(key, sound);
    });
  }

  play(soundKey: string): void {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.stop();
      sound.play();
    } else {
      console.warn(`Sound not found: ${soundKey}`);
    }
  }

  setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound) => {
      sound.volume(this.masterVolume);
    });
  }

  getVolume(): number {
    return this.masterVolume;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.stop();
    });
  }

  dispose(): void {
    this.stopAll();
    this.sounds.forEach((sound) => {
      sound.unload();
    });
    this.sounds.clear();
  }
}

// Singleton instance
let audioManager: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManager) {
    audioManager = new AudioManager();
  }
  return audioManager;
}

// Hook for using audio in components
export function useAudio() {
  const managerRef = useRef<AudioManager | null>(null);

  useEffect(() => {
    if (!managerRef.current) {
      managerRef.current = getAudioManager();
    }

    // Load user preferences from localStorage
    const savedVolume = localStorage.getItem('audio-volume');
    const savedEnabled = localStorage.getItem('audio-enabled');

    if (savedVolume) {
      managerRef.current.setVolume(parseFloat(savedVolume));
    }
    if (savedEnabled !== null) {
      managerRef.current.setEnabled(JSON.parse(savedEnabled));
    }

    return () => {
      // Cleanup if needed (but don't dispose since it's singleton)
    };
  }, []);

  const play = (soundKey: string) => {
    managerRef.current?.play(soundKey);
  };

  const setVolume = (volume: number) => {
    const manager = managerRef.current;
    if (manager) {
      manager.setVolume(volume);
      localStorage.setItem('audio-volume', volume.toString());
    }
  };

  const setEnabled = (enabled: boolean) => {
    const manager = managerRef.current;
    if (manager) {
      manager.setEnabled(enabled);
      localStorage.setItem('audio-enabled', JSON.stringify(enabled));
    }
  };

  const getVolume = () => managerRef.current?.getVolume() ?? 1;
  const isEnabled = () => managerRef.current?.isEnabled() ?? true;

  return {
    play,
    setVolume,
    setEnabled,
    getVolume,
    isEnabled,
  };
}

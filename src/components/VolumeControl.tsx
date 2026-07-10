'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/audio';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';

/**
 * Volume control component for audio settings
 * Appears in game settings or header
 */
export function VolumeControl({
  showLabel = true,
  compact = false,
}: {
  showLabel?: boolean;
  compact?: boolean;
}) {
  const { getVolume, setVolume, isEnabled, setEnabled } = useAudio();
  const [volume, setLocalVolume] = useState(getVolume());
  const [enabled, setLocalEnabled] = useState(isEnabled());

  useEffect(() => {
    setLocalVolume(getVolume());
    setLocalEnabled(isEnabled());
  }, [getVolume, isEnabled]);

  const handleVolumeChange = (newVolume: number) => {
    setLocalVolume(newVolume);
    setVolume(newVolume);
    if (newVolume > 0 && !enabled) {
      setLocalEnabled(true);
      setEnabled(true);
    }
  };

  const toggleMute = () => {
    const newEnabled = !enabled;
    setLocalEnabled(newEnabled);
    setEnabled(newEnabled);
  };

  if (compact) {
    // Compact version for headers/fixed UI
    return (
      <button
        onClick={toggleMute}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title={enabled ? 'Mute sound' : 'Unmute sound'}
        aria-label={enabled ? 'Mute sound' : 'Unmute sound'}
      >
        {enabled ? (
          <FiVolume2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <FiVolumeX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>
    );
  }

  // Full version with slider
  return (
    <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
      {showLabel && (
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          Sound Effects
        </h3>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-lg transition-colors ${
            enabled
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
          title={enabled ? 'Mute' : 'Unmute'}
          aria-label={enabled ? 'Mute' : 'Unmute'}
        >
          {enabled ? (
            <FiVolume2 className="w-5 h-5" />
          ) : (
            <FiVolumeX className="w-5 h-5" />
          )}
        </button>

        <div className="flex-1">
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
            disabled={!enabled}
            className="w-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Volume"
          />
        </div>

        <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {enabled
          ? `Volume: ${Math.round(volume * 100)}%`
          : 'Sound disabled'}
      </div>
    </div>
  );
}

/**
 * Sound test button to preview effects
 */
export function SoundTestButton() {
  const { play } = useAudio();

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={() => play('correct')}
        className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium transition-colors"
      >
        Test Correct
      </button>
      <button
        onClick={() => play('incorrect')}
        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
      >
        Test Incorrect
      </button>
      <button
        onClick={() => play('complete')}
        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium transition-colors"
      >
        Test Complete
      </button>
    </div>
  );
}

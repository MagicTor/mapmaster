'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/Button';

interface QuestionTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (types: string[], mode: 'practice' | 'challenge') => void;
  title?: string;
}

export const QuestionTypeSelector = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Question Types',
}: QuestionTypeSelectorProps) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState<'practice' | 'challenge' | null>(null);

  const handleToggle = (type: string) => {
    setSelected((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleStart = () => {
    if (selected.length > 0 && selectedMode) {
      onSelect(selected, selectedMode);
      setSelected([]);
      setSelectedMode(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{title}</h2>

        {/* Question Types Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Select Question Types
          </h3>
          <div className="space-y-3">
            {['countries', 'capitals', 'flags'].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(type)}
                  onChange={() => handleToggle(type)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">
                  {type === 'capitals' ? 'Capital Cities' : type.charAt(0).toUpperCase() + type.slice(1)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Mode Section */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Select Game Mode
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="practice"
                checked={selectedMode === 'practice'}
                onChange={(e) => setSelectedMode(e.target.value as 'practice' | 'challenge')}
                className="w-5 h-5"
              />
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Practice Mode</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">Unlimited time & guesses, Reveal/Skip buttons</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="challenge"
                checked={selectedMode === 'challenge'}
                onChange={(e) => setSelectedMode(e.target.value as 'practice' | 'challenge')}
                className="w-5 h-5"
              />
              <div>
                <span className="text-gray-700 dark:text-gray-300 font-medium">Challenge Mode</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">3 lives, no timer, compete on leaderboards</p>
              </div>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {selected.length === 0 && (
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">
            Please select at least one question type
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            disabled={selected.length === 0 || !selectedMode}
            onClick={handleStart}
          >
            Start Game
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

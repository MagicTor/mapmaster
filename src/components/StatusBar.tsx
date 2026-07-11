'use client';

import { motion } from 'framer-motion';

interface StatusBarProps {
  lives: number;
  incorrectGuesses: number;
  progress: number; // 0-1
  totalCountries: number;
  answeredCountries: number;
}

export const StatusBar = ({
  lives,
  incorrectGuesses,
  progress,
  totalCountries,
  answeredCountries,
}: StatusBarProps) => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {answeredCountries} / {totalCountries}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-green-500 to-green-600 h-full"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
          {/* Lives */}
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: i < lives ? 1 : 0.7,
                    opacity: i < lives ? 1 : 0.4,
                  }}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
                    ${i < lives ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'}
                  `}
                >
                  ❤️
                </motion.div>
              ))}
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Lives</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{lives}/3</p>
            </div>
          </div>

          {/* Incorrect Guesses */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-red-600 dark:text-red-300">×</span>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Incorrect</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{incorrectGuesses}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

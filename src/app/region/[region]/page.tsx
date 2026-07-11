'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { QuestionTypeSelector } from '@/components/QuestionTypeSelector';
import { motion } from 'framer-motion';

const COMBOS = [
  { types: ['countries'], label: 'Countries Only' },
  { types: ['capitals'], label: 'Capital Cities Only' },
  { types: ['flags'], label: 'Flags Only' },
  { types: ['countries', 'capitals'], label: 'Countries + Cities' },
  { types: ['countries', 'flags'], label: 'Countries + Flags' },
  { types: ['capitals', 'flags'], label: 'Cities + Flags' },
  { types: ['countries', 'capitals', 'flags'], label: 'Countries + Cities + Flags' },
];

export default function RegionPage() {
  const router = useRouter();
  const params = useParams();
  const region = decodeURIComponent(params.region as string);

  const [showSelector, setShowSelector] = useState(false);
  const [selectorMode, setSelectorMode] = useState<'practice' | 'challenge' | null>(null);

  const initializeGame = useGameStore((s) => s.initializeGame);
  const navigateTo = useUIStore((s) => s.navigateTo);

  const handlePractice = () => {
    setSelectorMode('practice');
    setShowSelector(true);
  };

  const handleChallenge = () => {
    setSelectorMode('challenge');
    setShowSelector(true);
  };

  const handleSelectQuestionTypes = async (types: string[], mode: 'practice' | 'challenge') => {
    setShowSelector(false);
    try {
      navigateTo('loading');
      await initializeGame(region, types, mode);
      router.push(`/game`);
    } catch (error) {
      console.error('Failed to start game:', error);
      navigateTo('region');
    }
  };

  const handleLeaderboard = () => {
    router.push(`/leaderboard/${encodeURIComponent(region)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <button
            onClick={() => router.push('/home')}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2"
          >
            ← Back to Regions
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            {region}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Select a game mode and question types to begin
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12"
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handlePractice}
          >
            🎮 Practice Mode
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={handleChallenge}
          >
            ⚡ Challenge Mode
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleLeaderboard}
          >
            🏆 Leaderboards
          </Button>
        </motion.div>

        {/* Monthly Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            This Month&apos;s Stats
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMBOS.map((combo) => (
              <Card key={combo.label} className="h-full">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {combo.label}
                  </h3>

                  <div className="text-center py-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Status</p>
                    <p className="text-base text-gray-700 dark:text-gray-300 font-medium">
                      Not Yet Completed This Month
                    </p>
                  </div>

                  {/* This will be populated with real data in Phase 5 */}
                  <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                    Complete a Challenge to see your stats
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Question Type Selector Modal */}
        <QuestionTypeSelector
          isOpen={showSelector}
          onClose={() => setShowSelector(false)}
          onSelect={handleSelectQuestionTypes}
          title={selectorMode === 'practice' ? 'Practice Mode' : 'Challenge Mode'}
        />
      </div>
    </div>
  );
}

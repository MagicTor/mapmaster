'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { StatusBar } from '@/components/StatusBar';
import { QuestionPrompt } from '@/components/QuestionPrompt';
import { GameMap } from '@/components/GameMap';
import { Button } from '@/components/Button';
import { VolumeControl } from '@/components/VolumeControl';
import { ErrorBoundary, PageErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingOverlay } from '@/components/Skeleton';
import { useAudio } from '@/lib/audio';
import { motion } from 'framer-motion';

export default function GamePage() {
  const router = useRouter();
  const gameStore = useGameStore();
  const { play } = useAudio();
  
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  const {
    gameId,
    region,
    mode,
    countries,
    currentQuestion,
    answeredCountries,
    correctCountries,
    lives,
    incorrectGuesses,
    submitAnswer,
    skipQuestion,
    revealQuestion,
    completeGame,
  } = gameStore;

  // Redirect if no active game
  useEffect(() => {
    if (!gameId) {
      router.push('/home');
    }
  }, [gameId, router]);

  const progress = countries.length > 0 ? answeredCountries.size / countries.length : 0;
  const isGameComplete = progress === 1;

  const handleCountryClick = async (countryId: string) => {
    if (!currentQuestion || feedback || correctCountries.has(countryId)) return;

    setIsAnswering(true);
    try {
      const result = await submitAnswer(countryId);

      if (result.correct) {
        setFeedback('correct');
        play('correct');
        setTimeout(() => setFeedback(null), 500);

        // Check if game is complete
        if (correctCountries.size === countries.length) {
          // All countries answered
          setTimeout(() => {
            handleGameComplete(true);
          }, 500);
        }
      } else {
        setFeedback('incorrect');
        play('incorrect');
        setTimeout(() => setFeedback(null), 500);

        if (result.gameOver) {
          // Lost all lives
          setTimeout(() => {
            handleGameComplete(false);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      play('incorrect');
    } finally {
      setIsAnswering(false);
    }
  };

  const handleGameComplete = async (successful: boolean) => {
    try {
      if (successful) {
        play('complete');
      }
      const result = await completeGame(successful);
      router.push(`/results?gameId=${gameId}&successful=${successful}`);
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  const handleQuit = () => {
    if (confirm('Are you sure? Your progress will not be saved.')) {
      gameStore.resetGame();
      router.push(`/region/${encodeURIComponent(region || '')}`);
    }
  };

  if (!gameId) {
    return <LoadingOverlay visible message="Loading game..." />;
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Status Bar */}
        <StatusBar
          lives={lives}
          incorrectGuesses={incorrectGuesses}
          progress={progress}
          totalCountries={countries.length}
          answeredCountries={correctCountries.size}
        />

        {/* Main Game Area */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Question */}
            <QuestionPrompt
              question={currentQuestion}
              isAnswering={isAnswering}
              showingFeedback={feedback}
            />

            {/* Game Map */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 overflow-hidden">
              <ErrorBoundary>
                <GameMap
                  countries={countries}
                  answeredCountries={new Set()} // Countries with wrong answers
                  correctCountries={correctCountries}
                  region={region || 'World'}
                  onCountryClick={handleCountryClick}
                  disabled={isAnswering || !!feedback}
                />
              </ErrorBoundary>
            </div>

            {/* Game Controls */}
            <div className="flex flex-wrap gap-3 justify-center">
              {mode === 'practice' && (
                <>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => revealQuestion()}
                    disabled={isAnswering || !currentQuestion}
                  >
                    💡 Reveal
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => skipQuestion()}
                    disabled={isAnswering || !currentQuestion}
                  >
                    ⏭️ Skip
                  </Button>
                </>
              )}

              {/* Audio Control */}
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowAudioSettings(!showAudioSettings)}
              >
                🔊 Sound
              </Button>

              <Button
                variant="danger"
                size="md"
                onClick={handleQuit}
              >
                Quit Game
              </Button>
            </div>

            {/* Audio Settings */}
            {showAudioSettings && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <VolumeControl showLabel compact={false} />
              </motion.div>
            )}

            {/* Game Complete Message */}
            {isGameComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-300"
              >
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                  ✓ All countries identified!
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {mode === 'challenge' ? 'Saving to leaderboard...' : 'Practice complete!'}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameStore = useGameStore();
  
  const [leaderboardRank, setLeaderboardRank] = useState<{ rank: number; totalPlayers: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const successful = searchParams.get('successful') === 'true';
  const { gameId, region, questionTypes, mode, lives, incorrectGuesses, countries, answeredCountries } = gameStore;

  // Fetch leaderboard position if Challenge mode and successful
  useEffect(() => {
    if (mode === 'challenge' && successful && region && questionTypes.length > 0) {
      fetchLeaderboardPosition();
    }
  }, [mode, successful, region, questionTypes]);

  const fetchLeaderboardPosition = async () => {
    setIsLoading(true);
    try {
      const combo = [...questionTypes].sort().join('-');
      const response = await fetch(
        `/api/leaderboards/${encodeURIComponent(region!)}/user?month=${new Date().getMonth() + 1}&year=${new Date().getFullYear()}`,
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboardRank({ rank: data.rank, totalPlayers: data.totalPlayers });
      }
    } catch (error) {
      console.error('Error fetching leaderboard position:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAgain = () => {
    gameStore.resetGame();
    router.push(`/region/${encodeURIComponent(region || '')}`);
  };

  const handleHome = () => {
    gameStore.resetGame();
    router.push('/home');
  };

  if (!gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Loading results...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round((answeredCountries.size / countries.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Result Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          {successful ? (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">
                {mode === 'challenge' ? 'Challenge Complete!' : 'Practice Complete!'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Great job identifying all countries!
              </p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">😔</div>
              <h1 className="text-4xl md:text-5xl font-bold text-red-600 dark:text-red-400 mb-2">
                Game Over
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You ran out of lives. Better luck next time!
              </p>
            </>
          )}
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="mb-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                  Game Summary
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Region</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{region}</p>
                </div>

                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Countries</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {answeredCountries.size}/{countries.length}
                  </p>
                </div>

                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lives</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{lives}/3</p>
                </div>

                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Incorrect</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{incorrectGuesses}</p>
                </div>
              </div>

              {/* Question Types */}
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Question Types</p>
                <div className="flex flex-wrap gap-2">
                  {questionTypes.map((type) => (
                    <span
                      key={type}
                      className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white text-sm rounded-full capitalize"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Completion</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{progressPercentage}%</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Leaderboard Position (Challenge Only) */}
        {mode === 'challenge' && successful && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="mb-6 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300">
              <div className="text-center">
                {isLoading ? (
                  <p className="text-gray-600 dark:text-gray-400">Loading leaderboard position...</p>
                ) : leaderboardRank ? (
                  <>
                    <h3 className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-2">
                      Your Leaderboard Rank
                    </h3>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                      #{leaderboardRank.rank}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      of {leaderboardRank.totalPlayers} players this month
                    </p>
                  </>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">
                    Result saved to leaderboard
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={handlePlayAgain}
          >
            Play Again
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={handleHome}
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

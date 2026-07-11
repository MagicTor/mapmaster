'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';

const COMBOS = [
  { types: ['countries'], label: 'Countries' },
  { types: ['capitals'], label: 'Cities' },
  { types: ['flags'], label: 'Flags' },
  { types: ['countries', 'capitals'], label: 'Countries + Cities' },
  { types: ['countries', 'flags'], label: 'Countries + Flags' },
  { types: ['capitals', 'flags'], label: 'Cities + Flags' },
  { types: ['countries', 'capitals', 'flags'], label: 'All' },
];

interface LeaderboardEntry {
  rank: number;
  username: string;
  livesRemaining: number;
  incorrectGuesses: number;
  completedAt: string;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const params = useParams();
  const region = decodeURIComponent(params.region as string);

  const [selectedCombo, setSelectedCombo] = useState(0);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const combo = COMBOS[selectedCombo].types.sort().join('-');
      const response = await fetch(
        `/api/leaderboards/${encodeURIComponent(region)}/${combo}?month=${month}&year=${year}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
      setEntries([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCombo, month, year, region]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleMonthChange = (newMonth: number) => {
    setMonth(newMonth);
  };

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2"
          >
            ← Back
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            🏆 {region} Leaderboards
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Rankings are based on accuracy and lives remaining
          </p>
        </motion.div>

        {/* Month/Year Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="px-3 py-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-sm text-gray-600 dark:text-gray-400">
              Showing {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })} {year}
            </span>
          </div>
        </motion.div>

        {/* Combo Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2"
        >
          {COMBOS.map((combo, idx) => (
            <button
              key={combo.label}
              onClick={() => setSelectedCombo(idx)}
              className={`
                px-4 py-2 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap
                ${
                  selectedCombo === idx
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-blue-400'
                }
              `}
            >
              {combo.label}
            </button>
          ))}
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No completions yet for this combination this month
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Rank
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Player
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Lives
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Incorrect
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`
                          border-b border-gray-100 dark:border-gray-700 transition-colors
                          ${idx % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                          hover:bg-blue-50 dark:hover:bg-blue-900/20
                        `}
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-lg text-gray-900 dark:text-white">
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {entry.username}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-bold">
                            {entry.livesRemaining}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-bold">
                            {entry.incorrectGuesses}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(entry.completedAt).toLocaleDateString()}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center mt-8"
        >
          <Button variant="secondary" onClick={() => router.back()}>
            Back to Region
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

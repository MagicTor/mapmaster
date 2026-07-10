'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
}

/**
 * Skeleton loader component for loading states
 * Animated gray placeholder while content loads
 */
export function Skeleton({
  width = '100%',
  height = '16px',
  className = '',
  circle = false,
}: SkeletonProps) {
  const baseClasses =
    'bg-gray-300 dark:bg-gray-700 animate-pulse rounded';
  const shapeClasses = circle ? 'rounded-full' : 'rounded';

  return (
    <motion.div
      className={`${baseClasses} ${shapeClasses} ${className}`}
      style={{ width, height }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    />
  );
}

/**
 * Loading spinner component
 * Centered rotating spinner
 */
export function LoadingSpinner({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <motion.div
      className={`${sizeMap[size]} border-4 border-gray-300 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 rounded-full ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
}

/**
 * Loading overlay component
 * Full-screen loading indicator
 */
export function LoadingOverlay({
  visible = true,
  message = 'Loading...',
}: {
  visible?: boolean;
  message?: string;
}) {
  if (!visible) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl p-8 text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        {message && (
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {message}
          </p>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Card skeleton for list items
 */
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
      <div className="space-y-3">
        <Skeleton height="20px" />
        <Skeleton height="16px" width="80%" />
        <div className="flex gap-2 pt-2">
          <Skeleton height="32px" width="40%" />
          <Skeleton height="32px" width="40%" />
        </div>
      </div>
    </div>
  );
}

/**
 * Game stats skeleton
 */
export function GameStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-900 rounded-lg shadow p-4"
        >
          <Skeleton height="14px" width="60%" className="mb-2" />
          <Skeleton height="28px" width="80%" />
        </div>
      ))}
    </div>
  );
}

/**
 * Table skeleton for leaderboards
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-800 p-4 grid grid-cols-4 gap-4 border-b">
        <Skeleton height="16px" width="60%" />
        <Skeleton height="16px" width="70%" />
        <Skeleton height="16px" width="60%" />
        <Skeleton height="16px" width="50%" />
      </div>

      {/* Rows */}
      <div className="divide-y">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="p-4 grid grid-cols-4 gap-4">
            <Skeleton height="16px" width="40%" />
            <Skeleton height="16px" width="70%" />
            <Skeleton height="16px" width="50%" />
            <Skeleton height="16px" width="60%" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Game map skeleton
 */
export function MapSkeleton() {
  return (
    <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
      </div>
    </div>
  );
}

/**
 * Region selection skeleton
 */
export function RegionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton
          key={i}
          height="120px"
          className="rounded-lg"
        />
      ))}
    </div>
  );
}

/**
 * Combined page loading state
 * Shows skeleton for entire game page
 */
export function GamePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Skeleton height="32px" width="200px" className="mb-4" />
          <Skeleton height="18px" width="300px" />
        </div>

        {/* Map area */}
        <div className="mb-6">
          <MapSkeleton />
        </div>

        {/* Question and controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton height="60px" className="rounded-lg mb-4" />
            <Skeleton height="100px" className="rounded-lg" />
          </div>
          <div>
            <GameStatsSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

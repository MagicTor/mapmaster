'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { motion } from 'framer-motion';

const REGIONS = [
  { name: 'World', countries: 203 },
  { name: 'North America', countries: 24 },
  { name: 'South America', countries: 13 },
  { name: 'Europe', countries: 47 },
  { name: 'Asia', countries: 47 },
  { name: 'Africa', countries: 55 },
  { name: 'Oceania', countries: 17 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const router = useRouter();
  const selectRegion = useUIStore((s) => s.selectRegion);

  const handleSelectRegion = (region: string) => {
    selectRegion(region);
    router.push(`/region/${encodeURIComponent(region)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            COUNTRIES OF THE WORLD
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Test your geography knowledge. Identify countries by name, capital city, or flag across all 7 continents.
          </p>
        </motion.div>

        {/* Regions Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {REGIONS.map((region) => (
            <motion.div key={region.name} variants={item}>
              <Card
                onClick={() => handleSelectRegion(region.name)}
                className="cursor-pointer transform hover:scale-105 transition-transform duration-300 h-full"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {region.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {region.countries} countries & territories
                  </p>
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRegion(region.name);
                    }}
                  >
                    Play →
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12 text-gray-600 dark:text-gray-400"
        >
          <p>Select a region to begin playing. Choose between Practice and Challenge modes.</p>
        </motion.div>
      </div>
    </div>
  );
}

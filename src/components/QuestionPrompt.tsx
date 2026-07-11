'use client';

import Image from 'next/image';
import type { Question } from '@/store/gameStore';

interface QuestionPromptProps {
  question: Question | null;
  isAnswering?: boolean;
  showingFeedback?: 'correct' | 'incorrect' | null;
}

export const QuestionPrompt = ({
  question,
  isAnswering = false,
  showingFeedback = null,
}: QuestionPromptProps) => {
  if (!question) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
      </div>
    );
  }

  const backgroundColor =
    showingFeedback === 'correct'
      ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
      : showingFeedback === 'incorrect'
        ? 'bg-red-50 dark:bg-red-900/20 border-red-300'
        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300';

  const borderColor =
    showingFeedback === 'correct'
      ? 'border-green-300'
      : showingFeedback === 'incorrect'
        ? 'border-red-300'
        : 'border-blue-300';

  return (
    <div
      className={`
        w-full max-w-2xl mx-auto px-4 py-6
        ${backgroundColor}
        border-2 ${borderColor}
        rounded-lg transition-all duration-300
      `}
    >
      <div className="text-center">
        {question.type === 'flags' && question.flagUrl && (
          <div className="mb-4 flex justify-center">
            <Image
              src={question.flagUrl}
              alt="Flag"
              width={160}
              height={96}
              className="h-24 w-auto rounded shadow-md"
            />
          </div>
        )}

        <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
          {question.type === 'flags' ? 'Find' : 'Find:'}
        </p>

        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
          {question.prompt}
        </h2>

        {showingFeedback === 'correct' && (
          <p className="mt-4 text-green-600 dark:text-green-400 font-semibold">
            ✓ Correct! Click the next country.
          </p>
        )}

        {showingFeedback === 'incorrect' && (
          <p className="mt-4 text-red-600 dark:text-red-400 font-semibold">
            ✗ Incorrect. Try again!
          </p>
        )}

        {isAnswering && (
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
            Click a country on the map to answer
          </p>
        )}
      </div>
    </div>
  );
};

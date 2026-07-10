import { create } from 'zustand';

export interface Country {
  id: string; // ISO 3166-1 alpha-2
  name: string;
  capital: string;
  region: string;
  flagUrl: string;
  svgPath?: string;
}

export interface Question {
  type: 'countries' | 'capitals' | 'flags';
  prompt: string;
  targetCountryId: string;
  targetCountry?: Country;
  flagUrl?: string;
}

export interface GameStoreState {
  // Game state
  gameId: string | null;
  region: string | null;
  questionTypes: string[];
  mode: 'practice' | 'challenge' | null;
  isLoading: boolean;
  
  // Game data
  countries: Country[];
  currentQuestion: Question | null;
  answeredCountries: Set<string>; // Countries with wrong answers
  correctCountries: Set<string>; // Countries with correct answers
  
  // Stats
  lives: number;
  incorrectGuesses: number;
  startedAt: Date | null;
  
  // Actions
  initializeGame: (region: string, questionTypes: string[], mode: 'practice' | 'challenge') => Promise<void>;
  submitAnswer: (countryId: string) => Promise<{ correct: boolean; gameOver?: boolean }>;
  completeGame: (successful: boolean) => Promise<any>;
  skipQuestion: () => void;
  revealQuestion: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameId: null,
  region: null,
  questionTypes: [],
  mode: null,
  isLoading: false,
  countries: [],
  currentQuestion: null,
  answeredCountries: new Set(),
  correctCountries: new Set(),
  lives: 3,
  incorrectGuesses: 0,
  startedAt: null,

  initializeGame: async (region, questionTypes, mode) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ region, questionTypes, mode }),
      });

      if (!response.ok) throw new Error('Failed to create game');

      const data = await response.json();
      
      set({
        gameId: data.gameId,
        region: data.region,
        questionTypes: data.questionTypes,
        mode: data.mode,
        countries: data.countries,
        currentQuestion: data.countries.length > 0 ? generateQuestion(data.countries, data.questionTypes, new Set()) : null,
        answeredCountries: new Set(),
        lives: 3,
        incorrectGuesses: 0,
        startedAt: new Date(),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error initializing game:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  submitAnswer: async (countryId) => {
    const state = get();
    if (!state.gameId || !state.currentQuestion) {
      throw new Error('No active game');
    }

    try {
      const response = await fetch(`/api/games/${state.gameId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryId,
          questionType: state.currentQuestion.type,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const data = await response.json();
      const isCorrect = data.correct;

      if (isCorrect) {
        // Mark country as correctly answered
        set((state) => ({
          correctCountries: new Set([...state.correctCountries, countryId]),
          currentQuestion: generateNextQuestion(state.countries, state.questionTypes, new Set([...state.correctCountries, countryId])),
        }));
      } else {
        // Wrong answer
        set((state) => ({
          answeredCountries: new Set([...state.answeredCountries, countryId]),
        }));

        if (state.mode === 'challenge') {
          const newLives = state.lives - 1;
          set({ lives: newLives, incorrectGuesses: state.incorrectGuesses + 1 });
          
          // Check if game over
          if (newLives === 0) {
            return { correct: false, gameOver: true };
          }
        } else {
          // Practice mode: just increment incorrect guesses
          set({ incorrectGuesses: state.incorrectGuesses + 1 });
        }
      }

      return { correct: isCorrect };
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw error;
    }
  },

  completeGame: async (successful) => {
    const state = get();
    if (!state.gameId) throw new Error('No active game');

    try {
      const response = await fetch(`/api/games/${state.gameId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successful,
          livesRemaining: state.lives,
          incorrectGuesses: state.incorrectGuesses,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to complete game');

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error completing game:', error);
      throw error;
    }
  },

  skipQuestion: () => {
    const state = get();
    if (state.mode === 'practice') {
      set((state) => ({
        currentQuestion: generateNextQuestion(state.countries, state.questionTypes, state.correctCountries),
      }));
    }
  },

  revealQuestion: () => {
    const state = get();
    if (state.mode === 'practice' && state.currentQuestion) {
      const countryId = state.currentQuestion.targetCountryId;
      set((state) => ({
        correctCountries: new Set([...state.correctCountries, countryId]),
        currentQuestion: generateNextQuestion(state.countries, state.questionTypes, new Set([...state.correctCountries, countryId])),
      }));
    }
  },

  resetGame: () => {
    set({
      gameId: null,
      region: null,
      questionTypes: [],
      mode: null,
      countries: [],
      currentQuestion: null,
      answeredCountries: new Set(),
      correctCountries: new Set(),
      lives: 3,
      incorrectGuesses: 0,
      startedAt: null,
    });
  },
}));

/**
 * Generate initial question from country list
 */
function generateQuestion(countries: Country[], questionTypes: string[], answered: Set<string>): Question | null {
  const unanswered = countries.filter((c) => !answered.has(c.id));
  if (unanswered.length === 0) return null;

  const target = unanswered[Math.floor(Math.random() * unanswered.length)];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)] as
    | 'countries'
    | 'capitals'
    | 'flags';

  if (questionType === 'countries') {
    return {
      type: 'countries',
      prompt: `Find ${target.name}`,
      targetCountryId: target.id,
      targetCountry: target,
    };
  } else if (questionType === 'capitals') {
    return {
      type: 'capitals',
      prompt: `Find ${target.capital}`,
      targetCountryId: target.id,
      targetCountry: target,
    };
  } else if (questionType === 'flags') {
    return {
      type: 'flags',
      prompt: 'Find',
      targetCountryId: target.id,
      targetCountry: target,
      flagUrl: target.flagUrl,
    };
  }

  return null;
}

/**
 * Generate next question
 */
function generateNextQuestion(countries: Country[], questionTypes: string[], answered: Set<string>): Question | null {
  return generateQuestion(countries, questionTypes, answered);
}

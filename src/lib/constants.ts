// Constants for the MapMaster application

export const REGIONS = {
  WORLD: 'World',
  AFRICA: 'Africa',
  EUROPE: 'Europe',
  ASIA: 'Asia',
  NORTH_AMERICA: 'North America',
  SOUTH_AMERICA: 'South America',
  OCEANIA: 'Oceania',
} as const;

export const GAME_MODES = {
  PRACTICE: 'practice',
  TIMED: 'timed',
  CHALLENGE: 'challenge',
} as const;

export const DIFFICULTIES = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const;

export const QUIZ_TYPES = {
  COUNTRY: 'Country',
  CAPITAL: 'Capital',
  FLAG: 'Flag',
} as const;

// Scoring configuration
export const SCORING = {
  BASE_CORRECT: 100,
  BASE_INCORRECT: -10,
  SPEED_BONUS: {
    '0-5': 50,
    '5-10': 25,
    '10+': 0,
  },
  STREAK_BONUS: {
    EVERY_5: 25,
    EVERY_10: 50,
  },
  PERFECT_GAME: 500,
  DIFFICULTY_MULTIPLIER: {
    easy: 1,
    medium: 1.5,
    hard: 2,
    expert: 2.5,
  },
} as const;

// Timer settings (in seconds)
export const TIMER_PRESETS = {
  NO_TIMER: 0,
  30: 30,
  60: 60,
  120: 120,
} as const;

// XP and Progression
export const PROGRESSION = {
  BASE_XP_PER_QUESTION: 10,
  CORRECT_MULTIPLIER: 1.5,
  INCORRECT_MULTIPLIER: 1,
  XP_PER_LEVEL: 1000,
  MAX_LEVEL: 100,
  RANKS: [
    { level: 1, name: 'Beginner', min: 0, max: 10 },
    { level: 11, name: 'Explorer', min: 11, max: 25 },
    { level: 26, name: 'Cartographer', min: 26, max: 40 },
    { level: 41, name: 'Geographer', min: 41, max: 60 },
    { level: 61, name: 'Atlas Master', min: 61, max: 85 },
    { level: 86, name: 'World Expert', min: 86, max: 100 },
  ],
} as const;

// Question configuration
export const QUESTIONS = {
  QUESTIONS_PER_GAME: 10,
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 50,
  EASY_COUNTRY_COUNT: 25,
  MEDIUM_COUNTRY_COUNT: 60,
  HARD_COUNTRY_COUNT: 80,
  EXPERT_COUNTRY_COUNT: 195,
} as const;

// Colors for UI
export const COLORS = {
  PRIMARY: '#0ea5e9',
  SECONDARY: '#a855f7',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
  NEUTRAL: '#6b7280',
  BACKGROUND: '#ffffff',
  BACKGROUND_DARK: '#111827',
  TEXT: '#111827',
  TEXT_LIGHT: '#ffffff',
} as const;

// Sound files
export const SOUNDS = {
  CORRECT: '/sounds/correct.mp3',
  INCORRECT: '/sounds/incorrect.mp3',
  LEVEL_UP: '/sounds/level-up.mp3',
  ACHIEVEMENT: '/sounds/achievement.mp3',
  TIMER_WARNING: '/sounds/timer-warning.mp3',
  GAME_END: '/sounds/game-end.mp3',
} as const;

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
} as const;

// Rate limits
export const RATE_LIMITS = {
  GAME_SUBMIT: { limit: 100, window: 60 * 1000 }, // 100 per minute
  LEADERBOARD: { limit: 30, window: 60 * 1000 }, // 30 per minute
  STATS: { limit: 20, window: 60 * 1000 }, // 20 per minute
  CREATE_GAME: { limit: 10, window: 5 * 60 * 1000 }, // 10 per 5 minutes
  DEFAULT: { limit: 60, window: 60 * 1000 }, // 60 per minute
} as const;

// Pagination
export const PAGINATION = {
  LEADERBOARD_LIMIT: 50,
  GAMES_LIMIT: 20,
  ACHIEVEMENTS_LIMIT: 12,
  MAX_LIMIT: 100,
} as const;

// Cache durations (in seconds)
export const CACHE_DURATION = {
  LEADERBOARD: 300, // 5 minutes
  COUNTRY_DATA: 86400, // 1 day
  USER_STATS: 1800, // 30 minutes
  ACHIEVEMENTS: 3600, // 1 hour
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
} as const;

// Session configuration
export const SESSION = {
  MAX_DURATION: 15 * 60 * 1000, // 15 minutes
  WARN_DURATION: 13 * 60 * 1000, // 13 minutes
  IDLE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
} as const;

// Accessibility
export const A11Y = {
  FOCUS_VISIBLE_STYLE: {
    outline: '2px solid #0ea5e9',
    outlineOffset: '2px',
  },
  SKIP_LINK_CLASS: 'skip-to-main-content',
  FOCUS_TRAP_CLASS: 'focus-trap',
} as const;

// Validation patterns
export const VALIDATION = {
  USERNAME: /^[a-zA-Z0-9_-]{3,50}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_MULTIPLAYER: process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER === 'true',
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DAILY_CHALLENGES: true,
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_LEADERBOARDS: true,
  ENABLE_STATISTICS: true,
} as const;

// Environment
export const ENVIRONMENT = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isStaging: process.env.NEXT_PUBLIC_ENVIRONMENT === 'staging',
} as const;

// Browser detection
export const BROWSER = {
  IS_TOUCH_DEVICE: typeof window !== 'undefined' && 'ontouchstart' in window,
  IS_MOBILE: typeof window !== 'undefined' && /mobile/i.test(navigator.userAgent),
  SUPPORTS_WEBP: typeof window !== 'undefined' && (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })(),
} as const;

// Core game types
export type GameMode = 'practice' | 'timed' | 'challenge';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type QuizType = 'Country' | 'Capital' | 'Flag';
export type Region = 'World' | 'Africa' | 'Europe' | 'Asia' | 'North America' | 'South America' | 'Oceania';

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  status: 'active' | 'banned' | 'deleted';
  level: number;
  xp: bigint;
  totalGamesPlayed: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  rank: string;
  joinedAt: Date;
  gamesPlayed: number;
  totalScore: number;
  overallAccuracy: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
}

export interface UserStats {
  userId: string;
  overallStats: {
    gamesPlayed: number;
    totalQuestionsAnswered: number;
    totalCorrect: number;
    totalIncorrect: number;
    overallAccuracy: number;
    averageScore: number;
    bestScore: number;
    totalTimePlayedHours: number;
  };
  regionStats: Record<string, RegionStat>;
  modeStats: Record<GameMode, ModeStat>;
  countryStats: Record<string, CountryStat>;
  trends?: {
    period: string;
    trend: 'improving' | 'declining' | 'stable';
    dailyData: DailyTrendData[];
  };
}

export interface RegionStat {
  gamesPlayed: number;
  accuracy: number;
  totalScore: number;
  correctCount?: number;
  totalCount?: number;
}

export interface ModeStat {
  gamesPlayed: number;
  accuracy: number;
  totalScore: number;
  averageScore?: number;
}

export interface CountryStat {
  countryId: string;
  countryName: string;
  guessedCount: number;
  correctCount: number;
  accuracy: number;
  region: string;
}

export interface DailyTrendData {
  date: string;
  gamesPlayed: number;
  averageScore: number;
  averageAccuracy: number;
}

// Country types
export interface Country {
  id: string;
  iso2: string;
  iso3: string;
  numeric: number;
  name: string;
  officialName?: string;
  commonNames?: string[];
  region: Region;
  subRegion?: string;
  capital?: string;
  latitude?: number;
  longitude?: number;
  centroid?: [number, number]; // [lon, lat] for map center
  bounds?: { x: [number, number]; y: [number, number] }; // Geographic bounds
  area?: number;
  population?: number;
  timezone?: string;
  currencies?: string[];
  languages?: string[];
  flagUrl?: string;
  flagEmoji?: string;
  difficulty: Difficulty;
  isDisputed: boolean;
  recognized: boolean;
}

// Game types
export interface Question {
  index: number;
  type: QuizType;
  prompt: string;
  countryId: string;
  imageUrl?: string;
}

export interface GameSetupOptions {
  regions: Region[];
  quizTypes: QuizType[];
  gameMode: GameMode;
  difficulty: Difficulty;
  timerSetting?: number;
  questionCount?: number;
}

export interface GameSession {
  gameId: string;
  userId: string;
  selectedRegions: Region[];
  quizTypes: QuizType[];
  gameMode: GameMode;
  difficulty: Difficulty;
  timerSetting?: number;
  questions: Question[];
  countryBounds: GeoJSON.FeatureCollection;
  startedAt: Date;
  expiresAt: Date;
}

export interface GameState {
  gameId: string;
  userId: string;
  status: 'active' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  questionCount: number;
  score: number;
  accuracy: number;
  streak: number;
  timeRemaining?: number;
  startedAt: Date;
}

export interface GameAnswer {
  questionIndex: number;
  questionType: QuizType;
  prompt: string;
  countryId: string;
  selectedCountryId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsAwarded: number;
}

export interface GameResult {
  gameId: string;
  finalScore: number;
  finalAccuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  durationSeconds: number;
  averageResponseTime: number;
  longestStreak: number;
  gameMode: GameMode;
  difficulty: Difficulty;
  regionPerformance: Record<string, RegionPerformance>;
  answers: GameAnswer[];
  achievements: UnlockedAchievement[];
  xpGained: number;
  levelUp: boolean;
  previousStats?: {
    gamesPlayed: number;
    totalScore: number;
  };
}

export interface RegionPerformance {
  correct: number;
  total: number;
  accuracy: number;
}

// Achievement types
export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: 'milestone' | 'accuracy' | 'speed' | 'region' | 'challenge' | 'streak' | 'prestige' | 'social';
  xpReward: number;
  icon?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  unlockedCount: number;
  isUnlocked: boolean;
  displayOrder?: number;
  isHidden: boolean;
}

export interface UnlockedAchievement {
  id: string;
  name: string;
  description?: string;
  xpReward: number;
  icon?: string;
  unlockedAt: Date;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  accuracy: number;
  level: number;
  gamesPlayed: number;
  lastPlayed?: Date;
}

export interface LeaderboardResponse {
  type: 'daily' | 'weekly' | 'monthly' | 'all-time';
  totalEntries: number;
  userRank?: number;
  userEntry?: LeaderboardEntry;
  entries: LeaderboardEntry[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  hint?: string;
}

// UI types
export interface Toast {
  id: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
}

// Settings types
export interface GameSettings {
  soundEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  notificationsEnabled: boolean;
  colorblindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
  highContrastMode: boolean;
  animationsEnabled: boolean;
  theme: 'light' | 'dark';
}

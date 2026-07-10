import { create } from 'zustand';

export interface UserProfile {
  id: string;
  clerkId: string;
  username: string;
  displayName: string;
  createdAt: Date;
}

export interface UserStats {
  totalChallengesCompleted: number;
  averageLivesRemaining: number;
  averageIncorrectGuesses: number;
}

export interface UserStoreState {
  // Auth
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Profile
  profile: UserProfile | null;
  
  // Stats (cached)
  stats: UserStats | null;
  cachedLeaderboardPositions: Map<string, { rank: number; totalPlayers: number }>;
  
  // Actions
  setUser: (userId: string, profile: UserProfile) => void;
  logout: () => void;
  updateStats: (stats: UserStats) => void;
  cacheLeaderboardPosition: (key: string, rank: number, totalPlayers: number) => void;
  getLeaderboardPosition: (key: string) => { rank: number; totalPlayers: number } | null;
}

export const useUserStore = create<UserStoreState>((set, get) => ({
  userId: null,
  isAuthenticated: false,
  isLoading: false,
  profile: null,
  stats: null,
  cachedLeaderboardPositions: new Map(),

  setUser: (userId, profile) => set({
    userId,
    profile,
    isAuthenticated: true,
  }),

  logout: () => set({
    userId: null,
    isAuthenticated: false,
    profile: null,
    stats: null,
    cachedLeaderboardPositions: new Map(),
  }),

  updateStats: (stats) => set({ stats }),

  cacheLeaderboardPosition: (key, rank, totalPlayers) => {
    const { cachedLeaderboardPositions } = get();
    cachedLeaderboardPositions.set(key, { rank, totalPlayers });
    set({ cachedLeaderboardPositions: new Map(cachedLeaderboardPositions) });
  },

  getLeaderboardPosition: (key) => {
    const { cachedLeaderboardPositions } = get();
    return cachedLeaderboardPositions.get(key) || null;
  },
}));

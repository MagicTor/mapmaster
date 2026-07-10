import { create } from 'zustand';

export interface UIStoreState {
  // Navigation
  currentPage: 'home' | 'region' | 'game' | 'results' | 'leaderboard' | 'loading';
  
  // Selections
  selectedRegion: string | null;
  selectedQuestionTypes: string[];
  selectedMode: 'practice' | 'challenge' | null;
  
  // Leaderboard filter
  selectedMonth: number;
  selectedYear: number;
  selectedLeaderboardCombo: string | null;
  
  // Modals
  showQuestionTypeSelector: boolean;
  showConfirmDialog: boolean;
  confirmDialogMessage: string;
  
  // Actions
  navigateTo: (page: UIStoreState['currentPage']) => void;
  selectRegion: (region: string) => void;
  selectQuestionTypes: (types: string[]) => void;
  selectMode: (mode: 'practice' | 'challenge') => void;
  selectMonth: (month: number) => void;
  selectYear: (year: number) => void;
  selectLeaderboardCombo: (combo: string) => void;
  openQuestionTypeSelector: () => void;
  closeQuestionTypeSelector: () => void;
  showConfirm: (message: string) => void;
  closeConfirm: () => void;
  reset: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  currentPage: 'home',
  selectedRegion: null,
  selectedQuestionTypes: [],
  selectedMode: null,
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  selectedLeaderboardCombo: null,
  showQuestionTypeSelector: false,
  showConfirmDialog: false,
  confirmDialogMessage: '',

  navigateTo: (page) => set({ currentPage: page }),
  
  selectRegion: (region) => set({ selectedRegion: region }),
  
  selectQuestionTypes: (types) => set({ selectedQuestionTypes: types }),
  
  selectMode: (mode) => set({ selectedMode: mode }),
  
  selectMonth: (month) => set({ selectedMonth: month }),
  
  selectYear: (year) => set({ selectedYear: year }),
  
  selectLeaderboardCombo: (combo) => set({ selectedLeaderboardCombo: combo }),
  
  openQuestionTypeSelector: () => set({ showQuestionTypeSelector: true }),
  
  closeQuestionTypeSelector: () => set({ showQuestionTypeSelector: false }),
  
  showConfirm: (message) => set({ showConfirmDialog: true, confirmDialogMessage: message }),
  
  closeConfirm: () => set({ showConfirmDialog: false, confirmDialogMessage: '' }),
  
  reset: () => set({
    currentPage: 'home',
    selectedRegion: null,
    selectedQuestionTypes: [],
    selectedMode: null,
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),
    selectedLeaderboardCombo: null,
    showQuestionTypeSelector: false,
    showConfirmDialog: false,
    confirmDialogMessage: '',
  }),
}));

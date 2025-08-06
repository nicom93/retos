import { BettingChallenge } from '../types';

const STORAGE_KEY = 'betting-challenges';

export const storageService = {
  // Get all challenges from localStorage
  getAllChallenges: (): BettingChallenge[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const challenges = JSON.parse(stored);
      return challenges.map((challenge: any) => ({
        ...challenge,
        createdAt: new Date(challenge.createdAt),
        updatedAt: new Date(challenge.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading challenges:', error);
      return [];
    }
  },

  // Save all challenges to localStorage
  saveAllChallenges: (challenges: BettingChallenge[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
    } catch (error) {
      console.error('Error saving challenges:', error);
    }
  },

  // Add a new challenge
  addChallenge: (challenge: Omit<BettingChallenge, 'id' | 'createdAt' | 'updatedAt'>): BettingChallenge => {
    const challenges = storageService.getAllChallenges();
    const newChallenge: BettingChallenge = {
      ...challenge,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    challenges.push(newChallenge);
    storageService.saveAllChallenges(challenges);
    return newChallenge;
  },

  // Update an existing challenge
  updateChallenge: (id: string, updates: Partial<BettingChallenge>): BettingChallenge | null => {
    const challenges = storageService.getAllChallenges();
    const index = challenges.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    const updatedChallenge: BettingChallenge = {
      ...challenges[index],
      ...updates,
      updatedAt: new Date()
    };
    
    challenges[index] = updatedChallenge;
    storageService.saveAllChallenges(challenges);
    return updatedChallenge;
  },

  // Delete a challenge
  deleteChallenge: (id: string): boolean => {
    const challenges = storageService.getAllChallenges();
    const filtered = challenges.filter(c => c.id !== id);
    
    if (filtered.length === challenges.length) return false;
    
    storageService.saveAllChallenges(filtered);
    return true;
  },

  // Clear all data
  clearAllData: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  }
}; 
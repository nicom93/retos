export interface Bet {
  id: string;
  amount: number;
  odds: number;
  result: 'win' | 'loss' | 'pending';
  profit: number;
  timestamp: Date;
}

export interface Step {
  id: string;
  stepNumber: number;
  bet: Bet;
  totalBefore: number;
  totalAfter: number;
  timestamp: Date;
}

export interface Challenge {
  id: string;
  date: string; // YYYY-MM-DD format
  steps: Step[];
  totalProfit: number;
  finalResult: 'completed' | 'failed' | 'in_progress';
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyStats {
  date: string;
  challenges: Challenge[];
  totalProfit: number;
  totalChallenges: number;
  successfulChallenges: number;
}

export interface BetFormData {
  amount: number;
  odds: number;
} 
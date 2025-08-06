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
  date: string;
  steps: Step[];
  totalProfit: number;
  finalResult: 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyStats {
  date: string;
  totalChallenges: number;
  completedChallenges: number;
  failedChallenges: number;
  totalProfit: number;
}

export interface BetFormData {
  amount: number;
  odds: number;
} 
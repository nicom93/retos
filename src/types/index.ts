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
  totalMoneyInvested: number;
  maxReached: number;
}

export interface BetFormData {
  amount: number;
  odds: number;
}

export interface BettingChallenge {
  id: string;
  date: string; // YYYY-MM-DD format
  initialInvestment: number;
  totalSteps: number;
  maxAmountReached: number;
  finalResult: 'completo' | 'fallido' | 'abandonado' | 'en curso';
  observations?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChallengeStats {
  totalChallenges: number;
  averageSteps: number;
  totalInvestment: number;
  totalMaxGain: number;
  averagePerformance: number;
  completedChallenges: number;
  failedChallenges: number;
  abandonedChallenges: number;
  inProgressChallenges: number;
}

export interface AnalyticsData {
  bestPerformingChallenge: BettingChallenge | null;
  challengesOver5Steps: number;
  averagePerformance: number;
  totalNetGain: number;
  successRate: number;
} 
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
  moneyBefore: number;
  moneyAfter: number;
  timestamp: Date;
}

export interface Challenge {
  id: string;
  startDate: Date;
  initialMoney: number;
  maxMoneyReached: number;
  steps: Step[];
  finalMoney: number;
  status: 'in_progress' | 'completed' | 'failed';
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
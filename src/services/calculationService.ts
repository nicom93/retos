import { BettingChallenge, ChallengeStats, AnalyticsData } from '../types';

export const calculationService = {
  // Calculate performance percentage
  calculatePerformance: (maxAmount: number, initialInvestment: number): number => {
    if (initialInvestment <= 0) return 0;
    return ((maxAmount / initialInvestment) * 100) - 100;
  },

  // Calculate net gain
  calculateNetGain: (maxAmount: number, initialInvestment: number): number => {
    return maxAmount - initialInvestment;
  },

  // Calculate challenge statistics
  calculateStats: (challenges: BettingChallenge[]): ChallengeStats => {
    if (challenges.length === 0) {
      return {
        totalChallenges: 0,
        averageSteps: 0,
        totalInvestment: 0,
        totalMaxGain: 0,
        averagePerformance: 0,
        completedChallenges: 0,
        failedChallenges: 0,
        abandonedChallenges: 0,
        inProgressChallenges: 0
      };
    }

    const totalChallenges = challenges.length;
    const averageSteps = challenges.reduce((sum, c) => sum + c.totalSteps, 0) / totalChallenges;
    const totalInvestment = challenges.reduce((sum, c) => sum + c.initialInvestment, 0);
    const totalMaxGain = challenges.reduce((sum, c) => sum + c.maxAmountReached, 0);
    const averagePerformance = challenges.reduce((sum, c) => 
      sum + calculationService.calculatePerformance(c.maxAmountReached, c.initialInvestment), 0
    ) / totalChallenges;

    const completedChallenges = challenges.filter(c => c.finalResult === 'completo').length;
    const failedChallenges = challenges.filter(c => c.finalResult === 'fallido').length;
    const abandonedChallenges = challenges.filter(c => c.finalResult === 'abandonado').length;
    const inProgressChallenges = challenges.filter(c => c.finalResult === 'en curso').length;

    return {
      totalChallenges,
      averageSteps: Math.round(averageSteps * 100) / 100,
      totalInvestment,
      totalMaxGain,
      averagePerformance: Math.round(averagePerformance * 100) / 100,
      completedChallenges,
      failedChallenges,
      abandonedChallenges,
      inProgressChallenges
    };
  },

  // Calculate analytics data
  calculateAnalytics: (challenges: BettingChallenge[]): AnalyticsData => {
    if (challenges.length === 0) {
      return {
        bestPerformingChallenge: null,
        challengesOver5Steps: 0,
        averagePerformance: 0,
        totalNetGain: 0,
        successRate: 0
      };
    }

    // Find best performing challenge
    const bestPerformingChallenge = challenges.reduce((best, current) => {
      const currentPerformance = calculationService.calculatePerformance(current.maxAmountReached, current.initialInvestment);
      const bestPerformance = best ? calculationService.calculatePerformance(best.maxAmountReached, best.initialInvestment) : -Infinity;
      return currentPerformance > bestPerformance ? current : best;
    }, null as BettingChallenge | null);

    // Count challenges over 5 steps
    const challengesOver5Steps = challenges.filter(c => c.totalSteps > 5).length;

    // Calculate average performance
    const averagePerformance = challenges.reduce((sum, c) => 
      sum + calculationService.calculatePerformance(c.maxAmountReached, c.initialInvestment), 0
    ) / challenges.length;

    // Calculate total net gain
    const totalNetGain = challenges.reduce((sum, c) => 
      sum + calculationService.calculateNetGain(c.maxAmountReached, c.initialInvestment), 0
    );

    // Calculate success rate (completed challenges)
    const successRate = (challenges.filter(c => c.finalResult === 'completo').length / challenges.length) * 100;

    return {
      bestPerformingChallenge,
      challengesOver5Steps,
      averagePerformance: Math.round(averagePerformance * 100) / 100,
      totalNetGain: Math.round(totalNetGain * 100) / 100,
      successRate: Math.round(successRate * 100) / 100
    };
  },

  // Filter challenges by date range
  filterByDateRange: (challenges: BettingChallenge[], startDate: string, endDate: string): BettingChallenge[] => {
    return challenges.filter(challenge => {
      const challengeDate = challenge.date;
      return challengeDate >= startDate && challengeDate <= endDate;
    });
  },

  // Filter challenges by result
  filterByResult: (challenges: BettingChallenge[], result: string): BettingChallenge[] => {
    if (!result || result === 'todos') return challenges;
    return challenges.filter(challenge => challenge.finalResult === result);
  }
}; 
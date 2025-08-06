import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Challenge, Step, DailyStats } from '../types';

// Collection names
const CHALLENGES_COLLECTION = 'challenges';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Helper function to convert Date to Firestore timestamp
const convertToTimestamp = (date: Date) => {
  return Timestamp.fromDate(date);
};

// Create a new challenge
export const createChallenge = async (date: string): Promise<string> => {
  try {
    const challengeData = {
      date,
      steps: [],
      totalProfit: 0,
      finalResult: 'in_progress' as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, CHALLENGES_COLLECTION), challengeData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }
};

// Add a step to a challenge
export const addStepToChallenge = async (
  challengeId: string, 
  step: Omit<Step, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    const challengeRef = doc(db, CHALLENGES_COLLECTION, challengeId);
    
    // Calculate profit for the bet
    const profit = step.bet.result === 'win' 
      ? (step.bet.amount * step.bet.odds) - step.bet.amount
      : -step.bet.amount;

    const stepWithId = {
      ...step,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: convertToTimestamp(new Date()),
      bet: {
        ...step.bet,
        id: `${Date.now()}-${Math.random()}`,
        profit,
        timestamp: convertToTimestamp(new Date())
      }
    };

    // Get current challenge
    const challenges = await getDocs(query(
      collection(db, CHALLENGES_COLLECTION),
      where('__name__', '==', challengeId)
    ));

    if (challenges.empty) {
      throw new Error('Challenge not found');
    }

    const challengeDoc = challenges.docs[0];
    const currentChallenge = challengeDoc.data() as Challenge;
    
    // Update steps and calculate new totals
    const updatedSteps = [...currentChallenge.steps, stepWithId];
    const totalProfit = updatedSteps.reduce((sum, s) => sum + s.bet.profit, 0);
    
    // Determine final result
    let finalResult: Challenge['finalResult'] = 'in_progress';
    if (step.bet.result === 'loss') {
      finalResult = 'failed';
    } else if (step.bet.result === 'win' && step.stepNumber >= 3) {
      finalResult = 'completed';
    }

    await updateDoc(challengeRef, {
      steps: updatedSteps,
      totalProfit,
      finalResult,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding step to challenge:', error);
    throw error;
  }
};

// Get challenges by date
export const getChallengesByDate = async (date: string): Promise<Challenge[]> => {
  try {
    const q = query(
      collection(db, CHALLENGES_COLLECTION),
      where('date', '==', date),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const challenges: Challenge[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      challenges.push({
        id: doc.id,
        date: data.date,
        steps: data.steps.map((step: any) => ({
          ...step,
          timestamp: convertTimestamp(step.timestamp),
          bet: {
            ...step.bet,
            timestamp: convertTimestamp(step.bet.timestamp)
          }
        })),
        totalProfit: data.totalProfit,
        finalResult: data.finalResult,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      });
    });
    
    return challenges;
  } catch (error) {
    console.error('Error getting challenges by date:', error);
    throw error;
  }
};

// Get all challenges
export const getAllChallenges = async (): Promise<Challenge[]> => {
  try {
    const q = query(
      collection(db, CHALLENGES_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const challenges: Challenge[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      challenges.push({
        id: doc.id,
        date: data.date,
        steps: data.steps.map((step: any) => ({
          ...step,
          timestamp: convertTimestamp(step.timestamp),
          bet: {
            ...step.bet,
            timestamp: convertTimestamp(step.bet.timestamp)
          }
        })),
        totalProfit: data.totalProfit,
        finalResult: data.finalResult,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt)
      });
    });
    
    return challenges;
  } catch (error) {
    console.error('Error getting all challenges:', error);
    throw error;
  }
};

// Get daily statistics
export const getDailyStats = async (date: string): Promise<DailyStats> => {
  try {
    const challenges = await getChallengesByDate(date);
    
    const totalProfit = challenges.reduce((sum, challenge) => sum + challenge.totalProfit, 0);
    const totalChallenges = challenges.length;
    const successfulChallenges = challenges.filter(c => c.finalResult === 'completed').length;
    
    return {
      date,
      challenges,
      totalProfit,
      totalChallenges,
      successfulChallenges
    };
  } catch (error) {
    console.error('Error getting daily stats:', error);
    throw error;
  }
};

// Calculate bet profit
export const calculateBetProfit = (amount: number, odds: number, result: 'win' | 'loss'): number => {
  if (result === 'win') {
    return (amount * odds) - amount;
  }
  return -amount;
}; 
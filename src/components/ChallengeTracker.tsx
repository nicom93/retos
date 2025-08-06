import React, { useState, useEffect, useCallback } from 'react';
import { createChallenge, addStepToChallenge, getChallengesByDate } from '../services/firebaseService';
import { Challenge, Step } from '../types';

const ChallengeTracker: React.FC = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [betAmount, setBetAmount] = useState<number>(0);
  const [betOdds, setBetOdds] = useState<number>(0);
  const [betResult, setBetResult] = useState<'win' | 'loss' | 'pending'>('pending');
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  const today = new Date().toISOString().split('T')[0];

  const loadTodayChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const todayChallenges = await getChallengesByDate(today);
      setChallenges(todayChallenges);
      
      // Set current challenge to the most recent one that's in progress
      const inProgressChallenge = todayChallenges.find(c => c.finalResult === 'in_progress');
      if (inProgressChallenge) {
        setCurrentChallenge(inProgressChallenge);
        // Calculate current total based on the last step
        if (inProgressChallenge.steps.length > 0) {
          const lastStep = inProgressChallenge.steps[inProgressChallenge.steps.length - 1];
          setCurrentTotal(lastStep.totalAfter);
        } else {
          setCurrentTotal(0);
        }
      }
    } catch (err) {
      setError('Error al cargar los desafíos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadTodayChallenges();
  }, [loadTodayChallenges]);

  const startNewChallenge = async () => {
    try {
      setLoading(true);
      const challengeId = await createChallenge(today);
      const newChallenge: Challenge = {
        id: challengeId,
        date: today,
        steps: [],
        totalProfit: 0,
        finalResult: 'in_progress',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setCurrentChallenge(newChallenge);
      setChallenges([newChallenge, ...challenges]);
      setCurrentTotal(0);
      setBetAmount(0);
      setBetOdds(0);
      setBetResult('pending');
    } catch (err) {
      setError('Error al crear nuevo desafío');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addStep = async () => {
    if (!currentChallenge) {
      setError('No hay un desafío activo');
      return;
    }

    if (betAmount <= 0 || betOdds <= 0) {
      setError('Por favor ingresa un monto y cuota válidos');
      return;
    }

    if (betResult === 'pending') {
      setError('Por favor selecciona el resultado de la apuesta');
      return;
    }

    try {
      setLoading(true);
      
      const stepNumber = currentChallenge.steps.length + 1;
      const totalBefore = currentTotal;
      
      // Calculate profit and new total
      const profit = betResult === 'win' 
        ? (betAmount * betOdds) - betAmount
        : -betAmount;
      
      const totalAfter = totalBefore + profit;

      const newStep: Omit<Step, 'id' | 'timestamp'> = {
        stepNumber,
        bet: {
          id: '',
          amount: betAmount,
          odds: betOdds,
          result: betResult,
          profit,
          timestamp: new Date()
        },
        totalBefore,
        totalAfter
      };

      await addStepToChallenge(currentChallenge.id, newStep);
      
      // Update local state
      const updatedChallenge: Challenge = {
        ...currentChallenge,
        steps: [...currentChallenge.steps, { ...newStep, id: `${Date.now()}`, timestamp: new Date() }],
        totalProfit: currentChallenge.totalProfit + profit,
        finalResult: betResult === 'loss' ? 'failed' : (stepNumber >= 3 ? 'completed' : 'in_progress') as Challenge['finalResult']
      };

      setCurrentChallenge(updatedChallenge);
      setCurrentTotal(totalAfter);
      
      // Reset form
      setBetAmount(0);
      setBetOdds(0);
      setBetResult('pending');
      
      // Reload challenges to get updated data
      await loadTodayChallenges();
      
    } catch (err) {
      setError('Error al agregar el paso');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const calculatePotentialWin = () => {
    if (betAmount > 0 && betOdds > 0) {
      return (betAmount * betOdds) - betAmount;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tracker de Desafíos</h1>
        {!currentChallenge && (
          <button
            onClick={startNewChallenge}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Nuevo Desafío
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Current Challenge Status */}
      {currentChallenge && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Desafío Activo #{currentChallenge.id.slice(-6)}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Actual</p>
              <p className={`text-2xl font-bold ${currentTotal >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(currentTotal)}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Pasos Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentChallenge.steps.length}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Beneficio Total</p>
              <p className={`text-2xl font-bold ${currentChallenge.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(currentChallenge.totalProfit)}
              </p>
            </div>
          </div>

          {/* Steps History */}
          {currentChallenge.steps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Pasos</h3>
              <div className="space-y-3">
                {currentChallenge.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        step.bet.result === 'win' ? 'bg-success-600' : 'bg-danger-600'
                      }`}>
                        {step.stepNumber}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Paso {step.stepNumber} • {formatCurrency(step.bet.amount)} @ {step.bet.odds}
                        </p>
                        <p className="text-sm text-gray-600">
                          {step.bet.result === 'win' ? 'Ganado' : 'Perdido'} • {formatCurrency(step.bet.profit)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total después:</p>
                      <p className={`font-bold ${step.totalAfter >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {formatCurrency(step.totalAfter)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Step Form */}
          {currentChallenge.finalResult === 'in_progress' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Paso</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto a Apostar
                  </label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="300"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuota
                  </label>
                  <input
                    type="number"
                    value={betOdds}
                    onChange={(e) => setBetOdds(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="1.5"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              {betAmount > 0 && betOdds > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Ganancia potencial: <span className="font-bold">{formatCurrency(calculatePotentialWin())}</span>
                  </p>
                  <p className="text-sm text-blue-800">
                    Total después de ganar: <span className="font-bold">{formatCurrency(currentTotal + calculatePotentialWin())}</span>
                  </p>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setBetResult('win')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      betResult === 'win'
                        ? 'bg-success-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-success-100'
                    }`}
                  >
                    Ganado
                  </button>
                  <button
                    onClick={() => setBetResult('loss')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      betResult === 'loss'
                        ? 'bg-danger-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-danger-100'
                    }`}
                  >
                    Perdido
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={addStep}
                  disabled={betAmount <= 0 || betOdds <= 0 || betResult === 'pending'}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Agregar Paso
                </button>
              </div>
            </div>
          )}

          {currentChallenge.finalResult !== 'in_progress' && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-lg font-medium text-gray-900">
                Desafío {currentChallenge.finalResult === 'completed' ? 'Completado' : 'Fallido'}
              </p>
              <button
                onClick={startNewChallenge}
                className="mt-4 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Iniciar Nuevo Desafío
              </button>
            </div>
          )}
        </div>
      )}

      {/* Today's Challenges Summary */}
      {challenges.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Desafíos de Hoy</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Desafío #{challenge.id.slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {challenge.steps.length} pasos • {challenge.finalResult === 'completed' ? 'Completado' : challenge.finalResult === 'failed' ? 'Fallido' : 'En progreso'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${challenge.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {formatCurrency(challenge.totalProfit)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {challenge.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeTracker; 
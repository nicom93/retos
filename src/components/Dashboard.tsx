import React, { useState, useEffect, useCallback } from 'react';
import { createChallenge, addStepToChallenge, getChallengesByDate, getDailyStats, finishChallenge } from '../services/firebaseService';
import { Challenge, Step } from '../types';

const Dashboard: React.FC = () => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [dailyStats, setDailyStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states for current step
  const [betAmount, setBetAmount] = useState<string>('');
  const [betOdds, setBetOdds] = useState<string>('');
  const [betResult, setBetResult] = useState<'win' | 'loss' | 'pending'>('pending');
  const [currentTotal, setCurrentTotal] = useState<number>(0);

  const today = new Date().toISOString().split('T')[0];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [todayChallenges, stats] = await Promise.all([
        getChallengesByDate(today),
        getDailyStats(today)
      ]);
      
      setChallenges(todayChallenges);
      setDailyStats(stats);
      
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
       } else {
         setCurrentChallenge(null);
         setCurrentTotal(0);
       }
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      setBetAmount('');
      setBetOdds('');
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

    const amount = parseFloat(betAmount);
    const odds = parseFloat(betOdds);

         if (isNaN(amount) || amount <= 0 || isNaN(odds) || odds <= 0) {
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
       
       // Validar que no se apueste más del dinero disponible (excepto en el primer paso)
       if (stepNumber > 1 && amount > currentTotal) {
         setError('No puedes apostar más dinero del que tienes disponible');
         return;
       }
      
             // Calculate total before this step
       let totalBefore: number;
       if (stepNumber === 1) {
         // Primer paso: empezamos con 0, pero el monto apostado es la inversión inicial
         totalBefore = 0;
       } else {
         // Pasos siguientes: usamos el total del paso anterior
         const lastStep = currentChallenge.steps[currentChallenge.steps.length - 1];
         totalBefore = lastStep.totalAfter;
       }
       
       // Calculate profit and new total
       let profit: number;
       let totalAfter: number;
       
       if (betResult === 'win') {
         // Si gana: recibe el monto apostado + ganancia neta
         profit = (amount * odds) - amount;
         totalAfter = totalBefore + profit;
       } else {
         // Si pierde: pierde el monto apostado
         profit = -amount;
         totalAfter = totalBefore - amount;
       }

      const newStep: Omit<Step, 'id' | 'timestamp'> = {
        stepNumber,
        bet: {
          id: '',
          amount,
          odds,
          result: betResult,
          profit,
          timestamp: new Date()
        },
        totalBefore,
        totalAfter
      };

      await addStepToChallenge(currentChallenge.id, newStep);
      
             // Determine final result
       let finalResult: Challenge['finalResult'] = 'in_progress';
       
       if (betResult === 'loss' || totalAfter <= 0) {
         // El desafío termina si pierde o se queda sin dinero
         finalResult = 'failed';
       }
      
      // Update local state
      const updatedChallenge: Challenge = {
        ...currentChallenge,
        steps: [...currentChallenge.steps, { ...newStep, id: `${Date.now()}`, timestamp: new Date() }],
        totalProfit: currentChallenge.totalProfit + profit,
        finalResult
      };

      setCurrentChallenge(updatedChallenge);
      setCurrentTotal(totalAfter);
      
      // Reset form
      setBetAmount('');
      setBetOdds('');
      setBetResult('pending');
      
      // Reload data to get updated information
      await loadData();
      
    } catch (err) {
      setError('Error al agregar el paso');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const finishChallengeHandler = async () => {
    if (!currentChallenge) {
      setError('No hay un desafío activo');
      return;
    }

    try {
      setLoading(true);
      
      await finishChallenge(currentChallenge.id);
      
      // Mark challenge as completed locally
      const updatedChallenge: Challenge = {
        ...currentChallenge,
        finalResult: 'completed'
      };

      setCurrentChallenge(updatedChallenge);
      setCurrentTotal(0);
      setBetAmount('');
      setBetOdds('');
      setBetResult('pending');
      
      // Reload data
      await loadData();
      
    } catch (err) {
      setError('Error al finalizar el desafío');
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
    const amount = parseFloat(betAmount);
    const odds = parseFloat(betOdds);
    
    if (!isNaN(amount) && amount > 0 && !isNaN(odds) && odds > 0) {
      return (amount * odds) - amount;
    }
    return 0;
  };

  const getMaxMoneyGenerated = (challenge: Challenge) => {
    if (challenge.steps.length === 0) return 0;
    
    // Encontrar el paso con el total más alto (el récord)
    const maxStep = challenge.steps.reduce((max, step) => 
      step.totalAfter > max.totalAfter ? step : max
    );
    
    return maxStep.totalAfter;
  };

  const getInitialMoney = (challenge: Challenge) => {
    if (challenge.steps.length === 0) return 0;
    // El dinero inicial es el monto del primer paso (la inversión inicial)
    return challenge.steps[0].bet.amount;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Tracker de Desafíos</h1>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

             {/* Daily Stats */}
       {dailyStats && (
         <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
           <div className="bg-white rounded-lg shadow p-6">
             <p className="text-sm text-gray-600">Cantidad de Retos</p>
             <p className="text-2xl font-bold text-gray-900">{dailyStats.totalChallenges}</p>
           </div>
           <div className="bg-white rounded-lg shadow p-6">
             <p className="text-sm text-gray-600">Dinero Invertido</p>
             <p className="text-2xl font-bold text-blue-600">{formatCurrency(dailyStats.totalMoneyInvested)}</p>
           </div>
           <div className="bg-white rounded-lg shadow p-6">
             <p className="text-sm text-gray-600">Máximo Alcanzado</p>
             <p className="text-2xl font-bold text-purple-600">{formatCurrency(dailyStats.maxReached)}</p>
           </div>
           <div className="bg-white rounded-lg shadow p-6">
             <p className="text-sm text-gray-600">Completados</p>
             <p className="text-2xl font-bold text-success-600">{dailyStats.completedChallenges}</p>
           </div>
           <div className="bg-white rounded-lg shadow p-6">
             <p className="text-sm text-gray-600">Fallidos</p>
             <p className="text-2xl font-bold text-danger-600">{dailyStats.failedChallenges}</p>
           </div>
           <div className="bg-white rounded-lg shadow p-6">
             <p className="text-sm text-gray-600">Beneficio Total</p>
             <p className={`text-2xl font-bold ${dailyStats.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
               {formatCurrency(dailyStats.totalProfit)}
             </p>
           </div>
         </div>
       )}

      {/* Current Challenge Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentChallenge ? `Desafío Activo #${currentChallenge.id.slice(-6)}` : 'Nuevo Desafío'}
            </h2>
            {!currentChallenge && (
              <button
                onClick={startNewChallenge}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Iniciar Desafío
              </button>
            )}
          </div>
        </div>

        {currentChallenge && (
          <div className="p-6">
            {/* Current Challenge Status */}
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
                  {currentChallenge.steps.map((step) => (
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
                           <p className="text-xs text-gray-500">
                             Total antes: {formatCurrency(step.totalBefore)}
                           </p>
                         </div>
                      </div>
                                             <div className="text-right">
                         <p className="text-sm text-gray-600">Total después:</p>
                         <p className={`font-bold ${step.totalAfter >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                           {formatCurrency(step.totalAfter)}
                         </p>
                         {step.totalAfter < 0 && (
                           <p className="text-xs text-red-600">Sin dinero</p>
                         )}
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
                       onChange={(e) => setBetAmount(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                       placeholder="300"
                       min="0"
                       max={currentTotal > 0 ? currentTotal : undefined}
                       step="0.01"
                     />
                     {currentTotal > 0 && (
                       <p className="text-sm text-gray-600 mt-1">
                         Disponible: {formatCurrency(currentTotal)}
                       </p>
                     )}
                   </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuota
                    </label>
                    <input
                      type="number"
                      value={betOdds}
                      onChange={(e) => setBetOdds(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="1.5"
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>

                                 {betAmount && betOdds && parseFloat(betAmount) > 0 && parseFloat(betOdds) > 0 && (
                   <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                     <p className="text-sm text-blue-800">
                       Ganancia potencial: <span className="font-bold">{formatCurrency(calculatePotentialWin())}</span>
                     </p>
                     <p className="text-sm text-blue-800">
                       Total después de ganar: <span className="font-bold">{formatCurrency(currentTotal + calculatePotentialWin())}</span>
                     </p>
                     <p className="text-sm text-blue-800">
                       Total después de perder: <span className="font-bold">{formatCurrency(currentTotal - parseFloat(betAmount))}</span>
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

                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={addStep}
                    disabled={!betAmount || !betOdds || parseFloat(betAmount) <= 0 || parseFloat(betOdds) <= 0 || betResult === 'pending'}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Agregar Paso
                  </button>
                                     <button
                     onClick={finishChallengeHandler}
                     className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                   >
                     Finalizar Reto
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
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Desafíos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pasos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dinero Inicial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Máximo Generado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(challenge.date).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {challenge.steps.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(getInitialMoney(challenge))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(getMaxMoneyGenerated(challenge))}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${challenge.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {formatCurrency(challenge.totalProfit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      challenge.finalResult === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : challenge.finalResult === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {challenge.finalResult === 'completed' ? 'Completado' : 
                       challenge.finalResult === 'failed' ? 'Fallido' : 'En progreso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
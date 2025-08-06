import React, { useState, useEffect } from 'react';
import { Challenge, Step, Bet, BetFormData } from '../types';
import { addDoc, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Dashboard: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [betForm, setBetForm] = useState<BetFormData>({ amount: 0, odds: 0 });
  const [initialMoney, setInitialMoney] = useState<number>(0);
  const [currentMoney, setCurrentMoney] = useState<number>(0);

  useEffect(() => {
    loadChallenges();
  }, []);

  useEffect(() => {
    // Buscar si hay un reto en progreso
    const inProgressChallenge = challenges.find(c => c.status === 'in_progress');
    if (inProgressChallenge) {
      setCurrentChallenge(inProgressChallenge);
      setCurrentMoney(inProgressChallenge.finalMoney);
    }
  }, [challenges]);

  const loadChallenges = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'challenges'));
      const loadedChallenges: Challenge[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedChallenges.push({
          id: doc.id,
          startDate: data.startDate.toDate(),
          initialMoney: data.initialMoney,
          maxMoneyReached: data.maxMoneyReached,
          steps: data.steps.map((step: any) => ({
            ...step,
            timestamp: step.timestamp.toDate(),
            bet: {
              ...step.bet,
              timestamp: step.bet.timestamp.toDate()
            }
          })),
          finalMoney: data.finalMoney,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        });
      });
      setChallenges(loadedChallenges.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()));
    } catch (error) {
      console.error('Error loading challenges:', error);
    }
  };

  const startNewChallenge = () => {
    if (initialMoney <= 0) return;
    
    const newChallenge: Challenge = {
      id: '',
      startDate: new Date(),
      initialMoney,
      maxMoneyReached: initialMoney,
      steps: [],
      finalMoney: initialMoney,
      status: 'in_progress',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setCurrentChallenge(newChallenge);
    setCurrentMoney(initialMoney);
  };

  const addBet = async () => {
    if (!currentChallenge || betForm.amount <= 0 || betForm.odds <= 0 || betForm.amount > currentMoney) {
      return;
    }

    const bet: Bet = {
      id: Date.now().toString(),
      amount: betForm.amount,
      odds: betForm.odds,
      result: 'pending',
      profit: 0,
      timestamp: new Date()
    };

    const step: Step = {
      id: Date.now().toString(),
      stepNumber: currentChallenge.steps.length + 1,
      bet,
      moneyBefore: currentMoney,
      moneyAfter: currentMoney,
      timestamp: new Date()
    };

    // Simular resultado (ganar o perder)
    const isWin = Math.random() > 0.5;
    
    if (isWin) {
      bet.result = 'win';
      bet.profit = betForm.amount * (betForm.odds - 1);
      step.moneyAfter = currentMoney + bet.profit;
    } else {
      bet.result = 'loss';
      bet.profit = -betForm.amount;
      step.moneyAfter = currentMoney - betForm.amount;
    }

    const updatedChallenge = {
      ...currentChallenge,
      steps: [...currentChallenge.steps, step],
      maxMoneyReached: Math.max(currentChallenge.maxMoneyReached, step.moneyAfter),
      finalMoney: step.moneyAfter,
      updatedAt: new Date()
    };

    setCurrentChallenge(updatedChallenge);
    setCurrentMoney(step.moneyAfter);
    setBetForm({ amount: 0, odds: 0 });

    // Guardar el reto actualizado en Firebase
    try {
      if (currentChallenge.id) {
        await updateDoc(doc(db, 'challenges', currentChallenge.id), updatedChallenge);
      } else {
        const docRef = await addDoc(collection(db, 'challenges'), updatedChallenge);
        updatedChallenge.id = docRef.id;
      }
    } catch (error) {
      console.error('Error saving challenge:', error);
    }

    // Si se quedó sin dinero, finalizar el reto
    if (step.moneyAfter <= 0) {
      await finalizeChallenge(updatedChallenge, 'failed');
    }
  };

  const finalizeChallenge = async (challenge: Challenge, status: 'completed' | 'failed') => {
    try {
      const finalChallenge = {
        ...challenge,
        status,
        updatedAt: new Date()
      };

      if (challenge.id) {
        // Actualizar reto existente
        await updateDoc(doc(db, 'challenges', challenge.id), finalChallenge);
      } else {
        // Crear nuevo reto
        const docRef = await addDoc(collection(db, 'challenges'), finalChallenge);
        finalChallenge.id = docRef.id;
      }

      // Actualizar el estado local
      setChallenges(prev => {
        const filtered = prev.filter(c => c.id !== challenge.id);
        return [finalChallenge, ...filtered];
      });
      setCurrentChallenge(null);
      setCurrentMoney(0);
      setInitialMoney(0);
    } catch (error) {
      console.error('Error finalizing challenge:', error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Seguimiento de Apuestas</h1>
      
      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">Total de Retos</h3>
          <p className="text-3xl font-bold text-blue-600">{challenges.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">Retos Completados</h3>
          <p className="text-3xl font-bold text-green-600">
            {challenges.filter(c => c.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">Retos Fallidos</h3>
          <p className="text-3xl font-bold text-red-600">
            {challenges.filter(c => c.status === 'failed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900">En Progreso</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {challenges.filter(c => c.status === 'in_progress').length}
          </p>
        </div>
      </div>
      
      {/* Sección de Nuevo Reto */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Nuevo Reto</h2>
        
        {!currentChallenge ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dinero Inicial (€)
              </label>
              <input
                type="number"
                value={initialMoney}
                onChange={(e) => setInitialMoney(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 300"
              />
            </div>
            <button
              onClick={startNewChallenge}
              disabled={initialMoney <= 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              Iniciar Reto
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Dinero disponible:</strong> {formatMoney(currentMoney)}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Máximo alcanzado:</strong> {formatMoney(currentChallenge.maxMoneyReached)}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad a apostar (€)
                </label>
                <input
                  type="number"
                  value={betForm.amount}
                  onChange={(e) => setBetForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 100"
                  max={currentMoney}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuota
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={betForm.odds}
                  onChange={(e) => setBetForm(prev => ({ ...prev, odds: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1.5"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addBet}
                  disabled={betForm.amount <= 0 || betForm.odds <= 0 || betForm.amount > currentMoney}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  Hacer Apuesta
                </button>
              </div>
            </div>
            
                         <div className="flex gap-2">
               <button
                 onClick={() => finalizeChallenge(currentChallenge, 'completed')}
                 className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
               >
                 Finalizar Reto
               </button>
             </div>
             
             {/* Pasos del Reto Actual */}
             {currentChallenge.steps.length > 0 && (
               <div className="mt-6">
                 <h3 className="text-lg font-semibold mb-3">Pasos del Reto Actual</h3>
                 <div className="space-y-2 max-h-60 overflow-y-auto">
                   {currentChallenge.steps.map((step, index) => (
                     <div key={step.id} className="bg-gray-50 p-3 rounded-md">
                       <div className="flex justify-between items-center">
                         <div>
                           <span className="font-medium">Paso {step.stepNumber}:</span>
                           <span className="ml-2">
                             {step.bet.amount}€ @ {step.bet.odds}
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                           <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                             step.bet.result === 'win' 
                               ? 'bg-green-100 text-green-800'
                               : 'bg-red-100 text-red-800'
                           }`}>
                             {step.bet.result === 'win' ? 'GANÓ' : 'PERDIÓ'}
                           </span>
                           <span className={`font-medium ${
                             step.bet.profit >= 0 ? 'text-green-600' : 'text-red-600'
                           }`}>
                             {step.bet.profit >= 0 ? '+' : ''}{formatMoney(step.bet.profit)}
                           </span>
                         </div>
                       </div>
                       <div className="text-sm text-gray-600 mt-1">
                         Dinero: {formatMoney(step.moneyBefore)} → {formatMoney(step.moneyAfter)}
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
         )}
       </div>

      {/* Historial de Retos */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Retos</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pasos Alcanzados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dinero Inicial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Máximo Alcanzado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dinero Final
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
                    {formatDate(challenge.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {challenge.steps.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMoney(challenge.initialMoney)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMoney(challenge.maxMoneyReached)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatMoney(challenge.finalMoney)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      challenge.status === 'completed' 
                        ? 'bg-green-100 text-green-800'
                        : challenge.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {challenge.status === 'completed' ? 'Completado' :
                       challenge.status === 'failed' ? 'Fallido' : 'En Progreso'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {challenges.length === 0 && (
          <p className="text-center text-gray-500 py-8">No hay retos registrados</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
import { getAllChallenges } from '../services/firebaseService';
import { Challenge } from '../types';

const History: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    loadAllChallenges();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const filtered = challenges.filter(challenge => challenge.date === selectedDate);
      setFilteredChallenges(filtered);
    } else {
      setFilteredChallenges(challenges);
    }
  }, [selectedDate, challenges]);

  const loadAllChallenges = async () => {
    try {
      setLoading(true);
      const allChallenges = await getAllChallenges();
      setChallenges(allChallenges);
      setFilteredChallenges(allChallenges);
    } catch (err) {
      setError('Error al cargar el historial');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: Challenge['finalResult']) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'failed':
        return 'bg-danger-100 text-danger-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Challenge['finalResult']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'failed':
        return 'Fallido';
      case 'in_progress':
        return 'En progreso';
      default:
        return 'Desconocido';
    }
  };

  // Calculate overall statistics
  const totalChallenges = challenges.length;
  const completedChallenges = challenges.filter(c => c.finalResult === 'completed').length;
  const failedChallenges = challenges.filter(c => c.finalResult === 'failed').length;
  const totalProfit = challenges.reduce((sum, c) => sum + c.totalProfit, 0);

  // Get unique dates for filter
  const uniqueDates = Array.from(new Set(challenges.map(c => c.date))).sort().reverse();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Historial</h1>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Desafíos</p>
              <p className="text-2xl font-bold text-gray-900">{totalChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Exitosos</p>
              <p className="text-2xl font-bold text-gray-900">{completedChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-danger-100 rounded-lg">
              <svg className="w-6 h-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Fallidos</p>
              <p className="text-2xl font-bold text-gray-900">{failedChallenges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-success-100' : 'bg-danger-100'}`}>
              <svg className={`w-6 h-6 ${totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Beneficio Total</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(totalProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Date */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por fecha:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas las fechas</option>
            {uniqueDates.map(date => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">
            {filteredChallenges.length} desafíos encontrados
          </span>
        </div>
      </div>

      {/* Challenges List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Desafíos</h3>
        </div>
        <div className="p-6">
          {filteredChallenges.length > 0 ? (
            <div className="space-y-4">
              {filteredChallenges.map((challenge) => (
                <div key={challenge.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        Desafío #{challenge.id.slice(-6)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {formatDate(challenge.date)} • {challenge.createdAt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(challenge.finalResult)}`}>
                        {getStatusText(challenge.finalResult)}
                      </span>
                      <p className={`mt-1 text-lg font-bold ${challenge.totalProfit >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {formatCurrency(challenge.totalProfit)}
                      </p>
                    </div>
                  </div>

                  {/* Steps Summary */}
                  {challenge.steps.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">Pasos:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {challenge.steps.map((step) => (
                          <div key={step.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              step.bet.result === 'win' ? 'bg-success-600' : 'bg-danger-600'
                            }`}>
                              {step.stepNumber}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(step.bet.amount)} @ {step.bet.odds}
                              </p>
                              <p className="text-xs text-gray-600">
                                {step.bet.result === 'win' ? 'Ganado' : 'Perdido'} • {formatCurrency(step.bet.profit)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pasos completados:</span>
                      <span className="font-medium">{challenge.steps.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tasa de éxito:</span>
                      <span className="font-medium">
                        {challenge.steps.length > 0 
                          ? `${((challenge.steps.filter(s => s.bet.result === 'win').length / challenge.steps.length) * 100).toFixed(1)}%`
                          : '0%'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-gray-600">
                {selectedDate ? 'No hay desafíos para la fecha seleccionada' : 'No hay desafíos registrados'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History; 
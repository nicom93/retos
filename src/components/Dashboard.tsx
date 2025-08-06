import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDailyStats } from '../services/firebaseService';
import { DailyStats } from '../types';

const Dashboard: React.FC = () => {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const stats = await getDailyStats(today);
        setTodayStats(stats);
      } catch (err) {
        setError('Error al cargar las estadísticas del día');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/tracker"
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Nuevo Desafío
        </Link>
      </div>

      {/* Today's Date */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Desafíos Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {todayStats?.totalChallenges || 0}
              </p>
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
              <p className="text-2xl font-bold text-gray-900">
                {todayStats?.successfulChallenges || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${(todayStats?.totalProfit || 0) >= 0 ? 'bg-success-100' : 'bg-danger-100'}`}>
              <svg className={`w-6 h-6 ${(todayStats?.totalProfit || 0) >= 0 ? 'text-success-600' : 'text-danger-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Beneficio Total</p>
              <p className={`text-2xl font-bold ${(todayStats?.totalProfit || 0) >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatCurrency(todayStats?.totalProfit || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Challenges */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Desafíos Recientes</h3>
        </div>
        <div className="p-6">
          {todayStats?.challenges && todayStats.challenges.length > 0 ? (
            <div className="space-y-4">
              {todayStats.challenges.slice(0, 5).map((challenge) => (
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
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mt-2 text-gray-600">No hay desafíos registrados hoy</p>
              <Link
                to="/tracker"
                className="mt-4 inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Crear primer desafío
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
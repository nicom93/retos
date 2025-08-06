import React, { useState, useEffect } from 'react';
import { BettingChallenge, ChallengeStats, AnalyticsData } from '../types';
import { storageService } from '../services/storageService';
import { calculationService } from '../services/calculationService';

const Dashboard: React.FC = () => {
  const [challenges, setChallenges] = useState<BettingChallenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<BettingChallenge[]>([]);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('');
  const [resultFilter, setResultFilter] = useState('todos');
  
  // New challenge form
  const [newChallenge, setNewChallenge] = useState({
    date: '',
    initialInvestment: '',
    totalSteps: '',
    maxAmountReached: '',
    finalResult: 'en curso' as const,
    observations: ''
  });

  // Load data on component mount
  useEffect(() => {
    loadChallenges();
  }, []);

  // Update filtered challenges and stats when challenges change
  useEffect(() => {
    applyFilters();
  }, [challenges, dateFilter, resultFilter]);

  const loadChallenges = () => {
    const loadedChallenges = storageService.getAllChallenges();
    setChallenges(loadedChallenges);
  };

  const applyFilters = () => {
    let filtered = [...challenges];

    // Apply date filter
    if (dateFilter) {
      filtered = calculationService.filterByDateRange(filtered, dateFilter, dateFilter);
    }

    // Apply result filter
    if (resultFilter !== 'todos') {
      filtered = calculationService.filterByResult(filtered, resultFilter);
    }

    setFilteredChallenges(filtered);
    
    // Calculate stats and analytics
    const calculatedStats = calculationService.calculateStats(filtered);
    const calculatedAnalytics = calculationService.calculateAnalytics(filtered);
    
    setStats(calculatedStats);
    setAnalytics(calculatedAnalytics);
  };

  const handleAddChallenge = () => {
    if (!newChallenge.date || !newChallenge.initialInvestment || !newChallenge.totalSteps || !newChallenge.maxAmountReached) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const challenge = storageService.addChallenge({
      date: newChallenge.date,
      initialInvestment: parseFloat(newChallenge.initialInvestment),
      totalSteps: parseInt(newChallenge.totalSteps),
      maxAmountReached: parseFloat(newChallenge.maxAmountReached),
      finalResult: newChallenge.finalResult,
      observations: newChallenge.observations || undefined
    });

    setChallenges(prev => [...prev, challenge]);
    setShowAddForm(false);
    resetNewChallengeForm();
  };

  const handleUpdateChallenge = (id: string, updates: Partial<BettingChallenge>) => {
    const updated = storageService.updateChallenge(id, updates);
    if (updated) {
      setChallenges(prev => prev.map(c => c.id === id ? updated : c));
      setEditingId(null);
    }
  };

  const handleDeleteChallenge = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este reto?')) {
      const success = storageService.deleteChallenge(id);
      if (success) {
        setChallenges(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const resetNewChallengeForm = () => {
    setNewChallenge({
      date: '',
      initialInvestment: '',
      totalSteps: '',
      maxAmountReached: '',
      finalResult: 'en curso',
      observations: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'completo': return 'text-success-600 bg-success-100';
      case 'fallido': return 'text-danger-600 bg-danger-100';
      case 'abandonado': return 'text-yellow-600 bg-yellow-100';
      case 'en curso': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tracker de Retos de Apuestas</h1>
          <p className="text-gray-600">Sistema de seguimiento y análisis de retos deportivos</p>
        </div>

        {/* Stats Panel */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Total Retos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalChallenges}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Promedio Pasos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.averageSteps}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Inversión Total</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalInvestment)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Ganancia Máxima</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalMaxGain)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600">Rendimiento Promedio</p>
              <p className={`text-2xl font-bold ${stats.averagePerformance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {formatPercentage(stats.averagePerformance)}
              </p>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por fecha</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por resultado</label>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="todos">Todos</option>
                <option value="completo">Completo</option>
                <option value="fallido">Fallido</option>
                <option value="abandonado">Abandonado</option>
                <option value="en curso">En Curso</option>
              </select>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Agregar Reto
              </button>
            </div>
          </div>
        </div>

        {/* Add Challenge Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Nuevo Reto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={newChallenge.date}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inversión Inicial *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newChallenge.initialInvestment}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, initialInvestment: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Pasos *</label>
                <input
                  type="number"
                  value={newChallenge.totalSteps}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, totalSteps: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Máximo Alcanzado *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newChallenge.maxAmountReached}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, maxAmountReached: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="2500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resultado Final</label>
                <select
                  value={newChallenge.finalResult}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, finalResult: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="en curso">En Curso</option>
                  <option value="completo">Completo</option>
                  <option value="fallido">Fallido</option>
                  <option value="abandonado">Abandonado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <input
                  type="text"
                  value={newChallenge.observations}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, observations: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Detalles adicionales..."
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddChallenge}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Guardar Reto
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetNewChallengeForm();
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Challenges Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Retos Registrados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inversión</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pasos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Máximo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendimiento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia Neta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observaciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChallenges.map((challenge) => (
                  <tr key={challenge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(challenge.date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(challenge.initialInvestment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {challenge.totalSteps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(challenge.maxAmountReached)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${calculationService.calculatePerformance(challenge.maxAmountReached, challenge.initialInvestment) >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {formatPercentage(calculationService.calculatePerformance(challenge.maxAmountReached, challenge.initialInvestment))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${calculationService.calculateNetGain(challenge.maxAmountReached, challenge.initialInvestment) >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {formatCurrency(calculationService.calculateNetGain(challenge.maxAmountReached, challenge.initialInvestment))}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(challenge.finalResult)}`}>
                        {challenge.finalResult}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {challenge.observations || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setEditingId(editingId === challenge.id ? null : challenge.id)}
                        className="text-primary-600 hover:text-primary-900 mr-2"
                      >
                        {editingId === challenge.id ? 'Cancelar' : 'Editar'}
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(challenge.id)}
                        className="text-danger-600 hover:text-danger-900"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Analytics Section */}
        {analytics && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Análisis y Preguntas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">¿Cuál fue el reto con mayor ganancia máxima?</h3>
                  <p className="text-blue-800">
                    {analytics.bestPerformingChallenge ? (
                      <>
                        Fecha: {new Date(analytics.bestPerformingChallenge.date).toLocaleDateString('es-ES')} - 
                        Rendimiento: {formatPercentage(calculationService.calculatePerformance(analytics.bestPerformingChallenge.maxAmountReached, analytics.bestPerformingChallenge.initialInvestment))}
                      </>
                    ) : 'No hay datos disponibles'}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">¿Qué porcentaje de retos superó los 5 pasos?</h3>
                  <p className="text-green-800">
                    {filteredChallenges.length > 0 ? `${((analytics.challengesOver5Steps / filteredChallenges.length) * 100).toFixed(1)}%` : '0%'} 
                    ({analytics.challengesOver5Steps} de {filteredChallenges.length})
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">¿Cuál es el rendimiento promedio de todos los retos?</h3>
                  <p className="text-purple-800">
                    {formatPercentage(analytics.averagePerformance)}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-900 mb-2">¿Cuál fue la ganancia total neta?</h3>
                  <p className={`text-orange-800 font-medium ${analytics.totalNetGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(analytics.totalNetGain)}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <h3 className="font-medium text-indigo-900 mb-2">¿Cuál es la tasa de éxito?</h3>
                  <p className="text-indigo-800">
                    {analytics.successRate.toFixed(1)}% de retos completados exitosamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 
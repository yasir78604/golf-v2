import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';
import {
  Gift,
  TrendingUp,
  Calendar,
  Play,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DrawManagement = () => {
  const { user } = useAuth();
  const [draws, setDraws] = useState([]);
  const [currentDraw, setCurrentDraw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  const [manualDrawId, setManualDrawId] = useState(''); // ✅ For manual force winners
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    logic: 'random',
  });

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      setLoading(true);
      const [allRes, currentRes] = await Promise.all([
        api.get('/admin/draws/all'),
        api.get('/draws/current'),
      ]);
      setDraws(allRes.data.data || []);
      setCurrentDraw(currentRes.data.data);
    } catch (error) {
      console.error('Failed to fetch draws:', error);
      toast.error('Failed to load draws');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setSimulationResult(null);
    try {
      const response = await api.post('/admin/draw/simulate', formData);
      setSimulationResult(response.data);
      toast.success('Draw simulated successfully!');
      fetchDraws();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Simulation failed');
    } finally {
      setSimulating(false);
    }
  };

  const handlePublish = async (drawId) => {
    if (!window.confirm('Publish this draw? Winners will be notified.')) return;
    try {
      await api.put(`/admin/draw/${drawId}/publish`);
      toast.success('Draw published!');
      fetchDraws();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to publish');
    }
  };

  const handleForceWinners = async (drawId) => {
    if (!drawId) {
      toast.error('Please enter a valid Draw ID');
      return;
    }
    if (!window.confirm('Manually match winners for this draw?')) return;
    try {
      await api.post(`/admin/draws/${drawId}/force-winners`);
      toast.success('Winners forced successfully!');
      setManualDrawId('');
      fetchDraws();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to force winners');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      simulated: { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Simulated' },
      published: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Published' },
      completed: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-impact', bg: 'bg-impact/10', label: 'Completed' },
    };
    return configs[status] || configs.simulated;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-impact"></div>
      </div>
    );
  }

  return (
    <div className="flex gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminSidebar />

      <div className="flex-1 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Draw</span> Management
          </h1>
          <p className="text-gray-400 mt-1">Simulate, preview, and publish monthly draws.</p>
        </motion.div>

        {/* Current Draw Status */}
        {currentDraw && (
          <Card className="border-impact/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-400">Current Month Draw</h3>
                <p className="text-2xl font-bold text-white">{currentDraw.month}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(currentDraw.status).bg} ${getStatusBadge(currentDraw.status).color}`}>
                    {getStatusBadge(currentDraw.status).icon}
                    {getStatusBadge(currentDraw.status).label}
                  </span>
                  {currentDraw.status === 'published' && (
                    <span className="text-xs text-gray-500">
                      Numbers: {currentDraw.numbers?.join(' - ')}
                    </span>
                  )}
                </div>
              </div>
              {currentDraw.status === 'simulated' && (
                <Button variant="primary" onClick={() => handlePublish(currentDraw.id)}>
                  <CheckCircle className="w-4 h-4" />
                  Publish Draw
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Simulation Form */}
        <Card>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-impact" />
            Run Simulation
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Month</label>
              <input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                className="w-full bg-dark text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Draw Logic</label>
              <select
                value={formData.logic}
                onChange={(e) => setFormData({ ...formData, logic: e.target.value })}
                className="w-full bg-dark text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none"
              >
                <option value="random">Pure Random</option>
                <option value="weighted_popular">Weighted: Popular Scores</option>
                <option value="weighted_underdog">Weighted: Underdog Scores</option>
              </select>
            </div>
          </div>
          <Button
            variant="primary"
            className="mt-4"
            onClick={handleSimulate}
            loading={simulating}
            disabled={simulating}
          >
            <Play className="w-4 h-4" />
            Simulate Draw
          </Button>
        </Card>

        {/* Simulation Results */}
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 border border-gold/20"
          >
            <h4 className="text-lg font-semibold text-gold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Simulation Results
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400">Winning Numbers</p>
                <div className="flex gap-2 mt-2">
                  {simulationResult.draw?.numbers?.map((num, i) => (
                    <span key={i} className="w-10 h-10 bg-gold/20 text-gold rounded-xl flex items-center justify-center font-bold text-lg">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Prize Pools</p>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">5-Match (Jackpot):</span>
                    <span className="text-gold font-semibold">
                      ${simulationResult.prizePools?.tier5?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">4-Match:</span>
                    <span className="text-gold font-semibold">
                      ${simulationResult.prizePools?.tier4?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">3-Match:</span>
                    <span className="text-gold font-semibold">
                      ${simulationResult.prizePools?.tier3?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <p className="text-2xl font-bold text-gold">{simulationResult.winners?.[5]?.length || 0}</p>
                <p className="text-xs text-gray-400">5-Match Winners</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-impact">{simulationResult.winners?.[4]?.length || 0}</p>
                <p className="text-xs text-gray-400">4-Match Winners</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{simulationResult.winners?.[3]?.length || 0}</p>
                <p className="text-xs text-gray-400">3-Match Winners</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Past Draws */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-impact" />
              Past Draws (Last 5)
            </h3>
            <Button variant="ghost" size="sm" onClick={fetchDraws}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {draws.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No draws yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-3">Month</th>
                    <th className="pb-3">Numbers</th>
                    <th className="pb-3">Logic</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draws.map((draw) => {
                    const status = getStatusBadge(draw.status);
                    return (
                      <tr key={draw.id} className="border-b border-gray-700/50 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-3 text-white font-medium">{draw.month}</td>
                        <td className="py-3 text-gold">{draw.numbers?.join(' - ')}</td>
                        <td className="py-3 text-gray-400 text-sm">{draw.logic?.replace('_', ' ')}</td>
                        <td className="py-3">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3 flex gap-2">
                          {draw.status === 'simulated' && (
                            <button
                              onClick={() => handlePublish(draw.id)}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                            >
                              Publish
                            </button>
                          )}
                          {draw.status === 'published' && (
                            <button
                              onClick={() => handleForceWinners(draw.id)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                            >
                              Force Winners
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* ✅ Manual Force Winners Section */}
        <Card className="border border-red-500/20">
          <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <span className="text-red-400 text-lg">⚠️</span>
            Manual Force Winners (Fallback)
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Paste Draw ID here"
              value={manualDrawId}
              onChange={(e) => setManualDrawId(e.target.value)}
              className="flex-1 bg-dark text-white px-4 py-2 rounded-xl border border-gray-700 focus:border-impact focus:outline-none text-sm"
            />
            <Button
              variant="danger"
              onClick={() => handleForceWinners(manualDrawId)}
              disabled={!manualDrawId}
            >
              Force Winners
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use this if the draw is not showing in the list, or if you need to re-run winner matching manually.
          </p>
        </Card>

      </div>
    </div>
  );
};

export default DrawManagement;
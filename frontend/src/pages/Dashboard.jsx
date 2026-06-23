import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import api from '../services/api';
import {
  Plus,
  Calendar,
  Award,
  Heart,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();

  // ALL HOOKS AT THE TOP
  const [scores, setScores] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [newScore, setNewScore] = useState({ date: '', points: '' });
  const [editingScore, setEditingScore] = useState(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [scoresRes, winningsRes] = await Promise.all([
        api.get('/scores'),
        api.get('/winners/my-winnings'),
      ]);
      setScores(scoresRes.data.data || []);
      setWinnings(winningsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Real-time subscription for profile updates (activation)
  useEffect(() => {
    if (!user) return;

    const profileSub = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          refreshUser();
          toast.success('Your subscription has been updated!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileSub);
    };
  }, [user, refreshUser]);

  // 🔥 Real-time subscription for new winners
  useEffect(() => {
    if (!user) return;

    const winnerSub = supabase
      .channel(`winners-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'winners',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newWin = payload.new;
          toast.success(`🎉 You won $${newWin.prize_amount.toFixed(2)}!`);
          fetchData(); // refresh winnings
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(winnerSub);
    };
  }, [user]);

  // Score CRUD
  const handleAddScore = async (e) => {
    e.preventDefault();
    try {
      await api.post('/scores', newScore);
      toast.success('Score added successfully!');
      setShowScoreModal(false);
      setNewScore({ date: '', points: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add score');
    }
  };

  const handleDeleteScore = async (id) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete score');
    }
  };

  // Conditional rendering
  if (user?.subscription_status === 'pending' && user?.payment_status === 'received') {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="glass rounded-3xl p-12 border border-yellow-400/20">
          <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">⏳ Awaiting Activation</h2>
          <p className="text-gray-400">
            Your payment has been received! The admin will activate your subscription shortly.
            <br />
            You'll get access to all features once activated.
          </p>
          <Link to="/profile" className="text-impact hover:underline mt-4 inline-block">
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  if (user?.subscription_status !== 'active' && user?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="glass rounded-3xl p-12 border border-gray-700">
          <Lock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">🔒 Subscription Required</h2>
          <p className="text-gray-400 mb-6">
            You need an active subscription to access the dashboard.
          </p>
          <Link to="/pricing">
            <button className="bg-impact hover:bg-impact-light text-dark font-semibold px-8 py-3 rounded-xl transition-colors">
              View Plans
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-impact"></div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const configs = {
      pending: { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
      approved: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-400/10' },
      rejected: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-400/10' },
      paid: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-impact', bg: 'bg-impact/10' },
    };
    return configs[status] || configs.pending;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome back, <span className="gradient-text">{user?.full_name || 'Golfer'}</span>
        </h1>
        <p className="text-gray-400 mt-1">
          Track your scores, support your charity, and win monthly prizes.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Subscription</p>
              <p className="text-xl font-semibold text-white mt-1">
                {user?.subscription_status === 'active' ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${user?.subscription_status === 'active' ? 'bg-green-400/10' : 'bg-yellow-400/10'}`}>
              {user?.subscription_status === 'active' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Scores Logged</p>
              <p className="text-xl font-semibold text-white mt-1">{scores.length}/5</p>
            </div>
            <div className="p-3 rounded-xl bg-impact/10">
              <Target className="w-6 h-6 text-impact" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Winnings</p>
              <p className="text-xl font-semibold text-gold mt-1">
                ${winnings.reduce((sum, w) => sum + (w.prize_amount || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gold/10">
              <Award className="w-6 h-6 text-gold" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Charity</p>
              <p className="text-xl font-semibold text-white mt-1 truncate max-w-[140px]">
                {user?.charity?.name || 'Not selected'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-heart/10">
              <Heart className="w-6 h-6 text-impact" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scores & Winnings Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Scores */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Scores</h2>
            <button
              onClick={() => setShowScoreModal(true)}
              className="bg-impact hover:bg-impact-light text-dark font-medium px-4 py-2 rounded-xl flex items-center gap-2 transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Score
            </button>
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No scores logged yet</p>
              <p className="text-gray-500 text-sm">Add your first round to start tracking</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {scores.map((score, index) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      index === 0 ? 'border-gold/30 bg-gold/5' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-bold ${index === 0 ? 'text-gold' : 'text-white'}`}>
                        {score.points}
                      </span>
                      <div>
                        <p className="text-sm text-gray-400">
                          {new Date(score.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        {index === 0 && (
                          <span className="text-xs text-gold font-medium">Latest</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingScore(score);
                          setNewScore({ date: score.date, points: score.points });
                          setShowScoreModal(true);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScore(score.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* Winnings */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-gold" />
            My Winnings
            <span className="text-xs text-green-400 ml-2 animate-pulse">🔴 Live</span>
          </h2>

          {winnings.length === 0 ? (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No winnings yet</p>
              <p className="text-gray-500 text-sm">Keep playing to win monthly prizes!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {winnings.map((win) => {
                const statusConfig = getStatusBadge(win.verification_status);
                return (
                  <div key={win.id} className="bg-dark/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gold">
                          ${win.prize_amount?.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">
                          {win.tier} Number Match · {win.draw?.month}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {win.verification_status.charAt(0).toUpperCase() + win.verification_status.slice(1)}
                      </span>
                    </div>
                    {win.proof_image_url && (
                      <div className="mt-3">
                        <a
                          href={win.proof_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-impact hover:text-impact-light text-sm flex items-center gap-1"
                        >
                          View Proof
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Score Modal */}
      <AnimatePresence>
        {showScoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowScoreModal(false);
              setEditingScore(null);
              setNewScore({ date: '', points: '' });
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate rounded-2xl p-8 max-w-md w-full border border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-white mb-6">
                {editingScore ? 'Edit Score' : 'Log New Score'}
              </h3>
              <form onSubmit={handleAddScore}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newScore.date}
                      onChange={(e) => setNewScore({ ...newScore, date: e.target.value })}
                      className="w-full bg-dark text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Stableford Points (1-45)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      value={newScore.points}
                      onChange={(e) => setNewScore({ ...newScore, points: parseInt(e.target.value) || '' })}
                      className="w-full bg-dark text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none transition-colors"
                      placeholder="Enter points (1-45)"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScoreModal(false);
                      setEditingScore(null);
                      setNewScore({ date: '', points: '' });
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl bg-impact hover:bg-impact-light text-dark font-semibold transition-colors"
                  >
                    {editingScore ? 'Update' : 'Save'} Score
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
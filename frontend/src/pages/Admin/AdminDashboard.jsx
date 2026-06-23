import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import { supabase } from '../../services/supabase';
import api from '../../services/api';
import {
  Users,
  Trophy,
  Heart,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentWinners, setRecentWinners] = useState([]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [statsRes, winnersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/winners/recent'),
      ]);
      setStats(statsRes.data.stats);
      setRecentWinners(winnersRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // 🔥 Real-time subscription for winners table
    const subscription = supabase
      .channel('admin-winners-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'winners',
        },
        () => {
          // Refetch recent winners when any change occurs
          api.get('/admin/winners/recent').then((res) => {
            setRecentWinners(res.data.data || []);
          }).catch(console.error);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-impact"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6 text-blue-400" />,
      bg: 'bg-blue-400/10',
      color: 'text-blue-400',
    },
    {
      label: 'Active Subscribers',
      value: stats?.activeSubscribers || 0,
      icon: <CheckCircle className="w-6 h-6 text-green-400" />,
      bg: 'bg-green-400/10',
      color: 'text-green-400',
    },
    {
      label: 'Total Prize Pool',
      value: `$${stats?.totalPrizePool?.toFixed(2) || '0.00'}`,
      icon: <DollarSign className="w-6 h-6 text-gold" />,
      bg: 'bg-gold/10',
      color: 'text-gold',
    },
    {
      label: 'Charities',
      value: stats?.totalCharities || 0,
      icon: <Heart className="w-6 h-6 text-impact" />,
      bg: 'bg-impact/10',
      color: 'text-impact',
    },
  ];

  return (
    <div className="flex gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <AdminSidebar />

      <div className="flex-1 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="gradient-text">Admin</span> Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {user?.full_name || 'Admin'}. Here's your platform overview.
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-impact/20 hover:border-impact/40 transition-colors">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-gold" />
                Draw Management
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Simulate and publish monthly draws, manage winners.
              </p>
              <a
                href="/admin/draws"
                className="inline-block bg-impact/20 text-impact hover:bg-impact/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Manage Draws →
              </a>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-impact/20 hover:border-impact/40 transition-colors">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-impact" />
                Charity Management
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Add, edit, and manage charitable organizations.
              </p>
              <a
                href="/admin/charities"
                className="inline-block bg-impact/20 text-impact hover:bg-impact/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Manage Charities →
              </a>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-impact/20 hover:border-impact/40 transition-colors">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Winner Verification
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Review proof submissions and verify winners.
              </p>
              <a
                href="/admin/winners"
                className="inline-block bg-impact/20 text-impact hover:bg-impact/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Verify Winners →
              </a>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="border-impact/20 hover:border-impact/40 transition-colors">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                User Management
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                View and manage all platform users and subscriptions.
              </p>
              <a
                href="/admin/users"
                className="inline-block bg-impact/20 text-impact hover:bg-impact/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Manage Users →
              </a>
            </Card>
          </motion.div>
        </div>

        {/* Recent Winners */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-gold" />
                Recent Winners
                <span className="text-xs text-green-400 ml-2 animate-pulse">🔴 Live</span>
              </h2>
              <span className="text-sm text-gray-400">Last 10</span>
            </div>

            {recentWinners.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No winners yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Tier</th>
                      <th className="pb-3">Prize</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentWinners.map((winner) => {
                      const statusConfig = {
                        pending: { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
                        approved: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-400/10' },
                        rejected: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-400/10' },
                        paid: { icon: <DollarSign className="w-4 h-4" />, color: 'text-impact', bg: 'bg-impact/10' },
                      };
                      const config = statusConfig[winner.verification_status] || statusConfig.pending;
                      return (
                        <tr key={winner.id} className="border-b border-gray-700/50 last:border-0 hover:bg-white/5 transition-colors">
                          <td className="py-3 text-white">{winner.profile?.full_name || 'Unknown'}</td>
                          <td className="py-3 text-gold font-medium">{winner.tier} Number</td>
                          <td className="py-3 text-gold font-semibold">${winner.prize_amount?.toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                              {config.icon}
                              {winner.verification_status.charAt(0).toUpperCase() + winner.verification_status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 text-gray-400 text-sm">
                            {new Date(winner.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
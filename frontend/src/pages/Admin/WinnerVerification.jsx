import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import api from '../../services/api';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  Download,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const WinnerVerification = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/winners/all');
      setWinners(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch winners:', error);
      toast.error('Failed to load winners');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (winnerId, status) => {
    try {
      await api.put(`/admin/winners/${winnerId}/status`, { verificationStatus: status });
      toast.success(`Winner ${status}!`);
      fetchWinners();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleMarkPaid = async (winnerId) => {
    if (!window.confirm('Mark this winner as paid?')) return;
    try {
      await api.put(`/admin/winners/${winnerId}/pay`);
      toast.success('Winner marked as paid!');
      fetchWinners();
    } catch (error) {
      toast.error('Failed to mark as paid');
    }
  };

  const filteredWinners = winners.filter((winner) => {
    if (filter === 'all') return true;
    return winner.verification_status === filter;
  });

  const statusConfigs = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      label: 'Pending',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
    },
    approved: {
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'Approved',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20',
    },
    rejected: {
      icon: <XCircle className="w-4 h-4" />,
      label: 'Rejected',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
    },
    paid: {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Paid',
      color: 'text-impact',
      bg: 'bg-impact/10',
      border: 'border-impact/20',
    },
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
            <span className="gradient-text">Winner</span> Verification
          </h1>
          <p className="text-gray-400 mt-1">Review and verify winner submissions.</p>
        </motion.div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {['all', 'pending', 'approved', 'rejected', 'paid'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-impact text-dark'
                  : 'bg-gray-700/30 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && (
                <span className="ml-2 text-xs opacity-70">
                  ({winners.filter((w) => w.verification_status === status).length})
                </span>
              )}
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={fetchWinners} className="ml-auto">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Winners List */}
        <div className="space-y-4">
          {filteredWinners.map((winner) => {
            const status = statusConfigs[winner.verification_status] || statusConfigs.pending;
            return (
              <motion.div
                key={winner.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`border ${status.border}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-gold/10 rounded-xl p-3">
                        <Trophy className="w-6 h-6 text-gold" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          {winner.profile?.full_name || 'Unknown User'}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {winner.profile?.email || 'No email'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            {winner.tier} Number Match
                          </span>
                          <span className="text-xs text-gold font-semibold">
                            ${winner.prize_amount?.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {winner.draw?.month}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>

                      {winner.proof_image_url && (
                        <a
                          href={winner.proof_image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-impact hover:text-impact-light text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Proof
                        </a>
                      )}

                      {winner.verification_status === 'pending' && (
                        <>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleUpdateStatus(winner.id, 'approved')}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleUpdateStatus(winner.id, 'rejected')}
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {winner.verification_status === 'approved' && (
                        <Button
                          variant="gold"
                          size="sm"
                          onClick={() => handleMarkPaid(winner.id)}
                        >
                          <DollarSign className="w-4 h-4" />
                          Mark Paid
                        </Button>
                      )}

                      {winner.verification_status === 'paid' && (
                        <span className="text-sm text-impact font-medium">
                          ✓ Paid
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          {filteredWinners.length === 0 && (
            <div className="text-center py-12 glass rounded-2xl border border-gray-700">
              <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No winners found</p>
              <p className="text-gray-500">Try changing the filter or run a draw.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerVerification;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Card from '../../components/common/Card';
import { supabase } from '../../services/supabase';
import api from '../../services/api';
import {
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  const getStatusBadge = (status) => {
    const configs = {
      active: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Active' },
      pending: { icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Pending' },
      cancelled: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Cancelled' },
      lapsed: { icon: <Clock className="w-4 h-4" />, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Lapsed' },
    };
    return configs[status] || configs.pending;
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
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">User</span> Management
            </h1>
            <p className="text-gray-400 mt-1">
              View all platform users. 🔄 <span className="text-impact">Real-time updates active</span>
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </motion.div>

        <Card>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Subscription</th>
                    <th className="pb-3">Role</th>
                    <th className="pb-3">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const subStatus = getStatusBadge(user.subscription_status);

                    return (
                      <tr key={user.id} className="border-b border-gray-700/50 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-3 text-white font-medium">{user.full_name}</td>
                        <td className="py-3 text-gray-400 text-sm">{user.email || 'N/A'}</td>
                        <td className="py-3">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${subStatus.bg} ${subStatus.color}`}>
                            {subStatus.icon}
                            {subStatus.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-impact/10 text-impact' : 'bg-gray-700/30 text-gray-400'}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserManagement;
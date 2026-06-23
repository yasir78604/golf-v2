import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { User, Mail, Heart, Percent, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    charityId: '',
    charityPercentage: 10,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        charityId: user.charity_id || '',
        charityPercentage: user.charity_percentage || 10,
      });
    }
    fetchCharities();
  }, [user]);

  const fetchCharities = async () => {
    try {
      const response = await api.get('/charities');
      setCharities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch charities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/users/${user.id}`, formData);
      toast.success('Profile updated!');
      refreshUser();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          Your <span className="gradient-text">Profile</span>
        </h1>
        <p className="text-gray-400">Manage your account settings and preferences.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8"
      >
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-gray-700">
              <div className="w-16 h-16 rounded-full bg-impact/20 flex items-center justify-center">
                <User className="w-8 h-8 text-impact" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">{user?.full_name}</h3>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-impact" />
                  Full Name
                </span>
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-impact" />
                  Email
                </span>
              </label>
              <Input
                value={user?.email}
                disabled
                className="opacity-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-impact" />
                  Your Charity
                </span>
              </label>
              <select
                value={formData.charityId}
                onChange={(e) => setFormData({ ...formData, charityId: e.target.value })}
                className="w-full bg-dark text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none transition-colors"
              >
                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gold" />
                  Charity Contribution:{' '}
                  <span className="text-gold font-bold">{formData.charityPercentage}%</span>
                </span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={formData.charityPercentage}
                onChange={(e) => setFormData({ ...formData, charityPercentage: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-impact"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10%</span>
                <span>100%</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </form>
        </Card>

        {/* ============================================ */}
        {/* 👇 SUBSCRIPTION PENDING MESSAGE GOES HERE 👇 */}
        {/* ============================================ */}
        {user?.subscription_status === 'pending' && (
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 mt-4">
            <p className="text-yellow-400">
              ⏳ Your subscription is pending activation. Please wait for admin approval or upgrade your plan.
            </p>
            <Link to="/pricing" className="text-impact hover:underline inline-block mt-2">
              Go to Pricing →
            </Link>
          </div>
        )}

        {/* Account Stats */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card>
            <p className="text-sm text-gray-400">Subscription Status</p>
            <p className={`text-lg font-semibold ${user?.subscription_status === 'active' ? 'text-green-400' : 'text-yellow-400'}`}>
              {user?.subscription_status
                ? user.subscription_status.charAt(0).toUpperCase() + user.subscription_status.slice(1)
                : 'Not Subscribed'}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-400">Total Winnings</p>
            <p className="text-lg font-semibold text-gold">${user?.total_winnings?.toFixed(2) || '0.00'}</p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
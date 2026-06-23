import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Mail, Lock, User, Heart, Percent, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [charities, setCharities] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    charityId: '',
    charityPercentage: 10,
  });

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await api.get('/charities');
      setCharities(response.data.data || []);
      if (response.data.data?.length > 0) {
        setFormData((prev) => ({ ...prev, charityId: response.data.data[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch charities:', error);
    }
  };

  // src/pages/Auth/Signup.jsx – handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await signup(formData);

    if (result.success) {
      toast.success('Account created! Please subscribe to activate.');
      navigate('/pricing');
    } else {
      toast.error(result.error || 'Signup failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span className="gradient-text">Impact</span> Swing
            </h1>
            <p className="text-gray-400 mt-2">Start making a difference today.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-dark text-white pl-11 pr-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-dark text-white pl-11 pr-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-dark text-white pl-11 pr-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none transition-colors"
                  minLength="6"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-impact" />
                  Choose Your Charity
                </span>
              </label>
              <select
                value={formData.charityId}
                onChange={(e) => setFormData({ ...formData, charityId: e.target.value })}
                className="w-full bg-dark text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-impact focus:outline-none transition-colors appearance-none"
                required
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
                  Charity Contribution (%)
                </span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={formData.charityPercentage}
                  onChange={(e) => setFormData({ ...formData, charityPercentage: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-impact"
                />
                <span className="text-2xl font-bold text-gold min-w-[60px] text-right">
                  {formData.charityPercentage}%
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 10% of your subscription goes to charity.</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-impact hover:bg-impact-light text-dark font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-impact hover:text-impact-light font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
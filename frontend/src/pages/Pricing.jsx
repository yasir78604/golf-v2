import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Check, Sparkles, Star, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Pricing = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Handle payment success/cancel from Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');

    // If user is already active, redirect to dashboard (prevents staying on pricing)
    if (user?.subscription_status === 'active') {
      navigate('/dashboard');
      return;
    }

    if (paymentStatus === 'success') {
      handlePaymentSuccess();
    } else if (paymentStatus === 'canceled') {
      toast.error('Payment was canceled. You can try again.');
    }
  }, [location, user]);

  const handlePaymentSuccess = async () => {
    try {
      toast.loading('Activating your subscription...', { id: 'activate' });

      const response = await api.post('/subscriptions/activate');
      console.log('Activation response:', response.data);

      const updatedUser = await refreshUser();
      console.log('Refreshed user:', updatedUser);

      toast.success('🎉 Subscription active! Redirecting...', { id: 'activate' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Activation error:', error);
      toast.error('Activation failed. Please contact support.', { id: 'activate' });
      navigate('/dashboard');
    }
  };

  const handleSubscribe = async (plan) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/subscriptions/create-checkout', { plan });
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to start checkout');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: 'Monthly',
      slug: 'monthly',
      price: '$10',
      period: '/month',
      description: 'Perfect for casual golfers',
      features: [
        'Unlimited score logging',
        'Access to monthly draws',
        'Support your chosen charity',
        '10% minimum charity contribution',
        'View draw results',
        'Winner verification',
      ],
      color: 'border-impact/20',
      buttonColor: 'bg-impact hover:bg-impact-light',
      icon: <Sparkles className="w-6 h-6 text-impact" />,
    },
    {
      name: 'Yearly',
      slug: 'yearly',
      price: '$100',
      period: '/year (Save $20)',
      description: 'Best value for dedicated players',
      features: [
        'Everything in Monthly',
        '2 months free ($120 value)',
        'Priority draw entry',
        'Early access to results',
        'Exclusive community access',
        'Annual impact report',
      ],
      color: 'border-gold/30',
      buttonColor: 'bg-gold hover:bg-gold-light text-dark',
      icon: <Star className="w-6 h-6 text-gold" />,
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-dark py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Choose Your <span className="gradient-text">Impact Plan</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Subscribe to start tracking scores, winning prizes, and supporting charities.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass rounded-3xl p-8 border ${plan.color} relative ${
                plan.popular ? 'scale-105 shadow-2xl shadow-gold/10' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-dark text-xs font-bold px-4 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {plan.icon}
                  <h2 className="text-2xl font-bold text-white">{plan.name}</h2>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-400">{plan.period}</span>
                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <Check className="w-5 h-5 text-impact flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSubscribe(plan.slug)}
                disabled={loading}
                className={`w-full text-center font-semibold py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonColor}`}
              >
                {isAuthenticated ? 'Subscribe Now' : 'Get Started'}
              </motion.button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Secure payment via Stripe</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 max-w-3xl mx-auto glass rounded-2xl p-8 border border-gray-700 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">❤️</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Every Subscription Makes a Difference
          </h3>
          <p className="text-gray-400">
            A minimum of <span className="text-impact font-bold">10%</span> of your subscription
            goes directly to your chosen charity. You can increase this percentage anytime.
          </p>
          <p className="text-gold font-medium mt-2">
            Golf for a cause. Win for a purpose. ❤️
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
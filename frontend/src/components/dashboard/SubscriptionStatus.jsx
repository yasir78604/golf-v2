import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const SubscriptionStatus = ({ status, plan, renewsAt }) => {
  const configs = {
    active: {
      icon: <CheckCircle className="w-5 h-5" />,
      text: 'Active',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20',
    },
    pending: {
      icon: <Clock className="w-5 h-5" />,
      text: 'Pending',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
    },
    cancelled: {
      icon: <XCircle className="w-5 h-5" />,
      text: 'Cancelled',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
    },
    lapsed: {
      icon: <AlertCircle className="w-5 h-5" />,
      text: 'Lapsed',
      color: 'text-gray-400',
      bg: 'bg-gray-400/10',
      border: 'border-gray-400/20',
    },
  };

  const config = configs[status] || configs.pending;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${config.bg} ${config.border}`}
    >
      <span className={config.color}>{config.icon}</span>
      <div>
        <p className={`font-semibold ${config.color}`}>{config.text}</p>
        {plan && (
          <p className="text-xs text-gray-400">
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </p>
        )}
        {renewsAt && status === 'active' && (
          <p className="text-xs text-gray-500">
            Renews: {new Date(renewsAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionStatus;
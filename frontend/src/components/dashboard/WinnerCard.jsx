import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, XCircle, DollarSign, Upload } from 'lucide-react';
import Button from '../common/Button';

const WinnerCard = ({ winner, onUploadProof }) => {
  const statusConfigs = {
    pending: {
      icon: <Clock className="w-4 h-4" />,
      text: 'Pending Verification',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
    },
    approved: {
      icon: <CheckCircle className="w-4 h-4" />,
      text: 'Approved',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20',
    },
    rejected: {
      icon: <XCircle className="w-4 h-4" />,
      text: 'Rejected',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
    },
    paid: {
      icon: <DollarSign className="w-4 h-4" />,
      text: 'Paid',
      color: 'text-impact',
      bg: 'bg-impact/10',
      border: 'border-impact/20',
    },
  };

  const config = statusConfigs[winner.verification_status] || statusConfigs.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl p-6 border ${config.border}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-gold">
              ${winner.prize_amount?.toFixed(2)}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} flex items-center gap-1`}>
              {config.icon}
              {config.text}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {winner.tier} Number Match · {winner.draw?.month || 'Unknown draw'}
          </p>
          {winner.draw?.numbers && (
            <p className="text-xs text-gray-500 mt-1">
              Winning Numbers: {winner.draw.numbers.join(' - ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {winner.proof_image_url ? (
            <a
              href={winner.proof_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-impact hover:text-impact-light text-sm flex items-center gap-1"
            >
              View Proof
            </a>
          ) : (
            winner.verification_status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                icon={<Upload className="w-4 h-4" />}
                onClick={() => onUploadProof?.(winner.id)}
              >
                Upload Proof
              </Button>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default WinnerCard;
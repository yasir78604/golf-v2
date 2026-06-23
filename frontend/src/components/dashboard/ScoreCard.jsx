import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Trophy } from 'lucide-react';

const ScoreCard = ({ score, index, onEdit, onDelete }) => {
  const isLatest = index === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`
        flex items-center justify-between p-4 rounded-xl border
        ${isLatest ? 'border-gold/30 bg-gold/5' : 'border-gray-700'}
        hover:border-impact/20 transition-colors
      `}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className={`text-3xl font-bold ${isLatest ? 'text-gold' : 'text-white'}`}>
            {score.points}
          </span>
          {isLatest && (
            <Trophy className="absolute -top-2 -right-6 w-4 h-4 text-gold" />
          )}
        </div>
        <div>
          <p className="text-sm text-gray-400">
            {new Date(score.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          {isLatest && (
            <span className="text-xs text-gold font-medium">Latest Score</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ScoreCard;
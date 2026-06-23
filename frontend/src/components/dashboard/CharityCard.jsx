import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ExternalLink, Star } from 'lucide-react';

const CharityCard = ({ charity, selected = false, onSelect }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        glass rounded-2xl p-6 border transition-all cursor-pointer
        ${selected ? 'border-impact' : 'border-gray-700 hover:border-impact/30'}
      `}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        {charity.image_url ? (
          <img
            src={charity.image_url}
            alt={charity.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-impact/10 flex items-center justify-center">
            <Heart className="w-8 h-8 text-impact" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white truncate">
              {charity.name}
            </h3>
            {charity.is_featured && (
              <Star className="w-4 h-4 text-gold fill-gold" />
            )}
          </div>
          {charity.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mt-1">
              {charity.description}
            </p>
          )}
          {charity.website && (
            <a
              href={charity.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-impact hover:text-impact-light flex items-center gap-1 mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              Visit Website
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {selected && (
          <div className="bg-impact rounded-full p-1">
            <Heart className="w-4 h-4 text-dark" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CharityCard;
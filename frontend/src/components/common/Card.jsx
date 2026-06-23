import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  padding = true,
  ...props
}) => {
  const variants = {
    default: 'glass border border-gray-700',
    glass: 'glass border border-gray-700',
    dark: 'bg-dark border border-gray-700',
    gradient: 'gradient-border',
  };

  const baseClasses = `
    rounded-2xl
    ${variants[variant]}
    ${padding ? 'p-6' : ''}
    ${hover ? 'hover:scale-105 transition-all duration-300' : ''}
    ${className}
  `;

  if (variant === 'gradient') {
    return (
      <div className="gradient-border">
        <div className="gradient-border-inner">
          {children}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={baseClasses}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
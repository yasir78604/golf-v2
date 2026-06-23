import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label,
  error,
  icon,
  iconPosition = 'left',
  className = '',
  required = false,
  ...props
}, ref) => {
  const baseClasses = `
    w-full bg-dark text-white px-4 py-3
    rounded-xl border border-gray-700
    focus:border-impact focus:outline-none
    transition-all duration-200
    placeholder:text-gray-500
    ${error ? 'border-red-500 focus:border-red-500' : ''}
    ${icon ? (iconPosition === 'left' ? 'pl-11' : 'pr-11') : ''}
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </span>
        )}
        <input ref={ref} className={baseClasses} {...props} />
        {icon && iconPosition === 'right' && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {icon}
          </span>
        )}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
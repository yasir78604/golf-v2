// Helper functions used across the app

// Generate random number between min and max
const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Get current month in YYYY-MM format
const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};

// Check if user has active subscription
const isActiveSubscriber = (user) => {
  return user.subscription_status === 'active';
};

// Calculate age from date
const daysBetween = (date1, date2) => {
  const diff = Math.abs(date2 - date1);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

module.exports = {
  randomInt,
  formatDate,
  getCurrentMonth,
  isActiveSubscriber,
  daysBetween,
};
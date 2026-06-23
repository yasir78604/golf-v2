// Format currency
export const formatCurrency = (amount) => {
  return `$${parseFloat(amount || 0).toFixed(2)}`;
};

// Format date
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Truncate text
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

// Generate random color
export const randomColor = () => {
  const colors = ['#45A29E', '#F5A623', '#FF6B6B', '#51CF66', '#FFD93D', '#845EF7', '#FF6B9D'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get initial letters
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Debounce function
export const debounce = (func, delay = 500) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Scroll to top
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Get current month in YYYY-MM format
export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7);
};

// Check if user is active subscriber
export const isActiveSubscriber = (user) => {
  return user?.subscription_status === 'active';
};

// Calculate days between dates
export const daysBetween = (date1, date2) => {
  const diff = Math.abs(new Date(date2) - new Date(date1));
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
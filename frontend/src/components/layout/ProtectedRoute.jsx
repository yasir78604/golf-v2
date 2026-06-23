import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false, requireSubscription = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Check subscription requirement (for dashboard and game routes)
  if (requireSubscription && user?.role !== 'admin' && user?.subscription_status !== 'active') {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
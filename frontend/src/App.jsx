import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Layout
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/Pricing';
import CharityList from './pages/CharityList';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import DrawManagement from './pages/Admin/DrawManagement';
import CharityManagement from './pages/Admin/CharityManagement';
import WinnerVerification from './pages/Admin/WinnerVerification';
import UserManagement from './pages/Admin/UserManagement';  // ✅ NEW IMPORT

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/charities" element={<CharityList />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requireSubscription>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/draws"
              element={
                <ProtectedRoute adminOnly>
                  <DrawManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/charities"
              element={
                <ProtectedRoute adminOnly>
                  <CharityManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/winners"
              element={
                <ProtectedRoute adminOnly>
                  <WinnerVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"    // ✅ NEW ROUTE
              element={
                <ProtectedRoute adminOnly>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1F2833',
              color: '#FFFFFF',
              border: '1px solid rgba(69, 162, 158, 0.2)',
            },
            success: { icon: '🎉' },
            error: { icon: '❌' },
          }}
        />
      </AuthProvider>
    </Router>
  );
};

export default App;
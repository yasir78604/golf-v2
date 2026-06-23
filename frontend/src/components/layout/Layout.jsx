import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  LayoutDashboard,
  Trophy,
  Heart,
  User,
  LogOut,
  Menu,
  X,
  Sparkles,
  Settings,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Public nav links
  const navLinks = [
    { path: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { path: '/charities', label: 'Charities', icon: <Heart className="w-4 h-4" /> },
    { path: '/pricing', label: 'Pricing', icon: <Sparkles className="w-4 h-4" /> },
  ];

  // Build authenticated links based on subscription status
  const getUserLinks = () => {
    const links = [];

    if (isAuthenticated && !loading) {
      // Show Dashboard ONLY if active subscriber or admin
      if (user?.subscription_status === 'active' || user?.role === 'admin') {
        links.push({
          path: '/dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        });
      }

      // Profile always visible
      links.push({
        path: '/profile',
        label: 'Profile',
        icon: <User className="w-4 h-4" />,
      });

      // Admin link (only for admins)
      if (user?.role === 'admin') {
        links.push({
          path: '/admin',
          label: 'Admin',
          icon: <Settings className="w-4 h-4" />,
        });
      }
    }

    return links;
  };

  const allLinks = [...navLinks, ...getUserLinks()];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-impact"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-impact rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-dark" />
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Impact</span> Swing
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {allLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-impact/20 text-impact'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors ml-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              ) : (
                <div className="flex items-center gap-2 ml-2">
                  <Link to="/login">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-impact hover:bg-impact-light text-dark transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-gray-700/50 p-4 space-y-2"
          >
            {allLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'bg-impact/20 text-impact'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t border-gray-700/50">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-impact/10 text-impact hover:bg-impact/20 transition-colors">
                    Login
                  </button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <button className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-impact hover:bg-impact-light text-dark transition-colors">
                    Sign Up
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-impact" />
              <span className="text-sm font-semibold text-white">Impact Swing</span>
              <span className="text-xs text-gray-500">© 2026</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link to="/charities" className="hover:text-impact transition-colors">
                Charities
              </Link>
              <Link to="/pricing" className="hover:text-impact transition-colors">
                Pricing
              </Link>
              <span className="text-gray-600">|</span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-impact fill-impact" />
                <span>Golf for a Cause</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
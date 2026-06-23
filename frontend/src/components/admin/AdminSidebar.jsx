import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Trophy,
  Heart,
  Users,
  Gift,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/draws', label: 'Draw Management', icon: <Gift className="w-5 h-5" /> },
    { path: '/admin/charities', label: 'Charities', icon: <Heart className="w-5 h-5" /> },
    { path: '/admin/winners', label: 'Winners', icon: <Trophy className="w-5 h-5" /> },
    { path: '/admin/users', label: 'Users', icon: <Users className="w-5 h-5" /> },  // ✅ ADD THIS
    { path: '/admin/stats', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 min-h-[calc(100vh-4rem)] bg-slate/30 rounded-2xl border border-gray-700 p-4 sticky top-20"
    >
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
              ${isActive
                ? 'bg-impact/20 text-impact'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      <div className="border-t border-gray-700 mt-6 pt-6">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
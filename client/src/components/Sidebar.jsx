import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Settings, LogOut, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { isLightMode, toggleTheme } = useTheme();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <div className="w-64 border-r border-[var(--border-dim)] bg-[#0A0C10] flex flex-col h-full relative z-10 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-[var(--border-dim)]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-lg shadow-brand-primary/30">
          <Code2 size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">CollabSphere</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-2 text-xs font-semibold text-brand-secondary/60 uppercase tracking-wider mb-4">Workspace</p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-white/10 text-white font-medium border border-white/20' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--border-dim)] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-brand-card border border-[var(--border-dim)] flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/10"
            title="Toggle Theme"
          >
            {isLightMode ? <Moon size={16} /> : <Sun size={16} />}
            {isLightMode ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button 
            onClick={logout}
            className="px-3 py-2 text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

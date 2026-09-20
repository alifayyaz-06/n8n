import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Bike, Settings, Terminal, Store, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar() {
  const { restaurant, user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/orders', label: 'Orders', icon: ShoppingBag },
    { to: '/riders', label: 'Riders & Pending Cash', icon: Bike },
    { to: '/settings', label: 'Settings Terminal', icon: Terminal },
  ];

  return (
    <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col justify-between p-4 min-h-[calc(100vh-4rem)] flex-shrink-0">
      <div className="space-y-4">
        {/* Tenant Active Card */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Store className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Tenant</span>
          </div>
          <p className="text-sm font-extrabold text-slate-900 truncate">
            {restaurant?.name || 'Gourmet Bistro'}
          </p>
          <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@gourmet.com'}</p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="w-5 h-5 text-emerald-600" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
          <span>Sign Out</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1 text-[11px] text-slate-400 font-medium">
          <Settings className="w-3.5 h-3.5 text-slate-300" />
          <span>v2.0 Multi-Tenant SaaS</span>
        </div>
      </div>
    </aside>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, LayoutDashboard, ShoppingBag, Bike, Wallet, LogOut } from 'lucide-react';
import { riderService } from '../services/riderService';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';

export function Navbar() {
  const { restaurant, user, logout } = useAuth();
  const [totalPendingCash, setTotalPendingCash] = useState(0);

  const fetchPendingCash = useCallback(async () => {
    try {
      const res = await riderService.getRiders();
      if (res && res.totalPendingCash !== undefined) {
        setTotalPendingCash(res.totalPendingCash);
      }
    } catch (err) {
      console.warn('Failed to refresh navbar pending cash:', err);
    }
  }, []);

  useEffect(() => {
    fetchPendingCash();

    // Listen for live rider mutation events (settle balance, assign rider, create, update, delete)
    const handleRiderUpdate = () => {
      fetchPendingCash();
    };

    window.addEventListener('riderDataChanged', handleRiderUpdate);

    // Short interval polling (every 3 seconds) for live sync
    const interval = setInterval(() => {
      fetchPendingCash();
    }, 3000);

    return () => {
      window.removeEventListener('riderDataChanged', handleRiderUpdate);
      clearInterval(interval);
    };
  }, [fetchPendingCash, restaurant]);

  return (
    <header className="h-16 border-b border-slate-200 bg-white shadow-xs px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/10">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight flex items-center gap-2">
            <span>{restaurant?.name || 'Restaurant Portal'}</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Tenant Active
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500">Order Management Portal</p>
        </div>
      </div>

      {/* Mobile Navigation Tabs */}
      <nav className="flex md:hidden items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              isActive
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`
          }
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              isActive
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`
          }
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Orders</span>
        </NavLink>
        <NavLink
          to="/riders"
          className={({ isActive }) =>
            `px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              isActive
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`
          }
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Riders</span>
        </NavLink>
      </nav>

      {/* Status Badges, Rider Pending Amount Quick Link & Actions */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Rider Pending Cash Badge Link */}
        <NavLink
          to="/riders"
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isActive
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Wallet className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />
              <span>Rider Pending:</span>
              <span className={`font-extrabold font-mono ${isActive ? 'text-white' : 'text-emerald-700'}`}>
                {formatCurrency(totalPendingCash)}
              </span>
            </>
          )}
        </NavLink>

        {/* User Info / Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="text-right text-xs hidden lg:block">
            <p className="font-bold text-slate-800 leading-tight">{user?.email || user?.phone || 'Admin'}</p>
            <p className="text-[10px] text-slate-400 font-medium">Restaurant Admin</p>
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
            title="Log out of tenant session"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

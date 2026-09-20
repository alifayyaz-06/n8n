import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { Bell, ChevronDown, Volume2, Wallet, BellRing } from 'lucide-react';
import { riderService } from '../services/riderService';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { formatCurrency } from '../utils/formatters';

export function Navbar() {
  const { restaurant } = useAuth();
  const { newOrdersCount, needsAudioPermission, enableAudio } = useOrders();
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

    const handleRiderUpdate = () => {
      fetchPendingCash();
    };

    window.addEventListener('riderDataChanged', handleRiderUpdate);

    const interval = setInterval(() => {
      fetchPendingCash();
    }, 3000);

    return () => {
      window.removeEventListener('riderDataChanged', handleRiderUpdate);
      clearInterval(interval);
    };
  }, [fetchPendingCash, restaurant]);

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left Mobile Brand Title */}
      <div className="flex md:hidden items-center gap-2">
        <h1 className="text-sm font-bold text-slate-900 truncate">
          {restaurant?.name || 'FoodHub'}
        </h1>
      </div>

      <div className="hidden md:block"></div>

      {/* Right Top Bar Actions */}
      <div className="flex items-center gap-3">
        {/* Persistent New Orders Counter Badge */}
        {newOrdersCount > 0 ? (
          <NavLink
            to="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-xs animate-pulse border border-amber-600"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>NEW ORDERS ({newOrdersCount})</span>
          </NavLink>
        ) : null}

        {/* Audio Context Enable Button */}
        {needsAudioPermission && (
          <button
            onClick={enableAudio}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-300 transition-all shadow-xs"
            title="Enable Audio Chime Notifications"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enable Sound</span>
          </button>
        )}

        {/* Rider Pending Cash Link */}
        <NavLink
          to="/riders"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-all"
        >
          <Wallet className="w-3.5 h-3.5 text-slate-500" />
          <span>Pending:</span>
          <span className="font-bold text-slate-900 font-mono">
            {formatCurrency(totalPendingCash)}
          </span>
        </NavLink>

        {/* Notification Bell */}
        <button className="w-9 h-9 rounded-full hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 transition-colors relative">
          <Bell className="w-4 h-4" />
          {newOrdersCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-2 right-2 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            RA
          </div>
          <span className="text-xs font-semibold text-slate-900 hidden sm:inline">
            Restaurant Admin
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        </div>
      </div>
    </header>
  );
}

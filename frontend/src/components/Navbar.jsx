import React, { useState, useEffect, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { UtensilsCrossed, LayoutDashboard, ShoppingBag, Bike, Wallet, BellRing, Volume2 } from 'lucide-react';
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

    // Listen for live rider mutation events
    const handleRiderUpdate = () => {
      fetchPendingCash();
    };

    window.addEventListener('riderDataChanged', handleRiderUpdate);

    // Short interval polling for live sync
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

      {/* Status Badges, New Orders Counter & Rider Pending Cash */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Persistent New Orders Counter Badge */}
        {newOrdersCount > 0 ? (
          <NavLink
            to="/orders"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-extrabold text-xs shadow-md animate-pulse border border-amber-600"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <BellRing className="w-3.5 h-3.5 animate-bounce" />
            <span>🔴 NEW ORDERS ({newOrdersCount})</span>
          </NavLink>
        ) : (
          <NavLink
            to="/orders"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold border border-slate-200"
          >
            <span>NEW ORDERS (0)</span>
          </NavLink>
        )}

        {/* Audio Context Enable Button */}
        {needsAudioPermission && (
          <button
            onClick={enableAudio}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-all shadow-xs"
            title="Enable Audio Chime Notifications"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enable Sound</span>
          </button>
        )}

        {/* Rider Pending Cash Badge Link */}
        <NavLink
          to="/riders"
          className={({ isActive }) =>
            `hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
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
      </div>
    </header>
  );
}

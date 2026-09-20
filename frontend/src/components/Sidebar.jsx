import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bike,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';

export function Sidebar() {
  const { logout, restaurant } = useAuth();
  const { newOrdersCount } = useOrders();

  const navItems = [
    { to: '/', label: 'Orders', icon: ShoppingBag, badgeCount: newOrdersCount },
    { to: '/riders', label: 'Riders & Cash', icon: Bike },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-60 border-r border-slate-200/80 bg-white flex-col justify-between p-4 min-h-screen flex-shrink-0">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs flex-shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none truncate">
              {restaurant?.name || 'FoodHub'}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-1 truncate">
              Good Food, Happy People
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-700" />
                  <span>{item.label}</span>
                </div>
                {item.badgeCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white animate-pulse">
                    {item.badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

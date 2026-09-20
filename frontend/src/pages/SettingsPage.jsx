import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Building2, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const { restaurant, user } = useAuth();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-600" />
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          View your restaurant profile and account settings.
        </p>
      </div>

      {/* Restaurant Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Restaurant Information</h2>
            <p className="text-xs text-slate-500">Registered multi-tenant restaurant profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Restaurant Name
            </label>
            <p className="text-sm font-bold text-slate-900">{restaurant?.name || 'Gourmet Bistro'}</p>
          </div>

          <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Manager Contact Phone
            </label>
            <p className="text-sm font-mono font-bold text-slate-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              {user?.phone || '03001234567'}
            </p>
          </div>
        </div>
      </div>

      {/* Account Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Security & Status</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Tenant
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Your restaurant account is active and connected to live order synchronization.
        </p>
      </div>
    </div>
  );
}

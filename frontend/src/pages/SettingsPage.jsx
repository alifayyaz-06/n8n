import React, { useState, useEffect } from 'react';
import { riderService } from '../services/riderService';
import {
  Bike,
  Settings,
  Terminal,
  Plus,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Edit2,
  Trash2,
  X,
  Check,
} from 'lucide-react';

export function SettingsPage() {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState(null);

  // Form inputs for creation
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('Honda CG 125');

  // Edit Rider modal state
  const [editingRider, setEditingRider] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editVehicle, setEditVehicle] = useState('');
  const [editStatus, setEditStatus] = useState('Active');

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    setLoading(true);
    try {
      const res = await riderService.getRiders();
      if (res.data) setRiders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRider = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await riderService.createRider({
        name: name.trim(),
        phone: phone.trim() || 'N/A',
        vehicle: vehicle.trim() || 'Bike',
        status: 'Active',
      });
      setName('');
      setPhone('');
      setMessage(`Rider '${name}' registered into Supabase terminal successfully!`);
      await loadRiders();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to register rider.');
    } finally {
      setCreating(false);
    }
  };

  const handleStartEdit = (rider) => {
    setEditingRider(rider);
    setEditName(rider.name);
    setEditPhone(rider.phone);
    setEditVehicle(rider.vehicle || 'Bike');
    setEditStatus(rider.status || 'Active');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingRider || !editName.trim()) return;

    setUpdating(true);
    try {
      await riderService.updateRider(editingRider.id, {
        name: editName.trim(),
        phone: editPhone.trim() || 'N/A',
        vehicle: editVehicle.trim() || 'Bike',
        status: editStatus,
      });
      setMessage(`Rider '${editName}' updated successfully in Supabase!`);
      setEditingRider(null);
      await loadRiders();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update rider.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRider = async (rider) => {
    if (!window.confirm(`Are you sure you want to delete rider '${rider.name}'?`)) {
      return;
    }

    setDeletingId(rider.id);
    try {
      await riderService.deleteRider(rider.id);
      setMessage(`Rider '${rider.name}' deleted from system.`);
      await loadRiders();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete rider.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto bg-white min-h-screen">
      {/* 1. Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-600" />
          Settings Terminal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage system configurations, edit/delete delivery riders, and sync directly with Supabase.
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* 2. Rider Terminal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Rider Terminal Form */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs h-fit">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Add Rider Terminal
            </h2>
          </div>

          <form onSubmit={handleAddRider} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rider Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mahmood"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Vehicle Details
              </label>
              <input
                type="text"
                placeholder="e.g. Honda CG 125"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Register New Rider</span>
            </button>
          </form>
        </div>

        {/* Registered Riders Directory with Edit/Delete */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Registered Riders Directory ({riders.length})
              </h2>
            </div>
            <button
              onClick={loadRiders}
              className="p-1.5 text-slate-500 hover:text-emerald-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <p>Fetching riders directory from Supabase...</p>
            </div>
          ) : riders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No riders registered in Supabase. Use the terminal form on the left to add your first rider.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {riders.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold flex-shrink-0">
                      <Bike className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">{r.name}</h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                            r.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {r.status || 'Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {r.phone} • {r.vehicle || 'Bike'}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Edit & Delete Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartEdit(r)}
                      className="p-2 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Edit Rider"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button
                      disabled={deletingId === r.id}
                      onClick={() => handleDeleteRider(r)}
                      className="p-2 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1 text-xs font-bold"
                      title="Delete Rider"
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Edit Rider Modal */}
      {editingRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-emerald-600" /> Edit Rider Details
              </h3>
              <button
                onClick={() => setEditingRider(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rider Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Vehicle Details
                </label>
                <input
                  type="text"
                  value={editVehicle}
                  onChange={(e) => setEditVehicle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRider(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

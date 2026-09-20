import React, { useState, useEffect } from 'react';
import { riderService } from '../services/riderService';
import { formatCurrency } from '../utils/formatters';
import {
  Bike,
  Wallet,
  Phone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShoppingBag,
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { Link } from 'react-router-dom';

export function RidersPage() {
  const [riders, setRiders] = useState([]);
  const [totalPendingCash, setTotalPendingCash] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settlingId, setSettlingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [expandedRiderId, setExpandedRiderId] = useState(null);

  // Add rider modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRiderName, setNewRiderName] = useState('');
  const [newRiderPhone, setNewRiderPhone] = useState('');
  const [newRiderVehicle, setNewRiderVehicle] = useState('Honda CG 125');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRidersData();
  }, []);

  const fetchRidersData = async () => {
    setLoading(true);
    try {
      const res = await riderService.getRiders();
      if (res.data) {
        setRiders(res.data);
        setTotalPendingCash(res.totalPendingCash || 0);
      }
    } catch (err) {
      console.error('Failed to load riders data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettleBalance = async (rider) => {
    if (!window.confirm(`Are you sure you want to collect and clear Rs. ${rider.pendingAmount} cash from ${rider.name}?`)) {
      return;
    }

    setSettlingId(rider.id);
    try {
      await riderService.settleRiderBalance(rider.id);
      setMessage(`Successfully settled ${formatCurrency(rider.pendingAmount)} for ${rider.name}.`);
      await fetchRidersData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to settle balance.');
    } finally {
      setSettlingId(null);
    }
  };

  const handleCreateRider = async (e) => {
    e.preventDefault();
    if (!newRiderName.trim()) return;

    setCreating(true);
    try {
      await riderService.createRider({
        name: newRiderName.trim(),
        phone: newRiderPhone.trim() || 'N/A',
        vehicle: newRiderVehicle,
        status: 'Active',
      });
      setNewRiderName('');
      setNewRiderPhone('');
      setShowAddModal(false);
      setMessage('New rider added successfully!');
      await fetchRidersData();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      alert(err.message || 'Failed to add rider.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 py-32 space-y-3 bg-white min-h-screen">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading rider pending cash balances...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-white min-h-screen">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Bike className="w-8 h-8 text-emerald-600" />
            Riders & Pending Cash
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active delivery riders, pending cash collections, and settle balances.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Rider</span>
        </button>
      </div>

      {/* Notification Toast */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800 text-xs sm:text-sm shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{message}</span>
        </div>
      )}

      {/* 2. Key Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Active Riders</span>
            <Bike className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {riders.filter((r) => r.status === 'Active').length}
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pending Cash</span>
            <Wallet className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
            {formatCurrency(totalPendingCash)}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Assigned Orders</span>
            <ShoppingBag className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {riders.reduce((sum, r) => sum + (r.assignedOrdersCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* 3. Riders List Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Riders Summary</h2>

        {riders.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-slate-300 rounded-2xl space-y-3 bg-white">
            <Bike className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Riders Added Yet</h3>
            <p className="text-xs text-slate-500">
              Click "Add New Rider" above to register delivery riders.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {riders.map((rider) => {
              const isExpanded = expandedRiderId === rider.id;
              const hasPending = rider.pendingAmount > 0;

              return (
                <div
                  key={rider.id}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 flex flex-col justify-between"
                >
                  {/* Rider Header Details */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-lg">
                          <Bike className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 leading-tight">
                            {rider.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>{rider.phone}</span>
                            <span>•</span>
                            <span>{rider.vehicle || 'Bike'}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          rider.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {rider.status}
                      </span>
                    </div>

                    {/* Pending Amount Display Card */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Pending Cash Collection
                        </span>
                        <div className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                          {formatCurrency(rider.pendingAmount || 0)}
                        </div>
                      </div>

                      <button
                        disabled={!hasPending || settlingId === rider.id}
                        onClick={() => handleSettleBalance(rider)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          hasPending
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {settlingId === rider.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Wallet className="w-4 h-4" />
                        )}
                        <span>Collect & Settle Cash</span>
                      </button>
                    </div>

                    {/* Assigned Orders List Collapsible */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setExpandedRiderId(isExpanded ? null : rider.id)}
                        className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors py-1"
                      >
                        <span>
                          Assigned Orders ({rider.pendingOrders?.length || 0} Pending)
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in duration-150">
                          {(!rider.pendingOrders || rider.pendingOrders.length === 0) ? (
                            <p className="text-xs text-slate-400 italic py-2 text-center">
                              No pending cash orders for this rider.
                            </p>
                          ) : (
                            rider.pendingOrders.map((order) => (
                              <div
                                key={order.id}
                                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      to={`/orders/${order.id}`}
                                      className="font-bold text-emerald-700 hover:underline font-mono"
                                    >
                                      #{order.id}
                                    </Link>
                                    <StatusBadge status={order.status} />
                                  </div>
                                  <p className="text-slate-600">{order.customerName}</p>
                                </div>
                                <div className="font-extrabold text-slate-900 font-mono">
                                  {formatCurrency(order.total)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Add Rider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-600" /> Add New Delivery Rider
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRider} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Rider Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mahmood"
                  value={newRiderName}
                  onChange={(e) => setNewRiderName(e.target.value)}
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
                  value={newRiderPhone}
                  onChange={(e) => setNewRiderPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Honda CG 125"
                  value={newRiderVehicle}
                  onChange={(e) => setNewRiderVehicle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Rider</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

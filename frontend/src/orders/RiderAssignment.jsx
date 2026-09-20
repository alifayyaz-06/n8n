import React, { useState, useEffect } from 'react';
import { Bike, UserCheck, ChevronDown, Check, Loader2, Phone } from 'lucide-react';
import { riderService } from '../services/riderService';

export function RiderAssignment({ order, onOrderUpdated }) {
  const [riders, setRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    setLoadingRiders(true);
    try {
      const res = await riderService.getRiders();
      if (res.data) {
        setRiders(res.data.filter((r) => r.status === 'Active'));
      }
    } catch (err) {
      console.error('Failed to load riders list:', err);
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleSelectRider = async (rider) => {
    setAssigning(true);
    setError(null);
    try {
      const res = await riderService.assignRiderToOrder(order.id, rider.id, rider.name);
      if (res.success && res.data) {
        onOrderUpdated(res.data);
      } else {
        fetchRiders();
      }
      setIsOpen(false);
    } catch (err) {
      setError(err.message || 'Failed to assign rider');
    } finally {
      setAssigning(false);
    }
  };

  const currentRider = riders.find((r) => r.id === order.riderId) || {
    name: order.riderName,
    phone: riders.find((r) => r.name === order.riderName)?.phone,
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
          <Bike className="w-5 h-5 text-emerald-600" />
          <span>Rider Assignment</span>
        </div>
        {order.riderName && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Assigned
          </span>
        )}
      </div>

      {error && (
        <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Currently Assigned Display */}
      {order.riderName ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-medium">Delivery Rider</p>
              <h4 className="text-base font-bold text-slate-900">{order.riderName}</h4>
            </div>
            {currentRider.phone && (
              <a
                href={`tel:${currentRider.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-700 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                {currentRider.phone}
              </a>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">Need to change rider?</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors flex items-center gap-1"
            >
              Reassign Rider <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl text-center space-y-3">
          <p className="text-xs text-amber-900 font-medium">
            No rider assigned to this delivery order yet.
          </p>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <Bike className="w-4 h-4" />
            <span>Assign Delivery Rider</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      {/* Dropdown Selector Menu */}
      {isOpen && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg space-y-1 p-2 animate-in fade-in duration-150">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-100">
            Select Active Rider
          </div>
          {loadingRiders ? (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" /> Loading riders...
            </div>
          ) : riders.length === 0 ? (
            <div className="p-3 text-center text-xs text-slate-500">
              No active riders found. Add riders in Settings terminal.
            </div>
          ) : (
            riders.map((rider) => {
              const isSelected = order.riderId === rider.id || order.riderName === rider.name;
              return (
                <button
                  key={rider.id}
                  disabled={assigning}
                  onClick={() => handleSelectRider(rider)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900">{rider.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {rider.phone} • {rider.vehicle || 'Bike'}
                    </div>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : assigning ? (
                    <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

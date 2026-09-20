import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { REJECTION_REASONS } from '../utils/constants';

export function RejectReasonModal({ order, onClose, onConfirmReject }) {
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customNote, setCustomNote] = useState('');

  if (!order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason =
      selectedReason === 'Other' && customNote.trim()
        ? customNote.trim()
        : selectedReason;
    onConfirmReject(order.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
            <AlertTriangle className="w-5 h-5" />
            <span>Reject Order {order.id}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Select Reason for Rejection:
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectionReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {selectedReason === 'Other' && (
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Custom Reason Note:
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Enter details..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

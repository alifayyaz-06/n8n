import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/Button';

export function CompleteOrderModal({ isOpen, orderId, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <span>Complete Order #{orderId}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm font-medium text-slate-800 leading-relaxed">
          Are you sure you want to mark Order <strong className="text-emerald-700 font-mono">#{orderId}</strong> as <span className="font-bold text-slate-900">Completed</span>?
        </p>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onConfirm}>
            Mark as Completed
          </Button>
        </div>
      </div>
    </div>
  );
}

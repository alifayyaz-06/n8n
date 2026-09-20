import React from 'react';
import { formatCurrency } from '../utils/formatters';

export function OrderItems({ items = [] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Ordered Items ({items.length})
        </h3>
      </div>

      <div className="divide-y divide-slate-200">
        {items.map((item) => {
          const itemTotal = item.quantity * item.price;
          return (
            <div
              key={item.id || item.name}
              className="py-3 flex items-center justify-between gap-4 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold font-mono text-xs border border-emerald-200">
                  {item.quantity}×
                </span>
                <div>
                  <h4 className="font-bold text-slate-900">{item.name}</h4>
                  <span className="text-xs text-slate-500 font-mono">
                    {formatCurrency(item.price)} each
                  </span>
                </div>
              </div>

              <div className="text-right font-mono font-bold text-slate-900">
                {formatCurrency(itemTotal)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

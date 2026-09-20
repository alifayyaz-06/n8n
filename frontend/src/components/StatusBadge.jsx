import React from 'react';

const statusConfig = {
  New: {
    label: 'New Order',
    className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-600',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500 animate-pulse',
  },
  Accepted: {
    label: 'Accepted',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-600',
  },
  Preparing: {
    label: 'Preparing',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-600 animate-spin',
  },
  Ready: {
    label: 'Ready',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-600',
  },
  Completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  Rejected: {
    label: 'Rejected',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-600',
  },
};

export function StatusBadge({ status, showDot = true, customLabel }) {
  const normStatus = String(status || '').trim();
  const config = statusConfig[normStatus] || {
    label: normStatus || status,
    className: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />}
      {customLabel || config.label}
    </span>
  );
}

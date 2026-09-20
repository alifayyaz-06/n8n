import React from 'react';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { formatCurrency, formatTime } from '../utils/formatters';
import { ORDER_STATUS } from '../utils/constants';

export function OrderCard({ order, onAccept, onReject }) {
  const isPending = order.status === ORDER_STATUS.PENDING;

  return (
    <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-5 hover:border-slate-600 transition-colors space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-slate-100">{order.id}</span>
            <Badge status={order.status} />
          </div>
          <p className="text-sm text-slate-300 mt-1">{order.customerName}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">{formatTime(order.orderTime)}</span>
          <p className="text-xs text-slate-500 mt-0.5">{order.tableNumber}</p>
        </div>
      </div>

      <div className="border-t border-b border-slate-700/50 py-3 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-slate-300">
              <span className="font-semibold text-emerald-400">{item.quantity}x</span>{' '}
              {item.name}
            </span>
            <span className="text-slate-400">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {order.notes && (
        <p className="text-xs italic text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/20">
          Note: {order.notes}
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-xs text-slate-400">Total</span>
          <p className="text-lg font-bold text-slate-100">{formatCurrency(order.totalAmount)}</p>
        </div>

        {isPending && (
          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" onClick={() => onReject?.(order.id)}>
              Reject
            </Button>
            <Button variant="primary" size="sm" onClick={() => onAccept?.(order.id)}>
              Accept Order
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

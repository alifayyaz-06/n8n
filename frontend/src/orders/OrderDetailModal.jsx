import React from 'react';
import { X, User, Phone, MapPin, Clock, CreditCard, Utensils, CheckCircle2, XCircle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { Button } from '../components/Button';
import { formatCurrency, formatTime, formatDate } from '../utils/formatters';
import { ORDER_STATUS } from '../utils/constants';

export function OrderDetailModal({ order, onClose, onAccept, onReject }) {
  if (!order) return null;

  const isActionable =
    order.status === ORDER_STATUS.NEW || order.status === ORDER_STATUS.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400 font-bold text-lg">{order.id}</span>
            <StatusBadge status={order.status} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <User className="w-4 h-4 text-emerald-400" />
                <span>Customer</span>
              </div>
              <p className="text-sm font-semibold text-slate-100">{order.customerName}</p>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" /> {order.customerPhone}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Placed At</span>
              </div>
              <p className="text-sm font-semibold text-slate-100">{formatTime(order.orderTime)}</p>
              <p className="text-xs text-slate-400">{formatDate(order.orderTime)}</p>
            </div>

            {order.deliveryAddress && (
              <div className="space-y-1 sm:col-span-2 border-t border-slate-700/50 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Delivery Address</span>
                </div>
                <p className="text-xs text-slate-200">{order.deliveryAddress}</p>
              </div>
            )}
          </div>

          {/* Rejection reason banner if rejected */}
          {order.status === ORDER_STATUS.REJECTED && order.rejectionReason && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
              <span className="font-semibold">Rejection Reason:</span> {order.rejectionReason}
            </div>
          )}

          {/* Items List */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Order Items
            </h4>
            <div className="space-y-2 divide-y divide-slate-800">
              {order.items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center justify-center">
                      {item.quantity}x
                    </span>
                    <span className="text-slate-200 font-medium">{item.name}</span>
                  </div>
                  <span className="text-slate-300 font-mono">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Special Notes */}
          {order.notes && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
              <span className="text-xs font-bold text-amber-400 block mb-1">Kitchen Note</span>
              <p className="text-xs text-amber-300 italic">{order.notes}</p>
            </div>
          )}

          {/* Payment & Summary */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>{order.paymentMethod || 'Paid'}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Amount</span>
              <span className="text-xl font-extrabold text-slate-100">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>

          {isActionable && (
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  onClose();
                  onReject(order);
                }}
              >
                Reject Order
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onAccept(order.id);
                }}
              >
                Accept Order
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

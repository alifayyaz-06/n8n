import React from 'react';
import { formatCurrency } from '../utils/formatters';

export function OrderSummary({ order }) {
  if (!order) return null;

  const subtotal = order.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  const deliveryFee =
    order.deliveryFee !== undefined
      ? order.deliveryFee
      : order.orderType === 'DELIVERY'
      ? 3.50
      : 0.0;

  const discount = order.discount || 0.0;
  const finalTotal = subtotal + deliveryFee - discount;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
        Order Summary
      </h3>

      <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-mono font-medium text-slate-900">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Delivery Fee</span>
          <span className="font-mono font-medium text-slate-900">
            {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'Free / Included'}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-700 font-medium">
            <span>Discount</span>
            <span className="font-mono">-{formatCurrency(discount)}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-bold text-slate-900 block">Total Amount</span>
            <span className="text-[11px] text-slate-500">
              {order.paymentMethod || 'Paid via Credit Card'}
            </span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

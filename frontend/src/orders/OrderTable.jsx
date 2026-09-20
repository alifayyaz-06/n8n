import React from 'react';
import { OrderRow } from './OrderRow';
import { PackageSearch } from 'lucide-react';

export function OrderTable({ orders = [], onViewOrder, onAcceptOrder, onRejectOrder, onResetFilters }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white border border-dashed border-slate-300 rounded-2xl my-4 space-y-3 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500 border border-slate-200">
          <PackageSearch className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">No orders found</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          There are no orders matching your current status filter, date range, or search criteria.
        </p>
        {onResetFilters && (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all mt-2"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table Wrapper */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-4">Order #</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Items</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Time</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onViewOrder={onViewOrder}
                onAcceptOrder={onAcceptOrder}
                onRejectOrder={onRejectOrder}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack Wrapper */}
      <div className="block md:hidden">
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            onViewOrder={onViewOrder}
            onAcceptOrder={onAcceptOrder}
            onRejectOrder={onRejectOrder}
          />
        ))}
      </div>
    </div>
  );
}

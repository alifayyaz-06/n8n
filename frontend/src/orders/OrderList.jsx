import React from 'react';
import { OrderCard } from './OrderCard';

export function OrderList({ orders = [], onAcceptOrder, onRejectOrder }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
        <p className="text-slate-400 text-sm">No orders in this category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onAccept={onAcceptOrder}
          onReject={onRejectOrder}
        />
      ))}
    </div>
  );
}

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Banknote,
  ArrowRight,
  UtensilsCrossed,
  RotateCcw,
  AlertCircle,
  Loader2,
  BellRing,
} from 'lucide-react';

export function DashboardOverview() {
  const { orders, loading, error, fetchOrders } = useOrders();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 py-32 space-y-3 bg-white min-h-screen">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Fetching live metrics from backend server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 py-20 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Dashboard Data</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  // Calculate statistics from order dataset
  const newOrdersCount = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'new' || s === 'pending';
  }).length;

  const activeOrdersCount = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'accepted' || s === 'preparing' || s === 'ready';
  }).length;

  const completedOrdersCount = orders.filter((o) => {
    return String(o.status).toLowerCase() === 'completed';
  }).length;

  const todaysSales = orders
    .filter((o) => String(o.status).toLowerCase() === 'completed')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Top 5 recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime))
    .slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time metrics synchronized with Express backend API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Refresh Backend Data</span>
          </button>
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: New Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              New Orders
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {newOrdersCount}
            </span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
              {newOrdersCount > 0 && <BellRing className="w-3 h-3 animate-bounce" />}
              Action Required
            </span>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Kitchen
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {activeOrdersCount}
            </span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              In Kitchen
            </span>
          </div>
        </div>

        {/* Card 3: Completed Orders */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {completedOrdersCount}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Fulfilled
            </span>
          </div>
        </div>

        {/* Card 4: Total Revenue (PKR / Rs.) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(todaysSales)}
            </span>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              Sales Total
            </span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Incoming Activity</h2>
          </div>
          <Link
            to="/orders"
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
          >
            <span>Manage All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {recentOrders.map((order) => {
                const isNew =
                  order.status === 'New' || order.status === 'Pending' || order.status === 'NEW';
                return (
                  <tr
                    key={order.id}
                    className={`transition-colors cursor-pointer ${
                      isNew ? 'bg-amber-50/80 animate-pulse hover:bg-amber-100/80' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => navigate(`/orders/${order.id}`)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                      <div className="flex items-center gap-1.5">
                        <span>{order.id}</span>
                        {isNew && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.id}`);
                        }}
                        className="text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
                      >
                        View Details →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

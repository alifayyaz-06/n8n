import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { formatCurrency, formatTime } from '../utils/formatters';
import {
  ClipboardList,
  Clock,
  Utensils,
  Truck,
  CheckCircle2,
  Search,
  ChevronDown,
  X,
  MapPin,
  Bike,
  Check,
  RotateCcw,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  XCircle
} from 'lucide-react';

export function DashboardOverview() {
  const { orders, loading, error, fetchOrders, updateOrderStatus } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isUpdating, setIsUpdating] = useState(false);
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 py-32 space-y-3 bg-white min-h-screen">
        <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Loading order dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 py-20 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Dashboard</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  // Statistics calculation
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'new' || s === 'pending';
  }).length;
  const preparingOrdersCount = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'accepted' || s === 'preparing' || s === 'in kitchen';
  }).length;
  const deliveryOrdersCount = orders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s === 'ready' || s === 'out for delivery' || s === 'on the way';
  }).length;
  const completedOrdersCount = orders.filter((o) => {
    return String(o.status).toLowerCase() === 'completed';
  }).length;

  // Search & Filter
  const filteredOrders = orders.filter((order) => {
    const displayId = String(order.orderNumber || order.id).toLowerCase();
    const customer = String(order.customerName || '').toLowerCase();
    const phone = String(order.customerPhone || order.phone || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || displayId.includes(q) || customer.includes(q) || phone.includes(q);
    const matchesFilter =
      statusFilter === 'All' ||
      (statusFilter === 'Pending' && ['new', 'pending'].includes(String(order.status).toLowerCase())) ||
      (statusFilter === 'Preparing' && ['accepted', 'preparing'].includes(String(order.status).toLowerCase())) ||
      (statusFilter === 'Delivery' && ['ready', 'out for delivery'].includes(String(order.status).toLowerCase())) ||
      (statusFilter === 'Completed' && String(order.status).toLowerCase() === 'completed');

    return matchesSearch && matchesFilter;
  });

  // Active selected order for right panel
  const selectedOrder =
    orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId) ||
    filteredOrders[0] ||
    orders[0] ||
    null;

  const handleAccept = async (orderId) => {
    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, 'Accepted');
    } catch (err) {
      alert(err.message || 'Failed to accept order.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectModalOrder) return;
    setIsUpdating(true);
    try {
      await updateOrderStatus(rejectModalOrder.id, 'Rejected', rejectReason || 'Busy Kitchen');
      setRejectModalOrder(null);
      setRejectReason('');
    } catch (err) {
      alert(err.message || 'Failed to reject order.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeStyle = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'new' || s === 'pending' || s === 'confirmed') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'accepted' || s === 'preparing') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (s === 'ready' || s === 'out for delivery') {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (s === 'completed') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (s === 'rejected') {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-[#FAFAFA] min-h-screen">
      {/* 1. Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Order Dashboard
        </h1>
      </div>

      {/* 2. Top 5 KPI Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Orders */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{totalOrdersCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                ↑ 12%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">vs. last 7 days</p>
          </div>
        </div>

        {/* Card 2: Pending */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{pendingOrdersCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                ↑ 2%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">vs. last 7 days</p>
          </div>
        </div>

        {/* Card 3: Preparing */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Preparing</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{preparingOrdersCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                ↑ 5%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">vs. last 7 days</p>
          </div>
        </div>

        {/* Card 4: Out for Delivery */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Out for Delivery</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{deliveryOrdersCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                ↑ 8%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">vs. last 7 days</p>
          </div>
        </div>

        {/* Card 5: Completed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{completedOrdersCount}</span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                ↑ 15%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">vs. last 7 days</p>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section: Table + Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Orders Table (lg:col-span-8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-xs">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">Recent Orders</h2>
            <div className="flex items-center gap-2">
              {/* Search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by Order ID, name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-slate-50 border border-slate-200 px-3 py-1.5 pr-8 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">Today</option>
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Delivery">Out for Delivery</option>
                  <option value="Completed">Completed</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Total</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Time</th>
                  <th className="py-3 px-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-medium">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const displayId = order.orderNumber || order.id;
                    const isSelected = selectedOrder && (selectedOrder.id === order.id || selectedOrder.orderNumber === displayId);
                    const itemsSummary = (order.items || [])
                      .map((i) => i.name || i.productName)
                      .filter(Boolean)
                      .join(', ') || 'n8n Order Items';
                    const itemsCount = (order.items || []).reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;

                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className={`transition-colors cursor-pointer ${
                          isSelected ? 'bg-slate-50/90 font-medium' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        {/* Order ID */}
                        <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          {displayId}
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{order.customerName || 'Guest Customer'}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{order.customerPhone || order.phone || 'N/A'}</div>
                        </td>

                        {/* Items */}
                        <td className="py-3.5 px-3 max-w-[200px]">
                          <div className="font-semibold text-slate-800">{itemsCount} item{itemsCount > 1 ? 's' : ''}</div>
                          <div className="text-[11px] text-slate-400 truncate" title={itemsSummary}>
                            {itemsSummary}
                          </div>
                        </td>

                        {/* Total */}
                        <td className="py-3.5 px-3 font-bold text-slate-900 whitespace-nowrap">
                          PKR {Number(order.totalAmount || order.total || 0).toLocaleString()}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadgeStyle(order.status)}`}>
                            {order.status || 'New'}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="py-3.5 px-3 text-slate-400 font-medium whitespace-nowrap">
                          {formatTime(order.orderTime || order.createdAt)}
                        </td>

                        {/* Action dots */}
                        <td className="py-3.5 px-3 text-right text-slate-400">
                          <MoreHorizontal className="w-4 h-4 ml-auto" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Order Details Panel (lg:col-span-4) */}
        {selectedOrder ? (
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-xs sticky top-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">Order Details</h3>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Order ID & Status */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Order ID</span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </span>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeStyle(selectedOrder.status)}`}>
                {selectedOrder.status || 'New'}
              </span>
            </div>

            {/* Customer & Time */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Customer</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedOrder.customerName || 'Guest'}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedOrder.customerPhone || selectedOrder.phone}</p>
              </div>
              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Order Time</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{formatTime(selectedOrder.orderTime || selectedOrder.createdAt)}</p>
                <p className="text-[11px] text-slate-400 font-medium">Today</p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Items</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{item.name || item.productName || 'Item'}</span>
                      <span className="text-slate-400 font-medium text-[11px]">× {item.quantity || 1}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      PKR {Number((item.price || item.unitPrice || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">Total</span>
              <span className="text-lg font-extrabold text-slate-900">
                PKR {Number(selectedOrder.totalAmount || selectedOrder.total || 0).toLocaleString()}
              </span>
            </div>

            {/* Delivery Address & Order Type */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Delivery Address</span>
                <div className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{selectedOrder.deliveryAddress || selectedOrder.address || 'Delivery Address'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Order Type</span>
                <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <Bike className="w-4 h-4 text-slate-400" />
                  <span>Delivery</span>
                </div>
              </div>
            </div>

            {/* Status Step Card */}
            <div className="bg-emerald-50/80 border border-emerald-200/80 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold block">{selectedOrder.status || 'New'}</span>
                <span className="text-[11px] text-emerald-700 font-medium block">
                  Will be delivered within 40 minutes.
                </span>
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                disabled={isUpdating}
                onClick={() => handleAccept(selectedOrder.id)}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Accept Order</span>
              </button>

              <button
                disabled={isUpdating}
                onClick={() => setRejectModalOrder(selectedOrder)}
                className="py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Reject Order</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" /> Reject Order #{rejectModalOrder.orderNumber || rejectModalOrder.id}
              </h3>
              <button onClick={() => setRejectModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Reason for Rejection *</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  <option value="Busy Kitchen">Kitchen Too Busy / High Volume</option>
                  <option value="Item Out of Stock">Item Out of Stock</option>
                  <option value="Outside Delivery Radius">Outside Delivery Radius</option>
                  <option value="Restaurant Closing">Restaurant Closing Soon</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Reject</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

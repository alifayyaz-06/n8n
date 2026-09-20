import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { SearchBar } from '../orders/SearchBar';
import { OrderFilters } from '../orders/OrderFilters';
import { OrderTable } from '../orders/OrderTable';
import { RejectReasonModal } from '../orders/RejectReasonModal';
import { ORDER_STATUS } from '../utils/constants';
import { AlertCircle, Loader2, X } from 'lucide-react';

export function OrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, error, actionError, fetchOrders, updateOrderStatus, clearActionError } = useOrders();

  const [searchQuery, setSearchQuery] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [rejectingOrder, setRejectingOrder] = useState(null);

  const handleResetFilters = () => {
    setSearchQuery('');
    setOrderTypeFilter('ALL');
    setDateFilter('ALL');
    setStatusFilter('ALL');
  };

  // Actions calling backend API
  const handleAcceptOrder = async (id) => {
    try {
      await updateOrderStatus(id, ORDER_STATUS.ACCEPTED);
    } catch {
      // Handled by actionError state
    }
  };

  const handleConfirmReject = async (id, reason) => {
    try {
      await updateOrderStatus(id, ORDER_STATUS.REJECTED, reason);
      setRejectingOrder(null);
    } catch {
      // Handled by actionError state
    }
  };

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL') {
        const normStatusFilter = String(statusFilter).toLowerCase();
        const normOrderStatus = String(order.status).toLowerCase();
        if (normOrderStatus !== normStatusFilter) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = (order.id || '').toLowerCase().includes(query);
        const matchesName = (order.customerName || '').toLowerCase().includes(query);
        const matchesPhone = (order.customerPhone || '').toLowerCase().includes(query);

        if (!matchesId && !matchesName && !matchesPhone) {
          return false;
        }
      }

      // 3. Order Type Filter
      if (orderTypeFilter !== 'ALL' && order.orderType !== orderTypeFilter) {
        return false;
      }

      // 4. Date Filter
      if (dateFilter !== 'ALL') {
        const orderDate = new Date(order.orderTime);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const isSameDay = (d1, d2) =>
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate();

        if (dateFilter === 'TODAY' && !isSameDay(orderDate, today)) {
          return false;
        }
        if (dateFilter === 'YESTERDAY' && !isSameDay(orderDate, yesterday)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery, orderTypeFilter, dateFilter]);

  const hasActiveFilters =
    searchQuery !== '' ||
    orderTypeFilter !== 'ALL' ||
    dateFilter !== 'ALL' ||
    statusFilter !== 'ALL';

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 py-32 space-y-3 bg-white min-h-screen">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-700">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 py-20 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Unable to Load Orders</h2>
        <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto bg-white min-h-screen">
      {/* Action Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between text-rose-800 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={clearActionError} className="p-1 text-rose-600 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Orders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage incoming, active, and past restaurant orders in one place.
          </p>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <OrderFilters
          orderType={orderTypeFilter}
          onOrderTypeChange={setOrderTypeFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Orders Table */}
      <OrderTable
        orders={filteredOrders}
        onViewOrder={(order) => navigate(`/orders/${order.id}`)}
        onAcceptOrder={handleAcceptOrder}
        onRejectOrder={(order) => setRejectingOrder(order)}
        onResetFilters={hasActiveFilters ? handleResetFilters : null}
      />

      <RejectReasonModal
        order={rejectingOrder}
        onClose={() => setRejectingOrder(null)}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}

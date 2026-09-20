import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { orderService } from '../services/orderService';
import { ArrowLeft, Clock, Calendar, MessageSquare, AlertCircle, Loader2, X } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { CustomerInfo } from '../orders/CustomerInfo';
import { OrderItems } from '../orders/OrderItems';
import { OrderSummary } from '../orders/OrderSummary';
import { OrderActions } from '../orders/OrderActions';
import { RiderAssignment } from '../orders/RiderAssignment';
import { formatTime, formatDate } from '../utils/formatters';

export function OrderDetailsPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { updateOrderStatus } = useOrders();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    orderService
      .getOrderById(orderId)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || `Order #${orderId} was not found on the server.`);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleUpdateStatus = async (newStatus, reason = null) => {
    setActionError(null);
    try {
      const updated = await updateOrderStatus(orderId, newStatus, reason);
      if (updated?.order) {
        setOrder(updated.order);
      } else {
        const fresh = await orderService.getOrderById(orderId);
        setOrder(fresh);
      }
    } catch (err) {
      setActionError(err.message || 'Unable to update order status on server.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 py-32 space-y-3 bg-white min-h-screen">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-700">Fetching order details from Express backend...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 py-20 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          {error || `Order ID #${orderId} does not exist on backend.`}
        </p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-800 hover:text-slate-900 text-xs font-bold transition-colors border border-slate-300 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto bg-white min-h-screen">
      {/* Backend Action Error Banner */}
      {actionError && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between text-rose-800 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="p-1 text-rose-600 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Navigation & Title */}
      <div className="space-y-4">
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Orders</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                Order #{order.id}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatTime(order.orderTime)}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(order.orderTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <CustomerInfo order={order} />

          {/* Order Items */}
          <OrderItems items={order.items} />

          {/* Order Notes */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-3">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Customer Notes</span>
            </div>
            {order.notes ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs sm:text-sm text-amber-900 font-medium italic">
                "{order.notes}"
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No special customer notes provided for this order.
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1 col wide on desktop) */}
        <div className="space-y-6">
          {/* Rider Assignment */}
          <RiderAssignment
            order={order}
            onOrderUpdated={(updatedOrder) => setOrder(updatedOrder)}
          />

          {/* Workflow Actions */}
          <OrderActions
            orderId={order.id}
            status={order.status}
            onUpdateStatus={handleUpdateStatus}
          />

          {/* Order Summary */}
          <OrderSummary order={order} />
        </div>
      </div>
    </div>
  );
}

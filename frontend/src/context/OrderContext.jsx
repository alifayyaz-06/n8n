import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  /**
   * Fetch all orders from backend API
   * @param {boolean} isSilent - If true, fetches in background without triggering full-screen loading state
   */
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      if (!isSilent) {
        setError(err.message || 'Unable to connect to backend order service.');
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Initial fetch with loading state
    fetchOrders();

    // Auto-poll live order data silently every 5 seconds
    const intervalId = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  /**
   * Update status of an order via backend PATCH endpoint
   */
  const updateOrderStatus = async (id, newStatus, rejectionReason = null) => {
    setActionError(null);
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, newStatus, rejectionReason);
      setOrders((prevOrders) =>
        prevOrders.map((o) => (o.id === id ? updatedOrder : o))
      );
      return { success: true, order: updatedOrder };
    } catch (err) {
      const msg = err.message || 'Failed to update order status.';
      setActionError(msg);
      throw new Error(msg);
    }
  };

  /**
   * Get order by ID from local cache or fetch fresh from backend
   */
  const getOrderById = (id) => {
    return orders.find((o) => o.id === id) || null;
  };

  /**
   * Create a new order via backend POST endpoint
   */
  const createOrder = async (orderPayload) => {
    setActionError(null);
    try {
      const newOrder = await orderService.createOrder(orderPayload);
      setOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    } catch (err) {
      const msg = err.message || 'Failed to create order.';
      setActionError(msg);
      throw new Error(msg);
    }
  };

  /**
   * Delete an order via backend DELETE endpoint
   */
  const deleteOrder = async (id) => {
    setActionError(null);
    try {
      await orderService.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      return true;
    } catch (err) {
      const msg = err.message || 'Failed to delete order.';
      setActionError(msg);
      throw new Error(msg);
    }
  };

  const clearActionError = () => setActionError(null);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        error,
        actionError,
        fetchOrders,
        getOrderById,
        updateOrderStatus,
        createOrder,
        deleteOrder,
        clearActionError,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}

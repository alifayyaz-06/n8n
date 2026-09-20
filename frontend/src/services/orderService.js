/**
 * Frontend API Service Layer for Express Backend Integration (Multi-Tenant Auth)
 */

import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = authService.getToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Normalizes backend order payload fields to match frontend component prop expectations.
 */
function normalizeOrder(order) {
  if (!order) return null;

  const items = (order.items || []).map((item) => ({
    id: item.id || item.productName || item.name,
    name: item.productName || item.name || 'Item',
    quantity: Number(item.quantity) || 1,
    price: Number(item.unitPrice || item.price) || 0,
    total: Number(item.total) || (Number(item.quantity) || 1) * (Number(item.unitPrice || item.price) || 0),
  }));

  return {
    ...order,
    id: order.id,
    orderNumber: order.orderNumber || order.id?.replace('ORD-', ''),
    customerName: order.customerName || 'Guest Customer',
    customerPhone: order.phone || order.customerPhone || 'N/A',
    deliveryAddress: order.address || order.deliveryAddress || 'Takeout / Pickup',
    orderType: order.orderType || 'DELIVERY',
    items,
    subtotal: Number(order.subtotal) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    discount: Number(order.discount) || 0,
    totalAmount: Number(order.total || order.totalAmount) || 0,
    notes: order.notes || '',
    status: order.status || 'New',
    orderTime: order.createdAt || order.orderTime || new Date().toISOString(),
    rejectionReason: order.rejectionReason || null,
  };
}

export const orderService = {
  /**
   * Fetch all orders from backend API scoped to authenticated restaurant
   */
  getOrders: async (status = '') => {
    try {
      const url = status
        ? `${API_BASE_URL}/orders?status=${encodeURIComponent(status)}`
        : `${API_BASE_URL}/orders`;

      const response = await fetch(url, { headers: getAuthHeaders() });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Unable to fetch orders from server.');
      }

      return (json.data || []).map(normalizeOrder);
    } catch (err) {
      console.error('API Error [getOrders]:', err);
      throw new Error(err.message || 'Unable to connect to backend order service.');
    }
  },

  /**
   * Fetch single order details by ID
   */
  getOrderById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, { headers: getAuthHeaders() });
      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || `Order #${id} not found.`);
      }

      return normalizeOrder(json.data);
    } catch (err) {
      console.error(`API Error [getOrderById:${id}]:`, err);
      throw new Error(err.message || `Unable to load details for Order #${id}.`);
    }
  },

  /**
   * Create a new order via POST /api/orders
   */
  createOrder: async (orderPayload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderPayload),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Failed to create order.');
      }

      return normalizeOrder(json.data);
    } catch (err) {
      console.error('API Error [createOrder]:', err);
      throw new Error(err.message || 'Unable to create order on server.');
    }
  },

  /**
   * Update order status via PATCH /api/orders/:id/status
   */
  updateOrderStatus: async (id, status, rejectionReason = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, rejectionReason }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || `Unable to update order status to '${status}'.`);
      }

      return normalizeOrder(json.data);
    } catch (err) {
      console.error(`API Error [updateOrderStatus:${id}]:`, err);
      throw new Error(err.message || 'Unable to update status on server.');
    }
  },

  /**
   * Delete order via DELETE /api/orders/:id
   */
  deleteOrder: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || `Unable to delete order #${id}.`);
      }

      return true;
    } catch (err) {
      console.error(`API Error [deleteOrder:${id}]:`, err);
      throw new Error(err.message || 'Unable to delete order on server.');
    }
  },
};

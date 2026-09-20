/**
 * Frontend Rider API Service Wrapper (Multi-Tenant Auth)
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

function notifyRiderDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('riderDataChanged'));
  }
}

export const riderService = {
  /**
   * Fetch all riders with pending amounts and order stats from Supabase
   */
  getRiders: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/riders`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch riders.`);
      const json = await res.json();
      return json;
    } catch (err) {
      console.warn('⚠️ riderService.getRiders error:', err.message);
      return { success: false, data: [], totalPendingCash: 0 };
    }
  },

  /**
   * Add a new rider directly to Supabase
   */
  createRider: async (riderData) => {
    const res = await fetch(`${API_BASE_URL}/riders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(riderData),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${res.status}: Unable to create rider.`);
    }
    const data = await res.json();
    notifyRiderDataChanged();
    return data;
  },

  /**
   * Update rider details (name, phone, vehicle, status)
   */
  updateRider: async (riderId, updateData) => {
    const res = await fetch(`${API_BASE_URL}/riders/${riderId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${res.status}: Unable to update rider.`);
    }
    const data = await res.json();
    notifyRiderDataChanged();
    return data;
  },

  /**
   * Delete rider from system
   */
  deleteRider: async (riderId) => {
    const res = await fetch(`${API_BASE_URL}/riders/${riderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${res.status}: Unable to delete rider.`);
    }
    const data = await res.json();
    notifyRiderDataChanged();
    return data;
  },

  /**
   * Assign rider to an order
   */
  assignRiderToOrder: async (orderId, riderId, riderName) => {
    const res = await fetch(`${API_BASE_URL}/riders/orders/${orderId}/assign`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ riderId, riderName }),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${res.status}: Unable to assign rider.`);
    }
    const data = await res.json();
    notifyRiderDataChanged();
    return data;
  },

  /**
   * Settle / Clear pending balance for a rider
   */
  settleRiderBalance: async (riderId) => {
    const res = await fetch(`${API_BASE_URL}/riders/${riderId}/settle`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${res.status}: Unable to settle balance.`);
    }
    const data = await res.json();
    notifyRiderDataChanged();
    return data;
  },
};

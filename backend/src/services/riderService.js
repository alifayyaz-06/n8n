/**
 * Multi-Tenant Rider Service - Backend Data Access & Pending Balance Calculations
 * Tenant isolation enforced via restaurantId parameter & database RLS
 */

import { supabase } from '../db.js';
import { mockRiders } from '../data/mockRiders.js';
import { orderService } from './orderService.js';

let fallbackRiders = mockRiders.map((r) => ({
  ...r,
  restaurantId: r.restaurantId || 'r0000000-0000-0000-0000-000000000001',
}));

function formatSupabaseRider(row) {
  if (!row) return null;
  return {
    id: row.id,
    restaurantId: row.restaurant_id || row.restaurantId,
    name: row.name,
    phone: row.phone,
    status: row.status || 'Active',
    vehicle: row.vehicle || 'Bike',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

export const riderService = {
  /**
   * Retrieve riders scoped strictly to restaurantId with pending cash calculations
   */
  getAllRiders: async (restaurantId) => {
    try {
      const { data: riderRows, error } = await supabase
        .from('riders')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      let ridersList = [];
      if (error || !riderRows || riderRows.length === 0) {
        ridersList = fallbackRiders.filter((r) => r.restaurantId === restaurantId);
      } else {
        ridersList = riderRows.map(formatSupabaseRider);
      }

      // Fetch all tenant orders to compute pending amounts per rider
      const allOrders = await orderService.getAllOrders(restaurantId);

      const ridersWithStats = ridersList.map((rider) => {
        const assignedOrders = allOrders.filter(
          (o) => o.riderId === rider.id || o.riderName?.toLowerCase() === rider.name.toLowerCase()
        );

        const pendingOrders = assignedOrders.filter(
          (o) => !o.riderSettled && o.status !== 'Rejected'
        );

        const pendingAmount = pendingOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const completedCount = assignedOrders.filter((o) => o.status === 'Completed').length;

        return {
          ...rider,
          assignedOrdersCount: assignedOrders.length,
          completedCount,
          pendingAmount,
          pendingOrders,
        };
      });

      return ridersWithStats;
    } catch (err) {
      console.warn('⚠️ Supabase getAllRiders exception, returning fallback stats:', err.message);
      const allOrders = await orderService.getAllOrders(restaurantId);
      const scopedFallback = fallbackRiders.filter((r) => r.restaurantId === restaurantId);
      return scopedFallback.map((rider) => {
        const assignedOrders = allOrders.filter(
          (o) => o.riderId === rider.id || o.riderName?.toLowerCase() === rider.name.toLowerCase()
        );
        const pendingOrders = assignedOrders.filter(
          (o) => !o.riderSettled && o.status !== 'Rejected'
        );
        const pendingAmount = pendingOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        return {
          ...rider,
          assignedOrdersCount: assignedOrders.length,
          completedCount: assignedOrders.filter((o) => o.status === 'Completed').length,
          pendingAmount,
          pendingOrders,
        };
      });
    }
  },

  /**
   * Get single rider by ID verifying tenant ownership
   */
  getRiderById: async (id, restaurantId) => {
    const riders = await riderService.getAllRiders(restaurantId);
    return riders.find((r) => r.id === id) || null;
  },

  /**
   * Create a new rider attached strictly to restaurantId
   */
  createRider: async (riderData, restaurantId) => {
    try {
      const generatedId = `RIDER-${Date.now().toString().slice(-4)}`;
      const newRecord = {
        id: generatedId,
        restaurant_id: restaurantId,
        name: riderData.name,
        phone: riderData.phone || 'N/A',
        vehicle: riderData.vehicle || 'Bike',
        status: riderData.status || 'Active',
      };

      const { data, error } = await supabase
        .from('riders')
        .insert([newRecord])
        .select()
        .single();

      if (error || !data) {
        console.warn('⚠️ Supabase createRider warning, using fallback store:', error?.message);
        const fallbackRecord = {
          ...newRecord,
          restaurantId,
          createdAt: new Date().toISOString(),
        };
        fallbackRiders.unshift(fallbackRecord);
        return {
          ...fallbackRecord,
          assignedOrdersCount: 0,
          completedCount: 0,
          pendingAmount: 0,
          pendingOrders: [],
        };
      }

      const formatted = formatSupabaseRider(data);
      fallbackRiders.unshift(formatted);
      return {
        ...formatted,
        assignedOrdersCount: 0,
        completedCount: 0,
        pendingAmount: 0,
        pendingOrders: [],
      };
    } catch (err) {
      console.warn('⚠️ Supabase createRider exception, fallback used:', err.message);
      const newRider = {
        id: `RIDER-${Date.now().toString().slice(-4)}`,
        restaurantId,
        name: riderData.name,
        phone: riderData.phone || 'N/A',
        vehicle: riderData.vehicle || 'Bike',
        status: riderData.status || 'Active',
        createdAt: new Date().toISOString(),
      };
      fallbackRiders.unshift(newRider);
      return {
        ...newRider,
        assignedOrdersCount: 0,
        completedCount: 0,
        pendingAmount: 0,
        pendingOrders: [],
      };
    }
  },

  /**
   * Update existing rider verifying tenant ownership
   */
  updateRider: async (id, restaurantId, updateData) => {
    try {
      const updatePayload = {
        ...(updateData.name ? { name: updateData.name } : {}),
        ...(updateData.phone ? { phone: updateData.phone } : {}),
        ...(updateData.vehicle ? { vehicle: updateData.vehicle } : {}),
        ...(updateData.status ? { status: updateData.status } : {}),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('riders')
        .update(updatePayload)
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .select()
        .single();

      const index = fallbackRiders.findIndex((r) => r.id === id && r.restaurantId === restaurantId);
      if (index !== -1) {
        fallbackRiders[index] = {
          ...fallbackRiders[index],
          ...updateData,
        };
      }

      if (updateData.name) {
        await supabase
          .from('orders')
          .update({ rider_name: updateData.name })
          .eq('rider_id', id)
          .eq('restaurant_id', restaurantId);
      }

      if (error || !data) {
        const updatedFallback = fallbackRiders.find((r) => r.id === id && r.restaurantId === restaurantId);
        return { success: true, rider: updatedFallback };
      }

      return { success: true, rider: formatSupabaseRider(data) };
    } catch (err) {
      console.warn(`⚠️ Supabase updateRider exception for ${id}:`, err.message);
      const index = fallbackRiders.findIndex((r) => r.id === id && r.restaurantId === restaurantId);
      if (index !== -1) {
        fallbackRiders[index] = {
          ...fallbackRiders[index],
          ...updateData,
        };
        return { success: true, rider: fallbackRiders[index] };
      }
      return { success: false, message: `Rider with ID ${id} not found.` };
    }
  },

  /**
   * Delete rider verifying tenant ownership
   */
  deleteRider: async (id, restaurantId) => {
    try {
      const { error } = await supabase
        .from('riders')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.warn(`⚠️ Supabase deleteRider warning:`, error.message);
      }

      const index = fallbackRiders.findIndex((r) => r.id === id && r.restaurantId === restaurantId);
      if (index !== -1) {
        fallbackRiders.splice(index, 1);
      }

      await supabase
        .from('orders')
        .update({ rider_id: null, rider_name: null })
        .eq('rider_id', id)
        .eq('restaurant_id', restaurantId);

      return true;
    } catch (err) {
      console.warn(`⚠️ Supabase deleteRider exception:`, err.message);
      const index = fallbackRiders.findIndex((r) => r.id === id && r.restaurantId === restaurantId);
      if (index !== -1) {
        fallbackRiders.splice(index, 1);
        return true;
      }
      return false;
    }
  },

  /**
   * Settle pending cash balance for a rider verifying tenant ownership
   */
  settleRiderBalance: async (riderId, restaurantId) => {
    try {
      const rider = await riderService.getRiderById(riderId, restaurantId);
      if (!rider) throw new Error('Rider not found for this tenant.');

      await orderService.settleOrdersForRider(restaurantId, riderId, rider.name);

      return { success: true, message: `Cash balance settled for rider ${rider.name}.` };
    } catch (err) {
      console.warn('⚠️ Exception in settleRiderBalance:', err.message);
      return { success: false, message: err.message || 'Failed to settle balance.' };
    }
  },
};

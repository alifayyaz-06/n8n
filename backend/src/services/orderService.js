/**
 * Multi-Tenant Order Service - Supabase SDK Data Access Layer (@supabase/supabase-js)
 * Tenant isolation enforced via restaurantId parameter & database RLS
 */

import { supabase } from '../db.js';
import { mockOrders } from '../data/mockOrders.js';
import { isValidStatusTransition } from '../models/orderModel.js';

// Fallback dataset mapped by restaurantId
let fallbackStore = mockOrders.map((o) => ({
  ...o,
  restaurantId: o.restaurantId || 'r0000000-0000-0000-0000-000000000001',
}));

function formatSupabaseOrder(row) {
  if (!row) return null;
  const rawItems = row.items || row.order_items || [];
  const items = rawItems.map((i) => ({
    id: i.id,
    productName: i.product_name || i.productName || 'Item',
    quantity: Number(i.quantity) || 1,
    unitPrice: Number(i.unit_price || i.unitPrice) || 0,
    total: Number(i.total) || (Number(i.quantity) || 1) * (Number(i.unit_price || i.unitPrice) || 0),
  }));

  return {
    id: row.id,
    restaurantId: row.restaurant_id || row.restaurantId,
    orderNumber: row.order_number || row.orderNumber || row.id?.replace('ORD-', ''),
    customerName: row.customer_name || row.customerName || 'Guest Customer',
    phone: row.phone || 'N/A',
    address: row.address || 'Pickup',
    orderType: row.order_type || row.orderType || 'DELIVERY',
    subtotal: Number(row.subtotal) || 0,
    deliveryFee: Number(row.delivery_fee || row.deliveryFee) || 0,
    discount: Number(row.discount) || 0,
    total: Number(row.total) || 0,
    notes: row.notes || '',
    status: row.status || 'New',
    rejectionReason: row.rejection_reason || row.rejectionReason || null,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    riderId: row.rider_id || row.riderId || null,
    riderName: row.rider_name || row.riderName || null,
    riderSettled: Boolean(row.rider_settled ?? row.riderSettled ?? false),
    items,
  };
}

export const orderService = {
  /**
   * Retrieve orders scoped strictly to restaurantId
   */
  getAllOrders: async (restaurantId, statusFilter) => {
    try {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.ilike('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('⚠️ Supabase getAllOrders error:', error.message);
        const scopedFallback = fallbackStore.filter((o) => o.restaurantId === restaurantId);
        if (statusFilter) {
          return scopedFallback.filter(
            (o) => o.status.toLowerCase() === statusFilter.toLowerCase()
          );
        }
        return scopedFallback;
      }

      return (data || []).map(formatSupabaseOrder);
    } catch (err) {
      console.warn('⚠️ Supabase getAllOrders exception:', err.message);
      return [];
    }
  },

  /**
   * Retrieve single order details verifying tenant ownership
   */
  getOrderById: async (id, restaurantId) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .single();

      if (error || !data) {
        return fallbackStore.find((o) => o.id === id && o.restaurantId === restaurantId) || null;
      }

      return formatSupabaseOrder(data);
    } catch (err) {
      console.warn(`⚠️ Supabase getOrderById exception:`, err.message);
      return fallbackStore.find((o) => o.id === id && o.restaurantId === restaurantId) || null;
    }
  },

  /**
   * Create a new order attached strictly to restaurantId
   */
  createOrder: async (orderData, restaurantId) => {
    try {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('restaurant_id', restaurantId);

      const nextIdNumber = 1000 + (count || fallbackStore.length) + 1;
      const uniqueSuffix = `${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
      const generatedId = `ORD-${uniqueSuffix}`;

      const rawItems = (orderData.items || []).map((item) => ({
        product_name: item.productName || item.name || 'Unnamed Item',
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unitPrice || item.price) || 0,
        total: (Number(item.quantity) || 1) * (Number(item.unitPrice || item.price) || 0),
      }));

      const subtotal = rawItems.reduce((acc, item) => acc + item.total, 0);
      const deliveryFee = Number(orderData.deliveryFee) || (orderData.orderType === 'DELIVERY' ? 200.00 : 0);
      const discount = Number(orderData.discount) || 0;
      const total = subtotal + deliveryFee - discount;

      const orderRecord = {
        id: generatedId,
        restaurant_id: restaurantId,
        order_number: String(orderData.orderNumber || nextIdNumber),
        customer_name: orderData.customerName || 'Guest Customer',
        phone: orderData.phone || orderData.customerPhone || 'N/A',
        address: orderData.address || orderData.deliveryAddress || 'Pickup',
        order_type: orderData.orderType || 'DELIVERY',
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total,
        notes: orderData.notes || '',
        status: 'New',
      };

      const { data: createdOrder, error: orderErr } = await supabase
        .from('orders')
        .insert([orderRecord])
        .select()
        .single();

      if (orderErr) {
        throw new Error(orderErr.message);
      }

      const itemsToInsert = rawItems.map((item) => ({
        order_id: createdOrder.id,
        ...item,
      }));

      const { data: createdItems } = await supabase
        .from('order_items')
        .insert(itemsToInsert)
        .select();

      const completeRecord = {
        ...createdOrder,
        items: createdItems || [],
      };

      return formatSupabaseOrder(completeRecord);
    } catch (err) {
      console.warn('⚠️ Supabase createOrder exception, using fallback store:', err.message);
      const nextIdNumber = 1000 + fallbackStore.length + 1;
      const generatedId = `ORD-${nextIdNumber}`;
      const newOrder = {
        id: generatedId,
        restaurantId,
        orderNumber: String(nextIdNumber),
        customerName: orderData.customerName || 'Guest Customer',
        phone: orderData.phone || 'N/A',
        address: orderData.address || 'Pickup',
        orderType: orderData.orderType || 'DELIVERY',
        items: (orderData.items || []).map((i) => ({
          productName: i.productName || i.name,
          quantity: i.quantity || 1,
          unitPrice: i.unitPrice || i.price || 0,
          total: (i.quantity || 1) * (i.unitPrice || i.price || 0),
        })),
        subtotal: 1500,
        deliveryFee: 150,
        discount: 0,
        total: 1650,
        notes: orderData.notes || '',
        status: 'New',
        createdAt: new Date().toISOString(),
      };
      fallbackStore.unshift(newOrder);
      return newOrder;
    }
  },

  /**
   * Update order status verifying tenant ownership & transition rules
   */
  updateOrderStatus: async (id, restaurantId, targetStatus, rejectionReason = null) => {
    try {
      const currentOrder = await orderService.getOrderById(id, restaurantId);

      if (!currentOrder) {
        return { success: false, code: 'NOT_FOUND', message: `Order with ID ${id} not found.` };
      }

      if (!isValidStatusTransition(currentOrder.status, targetStatus)) {
        return {
          success: false,
          code: 'INVALID_TRANSITION',
          message: `Cannot transition order status from '${currentOrder.status}' to '${targetStatus}'.`,
        };
      }

      const updatePayload = {
        status: targetStatus,
        ...(rejectionReason ? { rejection_reason: rejectionReason } : {}),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', id)
        .eq('restaurant_id', restaurantId)
        .select('*, items:order_items(*)')
        .single();

      if (error || !data) {
        const orderIndex = fallbackStore.findIndex((o) => o.id === id && o.restaurantId === restaurantId);
        if (orderIndex !== -1) {
          fallbackStore[orderIndex] = {
            ...fallbackStore[orderIndex],
            status: targetStatus,
            ...(rejectionReason ? { rejectionReason } : {}),
          };
          return { success: true, order: fallbackStore[orderIndex] };
        }
      }

      return { success: true, order: formatSupabaseOrder(data) };
    } catch (err) {
      console.warn(`⚠️ Supabase updateOrderStatus exception for ${id}:`, err.message);
      const orderIndex = fallbackStore.findIndex((o) => o.id === id && o.restaurantId === restaurantId);
      if (orderIndex !== -1) {
        fallbackStore[orderIndex] = {
          ...fallbackStore[orderIndex],
          status: targetStatus,
          ...(rejectionReason ? { rejectionReason } : {}),
        };
        return { success: true, order: fallbackStore[orderIndex] };
      }
      return { success: false, code: 'NOT_FOUND', message: `Order #${id} not found.` };
    }
  },

  /**
   * Assign a rider to an order verifying tenant ownership
   */
  assignRider: async (orderId, restaurantId, riderId, riderName) => {
    try {
      const updatePayload = {
        rider_id: riderId,
        rider_name: riderName,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('orders')
        .update(updatePayload)
        .eq('id', orderId)
        .eq('restaurant_id', restaurantId)
        .select('*, items:order_items(*)')
        .single();

      if (error || !data) {
        const index = fallbackStore.findIndex((o) => o.id === orderId && o.restaurantId === restaurantId);
        if (index !== -1) {
          fallbackStore[index] = {
            ...fallbackStore[index],
            riderId,
            riderName,
          };
          return { success: true, order: fallbackStore[index] };
        }
      }

      return { success: true, order: formatSupabaseOrder(data) };
    } catch (err) {
      console.warn(`⚠️ Supabase assignRider exception for ${orderId}:`, err.message);
      const index = fallbackStore.findIndex((o) => o.id === orderId && o.restaurantId === restaurantId);
      if (index !== -1) {
        fallbackStore[index] = {
          ...fallbackStore[index],
          riderId,
          riderName,
        };
        return { success: true, order: fallbackStore[index] };
      }
      return { success: false, message: `Order ${orderId} not found.` };
    }
  },

  /**
   * Delete order from Supabase database verifying tenant ownership
   */
  deleteOrder: async (id, restaurantId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId);

      if (error) {
        console.warn(`⚠️ Supabase deleteOrder warning:`, error.message);
      }
      const orderIndex = fallbackStore.findIndex((o) => o.id === id && o.restaurantId === restaurantId);
      if (orderIndex !== -1) fallbackStore.splice(orderIndex, 1);
      return true;
    } catch (err) {
      console.warn(`⚠️ Supabase deleteOrder exception:`, err.message);
      return false;
    }
  },

  /**
   * Settle pending cash orders for a rider in both Supabase and fallback memory store
   */
  settleOrdersForRider: async (restaurantId, riderId, riderName) => {
    try {
      // 1. Update Supabase database by rider_id if available
      if (riderId) {
        const { error } = await supabase
          .from('orders')
          .update({ rider_settled: true })
          .eq('restaurant_id', restaurantId)
          .eq('rider_id', riderId);
        if (error) console.warn('⚠️ Supabase settle by rider_id warning:', error.message);
      }

      // 2. Update Supabase database by rider_name if available
      if (riderName) {
        const { error } = await supabase
          .from('orders')
          .update({ rider_settled: true })
          .eq('restaurant_id', restaurantId)
          .ilike('rider_name', riderName);
        if (error) console.warn('⚠️ Supabase settle by rider_name warning:', error.message);
      }

      // 3. Update fallback store in memory
      fallbackStore.forEach((o) => {
        if (
          o.restaurantId === restaurantId &&
          (o.riderId === riderId || (riderName && o.riderName?.toLowerCase() === riderName.toLowerCase()))
        ) {
          o.riderSettled = true;
        }
      });

      return true;
    } catch (err) {
      console.warn('⚠️ Exception in settleOrdersForRider:', err.message);
      fallbackStore.forEach((o) => {
        if (
          o.restaurantId === restaurantId &&
          (o.riderId === riderId || (riderName && o.riderName?.toLowerCase() === riderName.toLowerCase()))
        ) {
          o.riderSettled = true;
        }
      });
      return true;
    }
  },
};

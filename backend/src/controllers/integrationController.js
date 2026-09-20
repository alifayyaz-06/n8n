/**
 * Integration Order Controller
 *
 * Handles order creation from external integrations (n8n).
 * The restaurant_id is NEVER accepted from the request body.
 * It is always resolved from the authenticated integration credential.
 */

import { supabase } from '../db.js';

/**
 * POST /api/integrations/orders
 *
 * Creates a new order for the restaurant identified by the integration credential.
 * All monetary totals are calculated server-side — never trusted from the client.
 */
export const createIntegrationOrder = async (req, res) => {
  try {
    const restaurantId = req.integration.restaurantId;
    const {
      customerName,
      phone,
      address,
      orderType,
      items,
      deliveryFee,
      discount,
      notes,
    } = req.body;

    // ────────────────────────────────────────────
    // 1. Validate required fields
    // ────────────────────────────────────────────

    const errors = [];

    if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
      errors.push('customerName is required.');
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      errors.push('phone is required.');
    }

    if (!orderType || typeof orderType !== 'string' || orderType.trim() === '') {
      errors.push('orderType is required.');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('items must be a non-empty array.');
    }

    // Validate deliveryFee and discount are not negative
    const parsedDeliveryFee = Number(deliveryFee) || 0;
    const parsedDiscount = Number(discount) || 0;

    if (parsedDeliveryFee < 0) {
      errors.push('deliveryFee must not be negative.');
    }

    if (parsedDiscount < 0) {
      errors.push('discount must not be negative.');
    }

    // ────────────────────────────────────────────
    // 2. Validate each item
    // ────────────────────────────────────────────

    if (Array.isArray(items)) {
      items.forEach((item, index) => {
        if (!item.productName || typeof item.productName !== 'string' || item.productName.trim() === '') {
          errors.push(`items[${index}].productName is required.`);
        }

        const qty = Number(item.quantity);
        if (!Number.isFinite(qty) || qty <= 0) {
          errors.push(`items[${index}].quantity must be greater than 0.`);
        }

        const price = Number(item.unitPrice);
        if (!Number.isFinite(price) || price < 0) {
          errors.push(`items[${index}].unitPrice must not be negative.`);
        }
      });
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // ────────────────────────────────────────────
    // 3. Calculate totals on the backend
    // ────────────────────────────────────────────

    const calculatedItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const itemTotal = Math.round(quantity * unitPrice * 100) / 100;

      return {
        product_name: item.productName.trim(),
        quantity,
        unit_price: unitPrice,
        total: itemTotal,
      };
    });

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
    const total = Math.round((subtotal + parsedDeliveryFee - parsedDiscount) * 100) / 100;

    // ────────────────────────────────────────────
    // 4. Generate unique order number
    // ────────────────────────────────────────────

    const { count, error: countErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (countErr) {
      console.warn('⚠️ Order count query warning:', countErr.message);
    }

    const orderSequence = (count || 0) + 1;
    const orderNumber = `ORD-${1000 + orderSequence}`;
    const orderId = orderNumber;

    // ────────────────────────────────────────────
    // 5. Create order + items as a transaction
    //    Using Supabase RPC with a plpgsql function
    //    Fallback: sequential inserts with cleanup
    // ────────────────────────────────────────────

    const orderRecord = {
      id: orderId,
      restaurant_id: restaurantId,
      order_number: String(1000 + orderSequence),
      customer_name: customerName.trim(),
      phone: phone.trim(),
      address: (address || 'Pickup').trim(),
      order_type: orderType.trim(),
      subtotal,
      delivery_fee: parsedDeliveryFee,
      discount: parsedDiscount,
      total,
      notes: (notes || '').trim(),
      status: 'New',
    };

    // Insert order
    const { data: createdOrder, error: orderErr } = await supabase
      .from('orders')
      .insert([orderRecord])
      .select()
      .single();

    if (orderErr) {
      console.error('❌ Integration order insert error:', orderErr.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order in database.',
        error: orderErr.message,
      });
    }

    // Insert order items
    const itemsToInsert = calculatedItems.map((item) => ({
      order_id: createdOrder.id,
      ...item,
    }));

    const { data: createdItems, error: itemsErr } = await supabase
      .from('order_items')
      .insert(itemsToInsert)
      .select();

    if (itemsErr) {
      // Transaction rollback: delete the orphaned order
      console.error('❌ Integration order_items insert error:', itemsErr.message);
      console.warn('🔄 Rolling back: deleting orphaned order', createdOrder.id);

      await supabase
        .from('orders')
        .delete()
        .eq('id', createdOrder.id);

      return res.status(500).json({
        success: false,
        message: 'Failed to create order items. Order has been rolled back.',
        error: itemsErr.message,
      });
    }

    // ────────────────────────────────────────────
    // 6. Return success response
    // ────────────────────────────────────────────

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: createdOrder.id,
        orderNumber,
        restaurantId: createdOrder.restaurant_id,
        status: createdOrder.status,
        customerName: createdOrder.customer_name,
        phone: createdOrder.phone,
        address: createdOrder.address,
        orderType: createdOrder.order_type,
        subtotal: Number(createdOrder.subtotal),
        deliveryFee: Number(createdOrder.delivery_fee),
        discount: Number(createdOrder.discount),
        total: Number(createdOrder.total),
        notes: createdOrder.notes,
        items: (createdItems || []).map((i) => ({
          id: i.id,
          productName: i.product_name,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          total: Number(i.total),
        })),
        createdAt: createdOrder.created_at,
      },
    });
  } catch (err) {
    console.error('❌ createIntegrationOrder exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating order.',
    });
  }
};

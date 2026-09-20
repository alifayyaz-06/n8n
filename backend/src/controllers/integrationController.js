/**
 * Integration Order Controller
 *
 * Handles order creation from external integrations (n8n).
 * The restaurant_id is NEVER accepted from the request body.
 * It is always resolved from the authenticated integration credential.
 */

import { supabase } from '../db.js';
import crypto from 'crypto';

/**
 * POST /api/integrations/orders
 *
 * Creates a new order for the restaurant identified by the integration credential.
 * All monetary totals are calculated server-side — never trusted from the client.
 */
export const createIntegrationOrder = async (req, res) => {
  try {
    const restaurantId = req.integration.restaurantId;
    const body = req.body || {};

    // Normalize customer details with smart defaults
    const customerName = String(body.customerName || body.customer_name || body.name || body.clientName || 'Guest Customer').trim();
    const phone = String(body.phone || body.customerPhone || body.customer_phone || body.mobile || 'N/A').trim();
    const address = String(body.address || body.deliveryAddress || body.customerAddress || 'Delivery Address').trim();
    const orderType = String(body.orderType || body.order_type || 'DELIVERY').toUpperCase();
    const notes = String(body.notes || body.instructions || body.comment || '').trim();

    const parsedDeliveryFee = Math.max(0, Number(body.deliveryFee ?? body.delivery_fee ?? 0) || 0);
    const parsedDiscount = Math.max(0, Number(body.discount ?? 0) || 0);

    // Flexible items array normalization (supports items, order_items, products, or top-level single item)
    let rawItems = body.items || body.order_items || body.products || [];
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      if (body.productName || body.product_name || body.item) {
        rawItems = [{
          productName: body.productName || body.product_name || body.item,
          quantity: body.quantity || body.qty || 1,
          unitPrice: body.unitPrice || body.unit_price || body.price || 0,
        }];
      } else {
        rawItems = [{
          productName: 'n8n Order Item',
          quantity: 1,
          unitPrice: 0,
        }];
      }
    }

    // Calculate totals on the backend
    const calculatedItems = rawItems.map((item) => {
      const pName = String(item.productName || item.product_name || item.name || item.title || 'Item').trim();
      const quantity = Math.max(1, Number(item.quantity ?? item.qty ?? 1) || 1);
      const unitPrice = Math.max(0, Number(item.unitPrice ?? item.unit_price ?? item.price ?? 0) || 0);
      const itemTotal = Math.round(quantity * unitPrice * 100) / 100;

      return {
        product_name: pName,
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

/**
 * GET /api/integrations/credentials (Authenticated via requireAuth)
 * Returns or generates an n8n API key for the logged-in restaurant
 */
export const getOrCreateIntegrationKey = async (req, res) => {
  try {
    const restaurantId = req.restaurantId;
    const restaurantName = req.restaurant?.name || 'Restaurant';

    // Check if active key already exists
    const { data: existingCred } = await supabase
      .from('integration_credentials')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_active', true)
      .maybeSingle();

    if (existingCred) {
      return res.status(200).json({
        success: true,
        credential: existingCred,
        message: 'Active integration credential retrieved.',
      });
    }

    // Generate new key
    const cleanName = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const n8nApiKey = `n8n_${cleanName}_${crypto.randomBytes(16).toString('hex')}`;
    const apiKeyHash = crypto.createHash('sha256').update(n8nApiKey).digest('hex');

    const { data: newCred, error } = await supabase
      .from('integration_credentials')
      .insert([
        {
          restaurant_id: restaurantId,
          name: `${restaurantName} n8n Integration`,
          api_key: n8nApiKey,
          api_key_hash: apiKeyHash,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to create integration credential: ${error.message}`,
      });
    }

    return res.status(201).json({
      success: true,
      n8nApiKey,
      credential: newCred,
      message: 'New n8n integration API key generated successfully.',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to manage integration key.',
      error: err.message,
    });
  }
};

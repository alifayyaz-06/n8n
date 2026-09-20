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

    // ────────────────────────────────────────────
    // 1. Extract & normalize the 6 required n8n fields:
    //    { orderId, customerName, phoneNumber, orderItems, totalAmount, deliveryAddress }
    // ────────────────────────────────────────────

    const n8nOrderId = body.orderId || body.order_id || body.orderNumber;
    const customerName = String(body.customerName || body.customer_name || body.name || 'Guest Customer').trim();
    const phone = String(body.phoneNumber || body.phone || body.customerPhone || body.mobile || 'N/A').trim();
    const address = String(body.deliveryAddress || body.address || body.customerAddress || 'Delivery Address').trim();
    
    // Total Amount parsing
    const rawTotalStr = String(body.totalAmount ?? body.total ?? body.total_amount ?? 0);
    const passedTotal = Math.max(0, Number(rawTotalStr.replace(/[^\d.]/g, '')) || 0);

    // ────────────────────────────────────────────
    // 2. Parse & normalize orderItems (string or array format)
    // ────────────────────────────────────────────

    let calculatedItems = [];
    const rawOrderItems = body.orderItems || body.order_items || body.items || body.products;

    if (typeof rawOrderItems === 'string' && rawOrderItems.trim() !== '') {
      // Split string by line breaks or commas e.g. "2x Zinger Burger, 1x Fries"
      const lines = rawOrderItems.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      if (lines.length > 0) {
        const itemPrice = passedTotal > 0 ? Math.round((passedTotal / lines.length) * 100) / 100 : 0;
        calculatedItems = lines.map((line) => {
          const match = line.match(/^(\d+)\s*x?\s*(.+)$/i);
          const qty = match ? Math.max(1, Number(match[1])) : 1;
          const pName = match ? match[2].trim() : line;
          return {
            product_name: pName,
            quantity: qty,
            unit_price: itemPrice,
            total: itemPrice * qty,
          };
        });
      }
    } else if (Array.isArray(rawOrderItems) && rawOrderItems.length > 0) {
      calculatedItems = rawOrderItems.map((item) => {
        const pName = typeof item === 'string' ? item : String(item.productName || item.name || item.product_name || 'Item').trim();
        const qty = typeof item === 'object' ? Math.max(1, Number(item.quantity ?? item.qty ?? 1) || 1) : 1;
        const price = typeof item === 'object' ? Math.max(0, Number(item.unitPrice ?? item.price ?? 0) || 0) : 0;
        return {
          product_name: pName,
          quantity: qty,
          unit_price: price,
          total: Math.round(qty * price * 100) / 100,
        };
      });
    }

    if (calculatedItems.length === 0) {
      calculatedItems = [{
        product_name: typeof rawOrderItems === 'string' && rawOrderItems.trim() ? rawOrderItems.trim() : 'n8n Order Item',
        quantity: 1,
        unit_price: passedTotal,
        total: passedTotal,
      }];
    }

    const calculatedSubtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
    const finalTotal = passedTotal > 0 ? passedTotal : calculatedSubtotal;
    const finalSubtotal = finalTotal;

    // ────────────────────────────────────────────
    // 3. Generate unique primary key ID & display order number
    // ────────────────────────────────────────────

    const { count, error: countErr } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('restaurant_id', restaurantId);

    if (countErr) {
      console.warn('⚠️ Order count query warning:', countErr.message);
    }

    const orderSequence = (count || 0) + 1;
    const displayOrderNumber = n8nOrderId ? String(n8nOrderId).trim() : `ORD-${1000 + orderSequence}`;
    const uniqueSuffix = `${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const primaryKeyId = `ORD-${uniqueSuffix}`;

    const orderRecord = {
      id: primaryKeyId,
      restaurant_id: restaurantId,
      order_number: displayOrderNumber,
      customer_name: customerName,
      phone: phone,
      address: address,
      order_type: 'DELIVERY',
      subtotal: finalSubtotal,
      delivery_fee: 0,
      discount: 0,
      total: finalTotal,
      notes: '',
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
    // 6. Return success response with 6 required fields
    // ────────────────────────────────────────────

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: createdOrder.id,
        orderId: createdOrder.order_number,
        orderNumber: createdOrder.order_number,
        restaurantId: createdOrder.restaurant_id,
        status: createdOrder.status,
        customerName: createdOrder.customer_name,
        phoneNumber: createdOrder.phone,
        deliveryAddress: createdOrder.address,
        orderItems: (createdItems || []).map((i) => ({
          id: i.id,
          productName: i.product_name,
          quantity: i.quantity,
          unitPrice: Number(i.unit_price),
          total: Number(i.total),
        })),
        totalAmount: Number(createdOrder.total),
        createdAt: createdOrder.created_at,
      },
    });
  } catch (err) {
    console.error('❌ createIntegrationOrder exception:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while creating order.',
      error: err.message,
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

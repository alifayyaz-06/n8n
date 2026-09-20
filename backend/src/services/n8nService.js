/**
 * n8n Webhook Service
 *
 * Handles sending HTTP status webhooks from Express backend to n8n workflows
 * when an order status is updated by a restaurant owner.
 */

export const sendOrderStatusWebhook = async (order) => {
  try {
    if (!order) {
      console.warn('⚠️ sendOrderStatusWebhook called with null/undefined order object.');
      return false;
    }

    const primaryUrl =
      process.env.N8N_ORDER_STATUS_WEBHOOK_URL ||
      'https://ali5665.app.n8n.cloud/webhook/order-status';
    const testUrl = 'https://ali5665.app.n8n.cloud/webhook-test/order-status';

    const payload = {
      orderId: order.orderNumber || order.id,
      status: order.status,
      customerName: order.customerName || 'Guest Customer',
      phoneNumber: order.customerPhone || order.phone || 'N/A',
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    if (process.env.N8N_WEBHOOK_SECRET) {
      headers['Authorization'] = `Bearer ${process.env.N8N_WEBHOOK_SECRET}`;
    }

    console.log(`📡 Sending order status webhook to n8n for Order ID: ${payload.orderId} (${payload.status})...`);

    // 1. Try Primary / Production Webhook URL
    let response = await fetch(primaryUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (response && response.ok) {
      console.log(`✅ n8n status webhook sent successfully to primary URL for Order ID: ${payload.orderId} (${payload.status})`);
      return true;
    }

    // 2. Fallback: Try Test Webhook URL if n8n is currently in Test/Listen mode
    if (primaryUrl !== testUrl) {
      console.log(`🔄 Primary n8n webhook returned ${response ? response.status : 'error'}. Trying test URL: ${testUrl}`);
      let testResponse = await fetch(testUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }).catch(() => null);

      if (testResponse && testResponse.ok) {
        console.log(`✅ n8n status webhook sent successfully to test URL for Order ID: ${payload.orderId} (${payload.status})`);
        return true;
      }
    }

    console.warn(`⚠️ Could not reach n8n webhook (both primary and test endpoints failed) for Order ID: ${payload.orderId}`);
    return false;
  } catch (err) {
    console.error(`❌ Failed to send order status webhook to n8n for Order ID ${order?.orderNumber || order?.id}:`, err.message);
    return false;
  }
};

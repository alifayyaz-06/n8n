/**
 * n8n Webhook Service
 *
 * Handles sending HTTP status webhooks from Express backend to n8n workflows
 * when an order status is updated by a restaurant owner.
 */

export const sendOrderStatusWebhook = async (order) => {
  try {
    const webhookUrl =
      process.env.N8N_ORDER_STATUS_WEBHOOK_URL ||
      'https://ali5665.app.n8n.cloud/webhook/order-status';

    if (!order) {
      console.warn('⚠️ sendOrderStatusWebhook called with null/undefined order object.');
      return false;
    }

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

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn(
        `⚠️ Failed to send order status webhook to n8n. HTTP Status: ${response.status} ${response.statusText} for Order ID: ${payload.orderId}`
      );
      return false;
    }

    console.log(`✅ n8n order status webhook sent successfully for Order ID: ${payload.orderId} (${payload.status})`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send order status webhook to n8n for Order ID ${order?.orderNumber || order?.id}:`, err.message);
    return false;
  }
};

/**
 * Helper utility to generate direct WhatsApp click-to-chat URLs for customer orders
 */

export function getWhatsAppLink(phone, orderId = '', customerName = '') {
  if (!phone) return '#';
  
  // Clean phone number to digits only
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!cleanPhone) return '#';

  const greeting = customerName ? `Hello ${customerName}` : 'Hello';
  const orderRef = orderId ? ` regarding your order #${orderId}` : '';
  const message = `${greeting}${orderRef} at Gourmet Bistro:`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

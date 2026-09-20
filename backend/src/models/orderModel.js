/**
 * Order Model & Status Workflow Rules
 */

export const ORDER_STATUSES = {
  NEW: 'New',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export const ALLOWED_TRANSITIONS = {
  [ORDER_STATUSES.NEW]: [ORDER_STATUSES.ACCEPTED, ORDER_STATUSES.REJECTED],
  [ORDER_STATUSES.ACCEPTED]: [ORDER_STATUSES.PREPARING],
  [ORDER_STATUSES.PREPARING]: [ORDER_STATUSES.READY],
  [ORDER_STATUSES.READY]: [ORDER_STATUSES.COMPLETED],
  [ORDER_STATUSES.COMPLETED]: [],
  [ORDER_STATUSES.REJECTED]: [],
};

/**
 * Validates whether a status transition is allowed
 */
export function isValidStatusTransition(currentStatus, targetStatus) {
  if (!currentStatus || !targetStatus) return false;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

/**
 * Helper to structure order object payload safely
 */
export function formatOrderPayload(data, generatedId) {
  const items = (data.items || []).map((item) => ({
    productName: item.productName || item.name || 'Unnamed Item',
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPrice || item.price) || 0,
    total: (Number(item.quantity) || 1) * (Number(item.unitPrice || item.price) || 0),
  }));

  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const deliveryFee = Number(data.deliveryFee) || (data.orderType === 'DELIVERY' ? 3.50 : 0);
  const discount = Number(data.discount) || 0;
  const total = subtotal + deliveryFee - discount;

  return {
    id: generatedId,
    orderNumber: String(data.orderNumber || generatedId.replace('ORD-', '')),
    customerName: data.customerName || 'Guest Customer',
    phone: data.phone || data.customerPhone || 'N/A',
    address: data.address || data.deliveryAddress || 'Pickup',
    orderType: data.orderType || 'DELIVERY',
    items,
    subtotal,
    deliveryFee,
    discount,
    total,
    notes: data.notes || '',
    status: ORDER_STATUSES.NEW,
    createdAt: new Date().toISOString(),
  };
}

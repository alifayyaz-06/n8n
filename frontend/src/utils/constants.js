/**
 * Restaurant Order Management - App Constants
 */

export const ORDER_STATUS = {
  NEW: 'New',
  PENDING: 'New',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export const ORDER_TYPES = {
  ALL: 'ALL',
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
  DINE_IN: 'DINE_IN',
};

export const REJECTION_REASONS = [
  'Item Out of Stock',
  'Restaurant Too Busy',
  'Kitchen Closing Soon',
  'Special Request Cannot Be Fulfilled',
  'Outside Delivery Range',
  'Other',
];

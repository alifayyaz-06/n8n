/**
 * Comprehensive Mock Order Dataset for Restaurant Owner Portal
 */

import { ORDER_STATUS, ORDER_TYPES } from '../utils/constants';

const now = new Date();
const minutesAgo = (mins) => new Date(now.getTime() - mins * 60000).toISOString();
const daysAgo = (days, hours = 0) => new Date(now.getTime() - (days * 24 * 3600 + hours * 3600) * 1000).toISOString();

export const initialOrders = [
  {
    id: 'ORD-1001',
    customerName: 'Sarah Jenkins',
    customerPhone: '+1 (555) 234-5678',
    customerEmail: 'sarah.j@example.com',
    orderType: ORDER_TYPES.DELIVERY,
    deliveryAddress: '742 Evergreen Terrace, Apt 4B',
    orderTime: minutesAgo(8),
    status: ORDER_STATUS.NEW,
    totalAmount: 38.50,
    paymentMethod: 'Credit Card (Paid)',
    items: [
      { id: 'i1', name: 'Truffle Mushroom Burger', quantity: 2, price: 14.00 },
      { id: 'i2', name: 'Crispy Sweet Potato Fries', quantity: 1, price: 5.50 },
      { id: 'i3', name: 'Craft Lemonade', quantity: 2, price: 2.50 },
    ],
    notes: 'Please ring doorbell upon arrival and hold pickles on one burger.',
  },
  {
    id: 'ORD-1002',
    customerName: 'Marcus Chen',
    customerPhone: '+1 (555) 876-5432',
    customerEmail: 'm.chen@example.com',
    orderType: ORDER_TYPES.PICKUP,
    deliveryAddress: null,
    orderTime: minutesAgo(15),
    status: ORDER_STATUS.PENDING,
    totalAmount: 52.00,
    paymentMethod: 'Pay at Counter',
    items: [
      { id: 'i4', name: 'Margherita Pizza 14"', quantity: 1, price: 18.00 },
      { id: 'i5', name: 'Pepperoni Pizza 14"', quantity: 1, price: 20.00 },
      { id: 'i6', name: 'Garlic Knots (6pcs)', quantity: 2, price: 7.00 },
    ],
    notes: 'Extra parmesan cheese on the side.',
  },
  {
    id: 'ORD-1003',
    customerName: 'Emily Watson',
    customerPhone: '+1 (555) 432-1098',
    customerEmail: 'emily.w@example.com',
    orderType: ORDER_TYPES.DELIVERY,
    deliveryAddress: '104 Pine Street, Floor 2',
    orderTime: minutesAgo(28),
    status: ORDER_STATUS.ACCEPTED,
    totalAmount: 44.75,
    paymentMethod: 'Apple Pay (Paid)',
    items: [
      { id: 'i7', name: 'Grilled Salmon Bowl', quantity: 2, price: 18.50 },
      { id: 'i8', name: 'Matcha Iced Tea', quantity: 2, price: 3.87 },
    ],
    notes: 'Dressing on the side please.',
  },
  {
    id: 'ORD-1004',
    customerName: 'Robert Vance',
    customerPhone: '+1 (555) 901-2345',
    customerEmail: 'rvance@example.com',
    orderType: ORDER_TYPES.DINE_IN,
    tableNumber: 'Table 6',
    orderTime: minutesAgo(40),
    status: ORDER_STATUS.PREPARING,
    totalAmount: 68.00,
    paymentMethod: 'Credit Card (Paid)',
    items: [
      { id: 'i9', name: 'Ribeye Steak 12oz', quantity: 1, price: 34.00 },
      { id: 'i10', name: 'Caesar Salad', quantity: 1, price: 12.00 },
      { id: 'i11', name: 'Cabernet Sauvignon Glass', quantity: 2, price: 11.00 },
    ],
    notes: 'Medium rare for the steak.',
  },
  {
    id: 'ORD-1005',
    customerName: 'Jessica Taylor',
    customerPhone: '+1 (555) 678-9012',
    customerEmail: 'jess.t@example.com',
    orderType: ORDER_TYPES.PICKUP,
    orderTime: minutesAgo(55),
    status: ORDER_STATUS.READY,
    totalAmount: 29.50,
    paymentMethod: 'Online Payment',
    items: [
      { id: 'i12', name: 'Avocado Toast with Eggs', quantity: 2, price: 12.50 },
      { id: 'i13', name: 'Fresh Orange Juice', quantity: 1, price: 4.50 },
    ],
    notes: 'Estimated pickup at 12:45 PM.',
  },
  {
    id: 'ORD-1006',
    customerName: 'David Miller',
    customerPhone: '+1 (555) 345-6789',
    customerEmail: 'dmiller@example.com',
    orderType: ORDER_TYPES.DELIVERY,
    deliveryAddress: '512 Oak Avenue',
    orderTime: daysAgo(0, 2), // 2 hours ago
    status: ORDER_STATUS.COMPLETED,
    totalAmount: 62.00,
    paymentMethod: 'Credit Card (Paid)',
    items: [
      { id: 'i14', name: 'BBQ Pulled Pork Platter', quantity: 2, price: 22.00 },
      { id: 'i15', name: 'Macaroni & Cheese Side', quantity: 2, price: 6.00 },
      { id: 'i16', name: 'Coleslaw', quantity: 2, price: 3.00 },
    ],
    notes: 'Delivered successfully.',
  },
  {
    id: 'ORD-1007',
    customerName: 'Alex Rivera',
    customerPhone: '+1 (555) 789-0123',
    customerEmail: 'arivera@example.com',
    orderType: ORDER_TYPES.DELIVERY,
    deliveryAddress: '88 West End Ave',
    orderTime: daysAgo(1, 3), // Yesterday
    status: ORDER_STATUS.REJECTED,
    rejectionReason: 'Item Out of Stock',
    totalAmount: 31.00,
    paymentMethod: 'Refunded to Card',
    items: [
      { id: 'i17', name: 'Seafood Paella Special', quantity: 1, price: 31.00 },
    ],
    notes: 'Customer notified of cancellation.',
  },
  {
    id: 'ORD-1008',
    customerName: 'Sophia Martinez',
    customerPhone: '+1 (555) 567-8901',
    customerEmail: 'sophia.m@example.com',
    orderType: ORDER_TYPES.PICKUP,
    orderTime: daysAgo(1, 5),
    status: ORDER_STATUS.COMPLETED,
    totalAmount: 26.50,
    paymentMethod: 'Pay at Counter',
    items: [
      { id: 'i18', name: 'Chicken Tikka Masala', quantity: 1, price: 18.50 },
      { id: 'i19', name: 'Garlic Naan', quantity: 2, price: 4.00 },
    ],
    notes: 'Extra spicy please.',
  },
];

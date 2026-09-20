/**
 * Prisma Database Seed Script for PostgreSQL
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const mockSeedOrders = [
  {
    id: 'ORD-1001',
    orderNumber: '1001',
    customerName: 'Sarah Jenkins',
    phone: '+1 (555) 234-5678',
    address: '742 Evergreen Terrace, Apt 4B',
    orderType: 'DELIVERY',
    subtotal: 38.50,
    deliveryFee: 3.50,
    discount: 0.00,
    total: 42.00,
    notes: 'Please ring doorbell upon arrival and hold pickles on one burger.',
    status: 'New',
    items: {
      create: [
        { productName: 'Truffle Mushroom Burger', quantity: 2, unitPrice: 14.00, total: 28.00 },
        { productName: 'Crispy Sweet Potato Fries', quantity: 1, unitPrice: 5.50, total: 5.50 },
        { productName: 'Craft Lemonade', quantity: 2, unitPrice: 2.50, total: 5.00 },
      ],
    },
  },
  {
    id: 'ORD-1002',
    orderNumber: '1002',
    customerName: 'Marcus Chen',
    phone: '+1 (555) 876-5432',
    address: 'Takeout / Self Pickup at Counter',
    orderType: 'PICKUP',
    subtotal: 52.00,
    deliveryFee: 0.00,
    discount: 5.00,
    total: 47.00,
    notes: 'Extra parmesan cheese on the side.',
    status: 'Accepted',
    items: {
      create: [
        { productName: 'Margherita Pizza 14"', quantity: 1, unitPrice: 18.00, total: 18.00 },
        { productName: 'Pepperoni Pizza 14"', quantity: 1, unitPrice: 20.00, total: 20.00 },
        { productName: 'Garlic Knots (6pcs)', quantity: 2, unitPrice: 7.00, total: 14.00 },
      ],
    },
  },
  {
    id: 'ORD-1003',
    orderNumber: '1003',
    customerName: 'Robert Vance',
    phone: '+1 (555) 901-2345',
    address: 'Table 6 (Dine-In)',
    orderType: 'DINE_IN',
    subtotal: 68.00,
    deliveryFee: 0.00,
    discount: 0.00,
    total: 68.00,
    notes: 'Medium rare for the steak.',
    status: 'Preparing',
    items: {
      create: [
        { productName: 'Ribeye Steak 12oz', quantity: 1, unitPrice: 34.00, total: 34.00 },
        { productName: 'Caesar Salad', quantity: 1, unitPrice: 12.00, total: 12.00 },
        { productName: 'Cabernet Sauvignon Glass', quantity: 2, unitPrice: 11.00, total: 22.00 },
      ],
    },
  },
  {
    id: 'ORD-1004',
    orderNumber: '1004',
    customerName: 'Jessica Taylor',
    phone: '+1 (555) 678-9012',
    address: 'Takeout / Self Pickup at Counter',
    orderType: 'PICKUP',
    subtotal: 29.50,
    deliveryFee: 0.00,
    discount: 0.00,
    total: 29.50,
    notes: 'Estimated pickup at 12:45 PM.',
    status: 'Ready',
    items: {
      create: [
        { productName: 'Avocado Toast with Eggs', quantity: 2, unitPrice: 12.50, total: 25.00 },
        { productName: 'Fresh Orange Juice', quantity: 1, unitPrice: 4.50, total: 4.50 },
      ],
    },
  },
  {
    id: 'ORD-1005',
    orderNumber: '1005',
    customerName: 'David Miller',
    phone: '+1 (555) 345-6789',
    address: '512 Oak Avenue',
    orderType: 'DELIVERY',
    subtotal: 56.00,
    deliveryFee: 3.50,
    discount: 0.00,
    total: 59.50,
    notes: 'Delivered successfully.',
    status: 'Completed',
    items: {
      create: [
        { productName: 'BBQ Pulled Pork Platter', quantity: 2, unitPrice: 22.00, total: 44.00 },
        { productName: 'Macaroni & Cheese Side', quantity: 2, unitPrice: 6.00, total: 12.00 },
      ],
    },
  },
  {
    id: 'ORD-1006',
    orderNumber: '1006',
    customerName: 'Alex Rivera',
    phone: '+1 (555) 789-0123',
    address: '88 West End Ave',
    orderType: 'DELIVERY',
    subtotal: 31.00,
    deliveryFee: 3.50,
    discount: 0.00,
    total: 34.50,
    notes: 'Customer notified of cancellation.',
    status: 'Rejected',
    rejectionReason: 'Item Out of Stock',
    items: {
      create: [
        { productName: 'Seafood Paella Special', quantity: 1, unitPrice: 31.00, total: 31.00 },
      ],
    },
  },
];

async function main() {
  console.log('🌱 Starting PostgreSQL database seeding...');

  // Delete existing records
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});

  for (const seedOrder of mockSeedOrders) {
    const created = await prisma.order.create({
      data: seedOrder,
      include: { items: true },
    });
    console.log(` Created order ${created.id} [${created.status}] with ${created.items.length} items`);
  }

  console.log('✅ PostgreSQL database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Supabase Multi-Tenant Seed Script
 */

import { supabase } from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const RESTAURANT_A_ID = 'r0000000-0000-0000-0000-000000000001';
const RESTAURANT_B_ID = 'r0000000-0000-0000-0000-000000000002';

const mockRestaurants = [
  {
    id: RESTAURANT_A_ID,
    name: 'Gourmet Bistro',
    email: 'admin@gourmet.com',
    phone: '04235551111',
    address: 'Gulberg III, Main Boulevard, Lahore',
  },
  {
    id: RESTAURANT_B_ID,
    name: 'Lahore Grill',
    email: 'admin@lahoregrill.com',
    phone: '04237772222',
    address: 'DHA Phase 5, Commercial Area, Lahore',
  },
];

const mockRiders = [
  {
    id: 'RIDER-101',
    restaurant_id: RESTAURANT_A_ID,
    name: 'Tariq Mahmood',
    phone: '03001234567',
    status: 'Active',
    vehicle: 'Honda CG 125',
  },
  {
    id: 'RIDER-102',
    restaurant_id: RESTAURANT_A_ID,
    name: 'Zubair Khan',
    phone: '03219876543',
    status: 'Active',
    vehicle: 'Yamaha YBR 125',
  },
  {
    id: 'RIDER-201',
    restaurant_id: RESTAURANT_B_ID,
    name: 'Hamza Malik',
    phone: '03451112233',
    status: 'Active',
    vehicle: 'Suzuki GS 150',
  },
];

const mockOrders = [
  {
    id: 'ORD-1001',
    restaurant_id: RESTAURANT_A_ID,
    order_number: '1001',
    customer_name: 'Sarah Jenkins (Gourmet)',
    phone: '03001234567',
    address: 'Gulberg III, Block B, House 42, Lahore',
    order_type: 'DELIVERY',
    subtotal: 1500.00,
    delivery_fee: 150.00,
    discount: 0.00,
    total: 1650.00,
    notes: 'Gourmet Bistro Customer - ring doorbell.',
    status: 'New',
    rider_id: null,
    rider_name: null,
    rider_settled: false,
    items: [
      { product_name: 'Zinger Burger Special', quantity: 2, unit_price: 600.00, total: 1200.00 },
      { product_name: 'Fries Large', quantity: 1, unit_price: 300.00, total: 300.00 },
    ],
  },
  {
    id: 'ORD-1002',
    restaurant_id: RESTAURANT_A_ID,
    order_number: '1002',
    customer_name: 'Marcus Chen (Gourmet)',
    phone: '03219876543',
    address: 'DHA Phase 5, Sector CCA, Lahore',
    order_type: 'DELIVERY',
    subtotal: 2200.00,
    delivery_fee: 200.00,
    discount: 100.00,
    total: 2300.00,
    notes: 'Extra sauce on the side.',
    status: 'Accepted',
    rider_id: 'RIDER-101',
    rider_name: 'Tariq Mahmood',
    rider_settled: false,
    items: [
      { product_name: 'Chicken Karahi (Half)', quantity: 1, unit_price: 1400.00, total: 1400.00 },
      { product_name: 'Roti (Naan)', quantity: 4, unit_price: 50.00, total: 200.00 },
      { product_name: 'Cold Drink 1.5L', quantity: 2, unit_price: 300.00, total: 600.00 },
    ],
  },
  {
    id: 'ORD-2001',
    restaurant_id: RESTAURANT_B_ID,
    order_number: '2001',
    customer_name: 'Usman Ali (Lahore Grill)',
    phone: '03339998877',
    address: 'Johar Town, Phase 2, Lahore',
    order_type: 'DELIVERY',
    subtotal: 4500.00,
    delivery_fee: 250.00,
    discount: 0.00,
    total: 4750.00,
    notes: 'Lahore Grill Customer - Mutton Sajji Order.',
    status: 'Preparing',
    rider_id: 'RIDER-201',
    rider_name: 'Hamza Malik',
    rider_settled: false,
    items: [
      { product_name: 'Special Mutton Sajji Whole', quantity: 1, unit_price: 3800.00, total: 3800.00 },
      { product_name: 'Kandhari Naan', quantity: 5, unit_price: 140.00, total: 700.00 },
    ],
  },
];

async function seedMultiTenantData() {
  console.log('🌱 Starting Multi-Tenant Supabase seed process...');

  try {
    // 1. Seed Restaurants
    const { error: restErr } = await supabase.from('restaurants').upsert(mockRestaurants);
    if (restErr) console.warn('⚠️ Restaurants seed notice:', restErr.message);
    else console.log('✅ Multi-tenant restaurants seeded.');

    // 2. Seed Riders
    const { error: riderErr } = await supabase.from('riders').upsert(mockRiders);
    if (riderErr) console.warn('⚠️ Riders seed notice:', riderErr.message);
    else console.log('✅ Multi-tenant riders seeded.');

    // 3. Seed Orders
    for (const seedOrder of mockOrders) {
      const { items, ...orderData } = seedOrder;
      const { data: createdOrder, error: orderErr } = await supabase
        .from('orders')
        .upsert(orderData)
        .select()
        .single();

      if (orderErr) continue;

      await supabase.from('order_items').delete().eq('order_id', createdOrder.id);
      const itemsToInsert = items.map((item) => ({
        order_id: createdOrder.id,
        ...item,
      }));
      await supabase.from('order_items').insert(itemsToInsert);
    }

    console.log('🎉 Multi-tenant database seeding complete!');
  } catch (err) {
    console.error('❌ Exception during seed process:', err.message);
  }
}

seedMultiTenantData();

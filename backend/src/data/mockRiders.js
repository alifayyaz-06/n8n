/**
 * Mock Riders Dataset for Restaurant Delivery System
 */

export const mockRiders = [
  {
    id: 'RIDER-1',
    name: 'Tariq Mahmood',
    phone: '03001234567',
    status: 'Active',
    vehicle: 'Honda CG 125',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RIDER-2',
    name: 'Zubair Khan',
    phone: '03219876543',
    status: 'Active',
    vehicle: 'Yamaha YBR 125',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'RIDER-3',
    name: 'Ali Raza',
    phone: '03455551212',
    status: 'Active',
    vehicle: 'Honda CD 70',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

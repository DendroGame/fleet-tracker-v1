/**
 * Fleet Tracker v1.0 — Data Layer
 * localStorage persistence + sample seed data
 */

const STORAGE_KEY = 'fleet-tracker-v1';

const DEFAULT_DATA = {
  version: '1.0.0',
  currentAssetId: null,
  assets: [
    {
      id: 'v1',
      type: 'vehicle',
      unitNumber: 'UNIT-101',
      year: 2021,
      make: 'Ford',
      model: 'F-150',
      plate: 'ABC-1234',
      vin: '1FTFW1E85MFA12345',
      odometer: 48250,
      hours: null,
      status: 'in-service',
      notes: 'Primary work truck',
      purchaseDate: '2021-06-15',
      purchaseCost: 38500
    },
    {
      id: 'v2',
      type: 'vehicle',
      unitNumber: 'UNIT-205',
      year: 2019,
      make: 'Chevrolet',
      model: 'Silverado 2500',
      plate: 'XYZ-9876',
      vin: '',
      odometer: 87400,
      hours: null,
      status: 'in-service',
      notes: '',
      purchaseDate: '2019-03-01',
      purchaseCost: 42000
    },
    {
      id: 'm1',
      type: 'machine',
      unitNumber: 'EXC-01',
      year: 2018,
      make: 'Caterpillar',
      model: '320 GC',
      plate: '',
      vin: '',
      odometer: null,
      hours: 3420,
      status: 'in-service',
      notes: 'Tracked by engine hours',
      purchaseDate: '2018-11-20',
      purchaseCost: 165000
    },
    {
      id: 't1',
      type: 'trailer',
      unitNumber: 'TRL-12',
      year: 2020,
      make: 'Big Tex',
      model: '22GN',
      plate: 'TRL-4411',
      vin: '',
      odometer: 18500,
      hours: null,
      status: 'in-service',
      notes: 'Gooseneck trailer',
      purchaseDate: '2020-08-10',
      purchaseCost: 12500
    }
  ],
  serviceRecords: [
    {
      id: 's1',
      assetId: 'v1',
      type: 'service',
      date: '2025-09-12',
      odometer: 47800,
      hours: null,
      description: 'Oil change + filter',
      cost: 78.50,
      notes: '5W-30 synthetic',
      photo: null
    },
    {
      id: 's2',
      assetId: 'v1',
      type: 'repair',
      date: '2025-07-22',
      odometer: 46100,
      hours: null,
      description: 'Replaced front brake pads',
      cost: 245.00,
      notes: 'OEM pads',
      photo: null
    },
    {
      id: 's3',
      assetId: 'v2',
      type: 'service',
      date: '2025-08-05',
      odometer: 86200,
      hours: null,
      description: 'Tire rotation + alignment',
      cost: 120.00,
      notes: '',
      photo: null
    },
    {
      id: 's4',
      assetId: 'm1',
      type: 'service',
      date: '2025-06-18',
      odometer: null,
      hours: 3200,
      description: 'Hydraulic fluid service',
      cost: 480.00,
      notes: '',
      photo: null
    }
  ],
  fuelRecords: [
    {
      id: 'f1',
      assetId: 'v1',
      date: '2025-10-01',
      odometer: 48250,
      gallons: 18.4,
      pricePerGallon: 3.49,
      totalCost: 64.22,
      fuelType: 'Regular',
      isFull: true,
      notes: ''
    },
    {
      id: 'f2',
      assetId: 'v1',
      date: '2025-09-20',
      odometer: 47980,
      gallons: 16.8,
      pricePerGallon: 3.55,
      totalCost: 59.64,
      fuelType: 'Regular',
      isFull: true,
      notes: ''
    },
    {
      id: 'f3',
      assetId: 'v2',
      date: '2025-09-28',
      odometer: 87400,
      gallons: 28.2,
      pricePerGallon: 3.62,
      totalCost: 102.08,
      fuelType: 'Diesel',
      isFull: true,
      notes: ''
    }
  ],
  supplies: [
    { id: 'sup1', name: 'Oil Filter (FL-910S)', quantity: 12, minQty: 4, unit: 'ea', location: 'Shelf A1', cost: 8.50 },
    { id: 'sup2', name: '5W-30 Synthetic Oil', quantity: 24, minQty: 8, unit: 'qt', location: 'Shelf A2', cost: 7.25 },
    { id: 'sup3', name: 'Wiper Blades 22"', quantity: 3, minQty: 4, unit: 'ea', location: 'Bin B3', cost: 14.00 },
    { id: 'sup4', name: 'Grease Tubes', quantity: 18, minQty: 6, unit: 'tube', location: 'Shelf C1', cost: 4.75 }
  ],
  tools: [
    { id: 'tl1', name: 'Impact Wrench 1/2"', serial: 'IW-4401', location: 'Truck UNIT-101', assignedTo: 'John', purchaseDate: '2023-04-12', cost: 189 },
    { id: 'tl2', name: 'Torque Wrench 3/8"', serial: 'TW-2209', location: 'Shop', assignedTo: '', purchaseDate: '2022-11-03', cost: 95 },
    { id: 'tl3', name: 'Diagnostic Scanner', serial: 'DS-778', location: 'Office', assignedTo: 'Mike', purchaseDate: '2024-01-20', cost: 650 }
  ],
  reminders: [
    {
      id: 'r1',
      assetId: 'v1',
      title: 'Oil Change',
      dueDate: '2025-12-12',
      dueOdometer: 52800,
      dueHours: null,
      urgency: 'normal',
      completed: false,
      notes: 'Every 5,000 miles or 6 months'
    },
    {
      id: 'r2',
      assetId: 'v1',
      title: 'Tire Rotation',
      dueDate: '2025-11-15',
      dueOdometer: 51000,
      dueHours: null,
      urgency: 'soon',
      completed: false,
      notes: ''
    },
    {
      id: 'r3',
      assetId: 'm1',
      title: 'Engine Oil Service',
      dueDate: null,
      dueOdometer: null,
      dueHours: 3500,
      urgency: 'soon',
      completed: false,
      notes: 'Every 250 hours'
    },
    {
      id: 'r4',
      assetId: 't1',
      title: 'Brake Inspection',
      dueDate: '2025-10-01',
      dueOdometer: null,
      dueHours: null,
      urgency: 'overdue',
      completed: false,
      notes: 'Annual required'
    }
  ],
  inspections: [
    {
      id: 'ins1',
      assetId: 't1',
      date: '2025-09-15',
      template: 'Trailer Pre-Trip',
      items: [
        { name: 'Lighting (all)', status: 'pass' },
        { name: 'Brakes', status: 'pass' },
        { name: 'Tires / Pressure', status: 'pass' },
        { name: 'Coupler / Safety Chains', status: 'pass' },
        { name: 'Fluid Levels', status: 'n/a' }
      ],
      overallStatus: 'pass',
      notes: 'All good'
    }
  ]
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = structuredClone(DEFAULT_DATA);
      seed.currentAssetId = seed.assets[0].id;
      saveData(seed);
      return seed;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load data', e);
    return structuredClone(DEFAULT_DATA);
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function getAsset(data, id) {
  return data.assets.find(a => a.id === id) || null;
}

function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
}

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n || 0);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0,0,0,0);
  d.setHours(0,0,0,0);
  return Math.ceil((d - today) / 86400000);
}

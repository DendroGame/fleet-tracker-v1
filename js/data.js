const API_BASE = 'https://fleet-tracker-backend-api.jonathans-lubelogger-api.workers.dev';

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = sessionStorage.getItem('ft_token');
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  return res.json();
}

function generateId(prefix = 'id') {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function formatCurrency(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);
}
function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n || 0);
}
function normAsset(a) {
  return { id: a.id, type: a.type, unitNumber: a.unit_number, year: a.year, make: a.make, model: a.model, plate: a.plate || '', vin: a.vin || '', odometer: a.odometer, hours: a.hours, status: a.status || 'in-service', notes: a.notes || '', purchaseDate: a.purchase_date, purchaseCost: a.purchase_cost };
}
function normService(r) {
  return { id: r.id, assetId: r.asset_id, type: r.type, date: r.date, odometer: r.odometer, hours: r.hours, description: r.description, cost: r.cost || 0, notes: r.notes || '', photo: r.photo_key || null };
}
function normFuel(r) {
  return { id: r.id, assetId: r.asset_id, date: r.date, odometer: r.odometer, gallons: r.gallons, pricePerGallon: r.price_per_gallon, totalCost: r.total_cost, fuelType: r.fuel_type, isFull: !!r.is_full, notes: r.notes || '' };
}
function normReminder(r) {
  return { id: r.id, assetId: r.asset_id, title: r.title, dueDate: r.due_date, dueOdometer: r.due_odometer, dueHours: r.due_hours, urgency: r.urgency || 'normal', completed: !!r.completed, notes: r.notes || '' };
}
function normSupply(s) {
  return { id: s.id, name: s.name, quantity: s.quantity || 0, minQty: s.min_qty || 0, unit: s.unit || 'ea', location: s.location || '', cost: s.cost || 0 };
}
function normTool(t) {
  return { id: t.id, name: t.name, serial: t.serial || '', location: t.location || '', assignedTo: t.assigned_to || '', cost: t.cost || 0, purchaseDate: t.purchase_date };
}
function normInspection(r) {
  return { id: r.id, assetId: r.asset_id, date: r.date, template: r.template || 'Inspection', result: r.result || 'PASS', notes: r.notes || '' };
}
async function loadAllData() {
  const [assets, serviceRecords, fuelRecords, reminders, supplies, tools, inspections] = await Promise.all([
    api('/api/assets').then(rows => rows.map(normAsset)),
    api('/api/service').then(rows => rows.map(normService)),
    api('/api/fuel').then(rows => rows.map(normFuel)),
    api('/api/reminders').then(rows => rows.map(normReminder)),
    api('/api/supplies').then(rows => rows.map(normSupply)),
    api('/api/tools').then(rows => rows.map(normTool)),
    api('/api/inspections').then(rows => (rows || []).map(normInspection)).catch(() => [])
  ]);
  return { version: '1.3.0', currentAssetId: assets[0]?.id || null, assets, serviceRecords, fuelRecords, reminders, supplies, tools, inspections };
}
async function createAsset(obj) {
  return api('/api/assets', { method: 'POST', body: JSON.stringify({ type: obj.type, unit_number: obj.unitNumber, year: obj.year, make: obj.make, model: obj.model, plate: obj.plate, vin: obj.vin, odometer: obj.odometer, hours: obj.hours, status: obj.status, notes: obj.notes }) });
}
async function createService(obj) {
  return api('/api/service', { method: 'POST', body: JSON.stringify({ asset_id: obj.assetId, type: obj.type, date: obj.date, odometer: obj.odometer, hours: obj.hours, description: obj.description, cost: obj.cost, notes: obj.notes, photo_key: obj.photo || null }) });
}
async function createFuel(obj) {
  return api('/api/fuel', { method: 'POST', body: JSON.stringify({ asset_id: obj.assetId, date: obj.date, odometer: obj.odometer, gallons: obj.gallons, price_per_gallon: obj.pricePerGallon, total_cost: obj.totalCost, fuel_type: obj.fuelType, is_full: obj.isFull, notes: obj.notes }) });
}
async function createReminder(obj) {
  return api('/api/reminders', { method: 'POST', body: JSON.stringify({ asset_id: obj.assetId, title: obj.title, due_date: obj.dueDate, due_odometer: obj.dueOdometer, due_hours: obj.dueHours, urgency: obj.urgency, completed: obj.completed, notes: obj.notes }) });
}
async function createSupply(obj) {
  return api('/api/supplies', { method: 'POST', body: JSON.stringify({ name: obj.name, quantity: obj.quantity, min_qty: obj.minQty, unit: obj.unit, location: obj.location, cost: obj.cost }) });
}
async function createTool(obj) {
  return api('/api/tools', { method: 'POST', body: JSON.stringify({ name: obj.name, serial: obj.serial, location: obj.location, assigned_to: obj.assignedTo, cost: obj.cost, purchase_date: obj.purchaseDate }) });
}
function getAsset(data, id) { return data.assets.find(a => a.id === id) || null; }

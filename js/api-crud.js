/**
 * Fleet Tracker v1.2 — extra API helpers
 * PUT / DELETE / inspections / photo upload
 */

async function updateAsset(id, obj) {
  return api('/api/assets/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      type: obj.type,
      unit_number: obj.unitNumber,
      year: obj.year,
      make: obj.make,
      model: obj.model,
      plate: obj.plate,
      vin: obj.vin,
      odometer: obj.odometer,
      hours: obj.hours,
      status: obj.status,
      notes: obj.notes
    })
  });
}

async function deleteAssetApi(id) {
  return api('/api/assets/' + id, { method: 'DELETE' });
}

async function updateService(id, obj) {
  return api('/api/service/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      asset_id: obj.assetId,
      type: obj.type,
      date: obj.date,
      odometer: obj.odometer,
      hours: obj.hours,
      description: obj.description,
      cost: obj.cost,
      notes: obj.notes,
      photo_key: obj.photo || null
    })
  });
}

async function deleteServiceApi(id) {
  return api('/api/service/' + id, { method: 'DELETE' });
}

async function updateFuel(id, obj) {
  return api('/api/fuel/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      asset_id: obj.assetId,
      date: obj.date,
      odometer: obj.odometer,
      gallons: obj.gallons,
      price_per_gallon: obj.pricePerGallon,
      total_cost: obj.totalCost,
      fuel_type: obj.fuelType,
      is_full: obj.isFull,
      notes: obj.notes
    })
  });
}

async function deleteFuelApi(id) {
  return api('/api/fuel/' + id, { method: 'DELETE' });
}

async function updateReminder(id, obj) {
  return api('/api/reminders/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      asset_id: obj.assetId,
      title: obj.title,
      due_date: obj.dueDate,
      due_odometer: obj.dueOdometer,
      due_hours: obj.dueHours,
      urgency: obj.urgency,
      completed: obj.completed,
      notes: obj.notes
    })
  });
}

async function deleteReminderApi(id) {
  return api('/api/reminders/' + id, { method: 'DELETE' });
}

async function updateSupply(id, obj) {
  return api('/api/supplies/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      name: obj.name,
      quantity: obj.quantity,
      min_qty: obj.minQty,
      unit: obj.unit,
      location: obj.location,
      cost: obj.cost
    })
  });
}

async function deleteSupplyApi(id) {
  return api('/api/supplies/' + id, { method: 'DELETE' });
}

async function updateTool(id, obj) {
  return api('/api/tools/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      name: obj.name,
      serial: obj.serial,
      location: obj.location,
      assigned_to: obj.assignedTo,
      cost: obj.cost,
      purchase_date: obj.purchaseDate
    })
  });
}

async function deleteToolApi(id) {
  return api('/api/tools/' + id, { method: 'DELETE' });
}

function normInspection(r) {
  return {
    id: r.id,
    assetId: r.asset_id,
    date: r.date,
    template: r.template || 'Inspection',
    result: r.result || 'PASS',
    notes: r.notes || ''
  };
}

async function createInspection(obj) {
  return api('/api/inspections', {
    method: 'POST',
    body: JSON.stringify({
      asset_id: obj.assetId,
      date: obj.date,
      template: obj.template,
      result: obj.result,
      notes: obj.notes
    })
  });
}

async function deleteInspectionApi(id) {
  return api('/api/inspections/' + id, { method: 'DELETE' });
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadPhoto(file) {
  if (!file) return null;
  const data = await fileToBase64(file);
  const res = await api('/api/photos', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'image/jpeg',
      data
    })
  });
  return res.key || null;
}

function photoUrl(key) {
  if (!key) return '';
  return API_BASE + '/api/photos/' + encodeURIComponent(key);
}

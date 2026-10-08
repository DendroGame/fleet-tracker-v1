function renderService(el) {
  const asset = currentAsset();
  const records = state.serviceRecords
    .filter(r => !asset || r.assetId === asset.id)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  el.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <p class="text-sm text-slate-400">${records.length} service records</p>
      <button class="btn-primary" onclick="openServiceForm()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Service
      </button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Date</th><th>Type</th><th>Description</th><th>Odo / Hrs</th><th>Cost</th><th></th></tr>
        </thead>
        <tbody>
          ${records.length === 0 ? `<tr><td colspan="6" class="text-center text-slate-500 py-8">No service records</td></tr>` :
            records.map(r => `
              <tr>
                <td>${r.date || '—'}</td>
                <td><span class="status-badge status-healthy">${r.type || 'Service'}</span></td>
                <td class="max-w-[200px] truncate">${r.description || '—'}</td>
                <td class="text-slate-400 text-xs">${r.odometer ? formatNumber(r.odometer)+' mi' : ''} ${r.hours ? formatNumber(r.hours)+' hrs' : ''}</td>
                <td>${formatCurrency(r.cost)}</td>
                <td>
                  <button class="text-slate-400 hover:text-white text-xs" onclick="openServiceForm('${r.id}')">Edit</button>
                  <button class="text-red-400 hover:text-red-300 text-xs ml-2" onclick="deleteService('${r.id}')">Del</button>
                </td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openServiceForm(id = null) {
  const r = id ? state.serviceRecords.find(x => x.id === id) : null;
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">${r ? 'Edit' : 'Add'} Service Record</h2>
      <form onsubmit="saveService(event, '${id||''}')" class="space-y-3">
        <div>
          <label class="form-label">Type *</label>
          <select name="type" class="form-select" required>
            ${['Oil Change','Repair','Tire','Brake','Inspection','Other'].map(t =>
              `<option value="${t}" ${r?.type===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Date *</label>
          <input name="date" type="date" class="form-input" required value="${r?.date || new Date().toISOString().slice(0,10)}">
        </div>
        <div>
          <label class="form-label">Description</label>
          <input name="description" class="form-input" value="${r?.description || ''}">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Odometer</label>
            <input name="odometer" type="number" class="form-input" value="${r?.odometer ?? ''}">
          </div>
          <div>
            <label class="form-label">Hours</label>
            <input name="hours" type="number" class="form-input" value="${r?.hours ?? ''}">
          </div>
        </div>
        <div>
          <label class="form-label">Cost ($)</label>
          <input name="cost" type="number" step="0.01" class="form-input" value="${r?.cost ?? ''}">
        </div>
        <div>
          <label class="form-label">Notes</label>
          <input name="notes" class="form-input" value="${r?.notes || ''}">
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  `);
}

async function saveService(e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {
    assetId: state.currentAssetId,
    type: fd.get('type'),
    date: fd.get('date'),
    description: fd.get('description'),
    odometer: fd.get('odometer') ? +fd.get('odometer') : null,
    hours: fd.get('hours') ? +fd.get('hours') : null,
    cost: +fd.get('cost') || 0,
    notes: fd.get('notes')
  };
  try {
    if (id) {
      const idx = state.serviceRecords.findIndex(x => x.id === id);
      state.serviceRecords[idx] = { ...state.serviceRecords[idx], ...obj };
      toast('Updated (local)');
    } else {
      const res = await createService(obj);
      obj.id = res.id;
      state.serviceRecords.push(obj);
      toast('Service saved to Cloudflare');
    }
    closeModal();
    showView('service');
  } catch (err) {
    toast('Error: ' + err.message, 'err');
  }
}

function deleteService(id) {
  if (!confirm('Delete this record?')) return;
  state.serviceRecords = state.serviceRecords.filter(r => r.id !== id);
  showView('service');
  toast('Removed from view');
}

function renderFuel(el) {
  const asset = currentAsset();
  const records = state.fuelRecords
    .filter(r => !asset || r.assetId === asset.id)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  el.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <p class="text-sm text-slate-400">${records.length} fuel logs</p>
      <button class="btn-primary" onclick="openFuelForm()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Fill-up
      </button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Date</th><th>Gallons</th><th>$/gal</th><th>Total</th><th>Odometer</th><th>Type</th><th></th></tr>
        </thead>
        <tbody>
          ${records.length === 0 ? `<tr><td colspan="7" class="text-center text-slate-500 py-8">No fuel logs</td></tr>` :
            records.map(r => `
              <tr>
                <td>${r.date || '—'}</td>
                <td>${r.gallons ?? '—'}</td>
                <td>${r.pricePerGallon != null ? '$'+Number(r.pricePerGallon).toFixed(2) : '—'}</td>
                <td>${formatCurrency(r.totalCost)}</td>
                <td>${r.odometer ? formatNumber(r.odometer) : '—'}</td>
                <td class="text-slate-400">${r.fuelType || '—'}</td>
                <td>
                  <button class="text-slate-400 hover:text-white text-xs" onclick="openFuelForm('${r.id}')">Edit</button>
                  <button class="text-red-400 hover:text-red-300 text-xs ml-2" onclick="deleteFuel('${r.id}')">Del</button>
                </td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openFuelForm(id = null) {
  const r = id ? state.fuelRecords.find(x => x.id === id) : null;
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">${r ? 'Edit' : 'Add'} Fuel Log</h2>
      <form onsubmit="saveFuel(event, '${id||''}')" class="space-y-3">
        <div>
          <label class="form-label">Date *</label>
          <input name="date" type="date" class="form-input" required value="${r?.date || new Date().toISOString().slice(0,10)}">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Gallons *</label>
            <input name="gallons" type="number" step="0.01" class="form-input" required value="${r?.gallons ?? ''}">
          </div>
          <div>
            <label class="form-label">Price / Gal ($)</label>
            <input name="pricePerGallon" type="number" step="0.001" class="form-input" value="${r?.pricePerGallon ?? ''}">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Total Cost ($)</label>
            <input name="totalCost" type="number" step="0.01" class="form-input" value="${r?.totalCost ?? ''}">
          </div>
          <div>
            <label class="form-label">Odometer</label>
            <input name="odometer" type="number" class="form-input" value="${r?.odometer ?? ''}">
          </div>
        </div>
        <div>
          <label class="form-label">Fuel Type</label>
          <select name="fuelType" class="form-select">
            ${['Diesel','Gasoline','DEF','Other'].map(t =>
              `<option value="${t}" ${r?.fuelType===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" name="isFull" id="isFull" ${r?.isFull ? 'checked' : ''}>
          <label for="isFull" class="text-sm">Full tank</label>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <input name="notes" class="form-input" value="${r?.notes || ''}">
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  `);
}

async function saveFuel(e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const gallons = +fd.get('gallons') || 0;
  const ppg = +fd.get('pricePerGallon') || 0;
  let total = +fd.get('totalCost') || 0;
  if (!total && gallons && ppg) total = gallons * ppg;
  const obj = {
    assetId: state.currentAssetId,
    date: fd.get('date'),
    gallons,
    pricePerGallon: ppg || null,
    totalCost: total,
    odometer: fd.get('odometer') ? +fd.get('odometer') : null,
    fuelType: fd.get('fuelType'),
    isFull: fd.get('isFull') === 'on',
    notes: fd.get('notes')
  };
  try {
    if (id) {
      const idx = state.fuelRecords.findIndex(x => x.id === id);
      state.fuelRecords[idx] = { ...state.fuelRecords[idx], ...obj };
      toast('Updated (local)');
    } else {
      const res = await createFuel(obj);
      obj.id = res.id;
      state.fuelRecords.push(obj);
      toast('Fuel saved to Cloudflare');
    }
    closeModal();
    showView('fuel');
  } catch (err) {
    toast('Error: ' + err.message, 'err');
  }
}

function deleteFuel(id) {
  if (!confirm('Delete this fuel log?')) return;
  state.fuelRecords = state.fuelRecords.filter(r => r.id !== id);
  showView('fuel');
  toast('Removed from view');
}

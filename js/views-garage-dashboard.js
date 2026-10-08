function renderGarage(el) {
  const typeIcon = { vehicle: '🚗', machine: '🏗️', trailer: '🚛' };
  el.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <p class="text-sm text-slate-400">${state.assets.length} assets in fleet</p>
      <button class="btn-primary" onclick="openAssetForm()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Asset
      </button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      ${state.assets.map(a => `
        <div class="card hover:border-brand-500/50 transition-colors cursor-pointer" onclick="switchAsset('${a.id}'); showView('dashboard')">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">${typeIcon[a.type] || '🚗'}</span>
              <div>
                <div class="font-semibold">${a.unitNumber}</div>
                <div class="text-xs text-slate-400">${a.year || ''} ${a.make || ''} ${a.model || ''}</div>
              </div>
            </div>
            <span class="status-badge ${
              a.status === 'out-of-service' ? 'status-oos' :
              a.status === 'due-soon' ? 'status-due' : 'status-healthy'
            }">${a.status === 'out-of-service' ? 'OOS' : a.status === 'due-soon' ? 'Due' : 'OK'}</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs text-slate-400">
            ${a.odometer != null ? `<div>Odo: <span class="text-slate-200">${formatNumber(a.odometer)}</span></div>` : ''}
            ${a.hours != null ? `<div>Hours: <span class="text-slate-200">${formatNumber(a.hours)}</span></div>` : ''}
            ${a.plate ? `<div>Plate: <span class="text-slate-200">${a.plate}</span></div>` : ''}
            <div class="capitalize">${a.type || 'vehicle'}</div>
          </div>
          <div class="mt-3 flex gap-2" onclick="event.stopPropagation()">
            <button class="btn-secondary text-xs flex-1" onclick="openAssetForm('${a.id}')">Edit</button>
            <button class="btn-danger text-xs" onclick="deleteAsset('${a.id}')">Del</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function openAssetForm(id = null) {
  const a = id ? state.assets.find(x => x.id === id) : null;
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">${a ? 'Edit' : 'Add'} Asset</h2>
      <form onsubmit="saveAsset(event, '${id||''}')" class="space-y-3">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Type *</label>
            <select name="type" class="form-select" required>
              ${['vehicle','machine','trailer'].map(t =>
                `<option value="${t}" ${a?.type===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="form-label">Unit # *</label>
            <input name="unitNumber" class="form-input" required value="${a?.unitNumber || ''}">
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="form-label">Year</label>
            <input name="year" type="number" class="form-input" value="${a?.year ?? ''}">
          </div>
          <div>
            <label class="form-label">Make</label>
            <input name="make" class="form-input" value="${a?.make || ''}">
          </div>
          <div>
            <label class="form-label">Model</label>
            <input name="model" class="form-input" value="${a?.model || ''}">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Plate</label>
            <input name="plate" class="form-input" value="${a?.plate || ''}">
          </div>
          <div>
            <label class="form-label">VIN</label>
            <input name="vin" class="form-input" value="${a?.vin || ''}">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Odometer</label>
            <input name="odometer" type="number" class="form-input" value="${a?.odometer ?? ''}">
          </div>
          <div>
            <label class="form-label">Hours</label>
            <input name="hours" type="number" class="form-input" value="${a?.hours ?? ''}">
          </div>
        </div>
        <div>
          <label class="form-label">Status</label>
          <select name="status" class="form-select">
            ${['in-service','due-soon','out-of-service'].map(s =>
              `<option value="${s}" ${a?.status===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <input name="notes" class="form-input" value="${a?.notes || ''}">
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  `);
}

async function saveAsset(e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {
    type: fd.get('type'),
    unitNumber: fd.get('unitNumber'),
    year: fd.get('year') ? +fd.get('year') : null,
    make: fd.get('make'),
    model: fd.get('model'),
    plate: fd.get('plate'),
    vin: fd.get('vin'),
    odometer: fd.get('odometer') ? +fd.get('odometer') : null,
    hours: fd.get('hours') ? +fd.get('hours') : null,
    status: fd.get('status'),
    notes: fd.get('notes')
  };
  try {
    if (id) {
      const idx = state.assets.findIndex(x => x.id === id);
      state.assets[idx] = { ...state.assets[idx], ...obj };
      toast('Updated (local)');
    } else {
      const res = await createAsset(obj);
      obj.id = res.id;
      state.assets.push(obj);
      if (!state.currentAssetId) state.currentAssetId = obj.id;
      toast('Asset saved to Cloudflare');
    }
    populateAssetSelect();
    closeModal();
    showView('garage');
  } catch (err) {
    toast('Error: ' + err.message, 'err');
  }
}

function deleteAsset(id) {
  if (!confirm('Delete this asset?')) return;
  state.assets = state.assets.filter(a => a.id !== id);
  if (state.currentAssetId === id) state.currentAssetId = state.assets[0]?.id || null;
  populateAssetSelect();
  showView('garage');
  toast('Removed from view');
}

function renderDashboard(el) {
  const a = currentAsset();
  if (!a) {
    el.innerHTML = `<div class="empty-state"><p>Select an asset from the Garage</p></div>`;
    return;
  }
  const svc = state.serviceRecords.filter(r => r.assetId === a.id);
  const fuel = state.fuelRecords.filter(r => r.assetId === a.id);
  const rems = state.reminders.filter(r => r.assetId === a.id && !r.completed);
  const totalSvc = svc.reduce((s,r) => s + (r.cost||0), 0);
  const totalFuel = fuel.reduce((s,r) => s + (r.totalCost||0), 0);

  el.innerHTML = `
    <div class="mb-6">
      <h2 class="text-xl font-semibold">${a.unitNumber}</h2>
      <p class="text-slate-400 text-sm">${a.year || ''} ${a.make || ''} ${a.model || ''} · ${a.type || ''}</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <div class="text-xs text-slate-500 uppercase">Status</div>
        <div class="mt-1 font-semibold capitalize">${(a.status||'in-service').replace(/-/g,' ')}</div>
      </div>
      <div class="card">
        <div class="text-xs text-slate-500 uppercase">Odometer</div>
        <div class="mt-1 font-semibold">${a.odometer != null ? formatNumber(a.odometer) : '—'}</div>
      </div>
      <div class="card">
        <div class="text-xs text-slate-500 uppercase">Hours</div>
        <div class="mt-1 font-semibold">${a.hours != null ? formatNumber(a.hours) : '—'}</div>
      </div>
      <div class="card">
        <div class="text-xs text-slate-500 uppercase">Open Reminders</div>
        <div class="mt-1 font-semibold">${rems.length}</div>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <div class="card">
        <div class="text-sm font-medium mb-2">Service spend</div>
        <div class="text-2xl font-bold text-brand-500">${formatCurrency(totalSvc)}</div>
        <div class="text-xs text-slate-500 mt-1">${svc.length} records</div>
      </div>
      <div class="card">
        <div class="text-sm font-medium mb-2">Fuel spend</div>
        <div class="text-2xl font-bold text-emerald-400">${formatCurrency(totalFuel)}</div>
        <div class="text-xs text-slate-500 mt-1">${fuel.length} fill-ups</div>
      </div>
    </div>
    <div class="card">
      <div class="text-sm font-medium mb-3">Recent service</div>
      ${svc.slice(0,5).length === 0 ? '<p class="text-slate-500 text-sm">No service records</p>' :
        svc.slice(0,5).map(r => `
          <div class="flex justify-between text-sm py-2 border-b border-slate-800 last:border-0">
            <span>${r.date} · ${r.type}</span>
            <span class="text-slate-400">${formatCurrency(r.cost)}</span>
          </div>
        `).join('')}
    </div>
  `;
}

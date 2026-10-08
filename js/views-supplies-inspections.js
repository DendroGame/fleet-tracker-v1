function renderSupplies(el) {
  el.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <p class="text-sm text-slate-400">${state.supplies.length} items in inventory</p>
      <button class="btn-primary" onclick="openSupplyForm()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Item
      </button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Item</th><th>Qty</th><th>Min</th><th>Location</th><th>Unit Cost</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          ${state.supplies.map(s => {
            const low = s.quantity <= s.minQty;
            return `
              <tr>
                <td class="font-medium">${s.name}</td>
                <td>${s.quantity} ${s.unit}</td>
                <td>${s.minQty}</td>
                <td>${s.location || '—'}</td>
                <td>${formatCurrency(s.cost)}</td>
                <td><span class="status-badge ${low ? 'status-due' : 'status-healthy'}">${low ? 'Low Stock' : 'OK'}</span></td>
                <td>
                  <button class="text-slate-400 hover:text-white text-xs" onclick="openSupplyForm('${s.id}')">Edit</button>
                  <button class="text-red-400 hover:text-red-300 text-xs ml-2" onclick="deleteSupply('${s.id}')">Del</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openSupplyForm(id = null) {
  const s = id ? state.supplies.find(x => x.id === id) : null;
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">${s ? 'Edit' : 'Add'} Supply Item</h2>
      <form onsubmit="saveSupply(event, '${id||''}')" class="space-y-3">
        <div>
          <label class="form-label">Name *</label>
          <input name="name" class="form-input" required value="${s?.name || ''}">
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="form-label">Quantity</label>
            <input name="quantity" type="number" class="form-input" value="${s?.quantity ?? 0}">
          </div>
          <div>
            <label class="form-label">Min Qty</label>
            <input name="minQty" type="number" class="form-input" value="${s?.minQty ?? 0}">
          </div>
          <div>
            <label class="form-label">Unit</label>
            <input name="unit" class="form-input" value="${s?.unit || 'ea'}">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Location</label>
            <input name="location" class="form-input" value="${s?.location || ''}">
          </div>
          <div>
            <label class="form-label">Unit Cost ($)</label>
            <input name="cost" type="number" step="0.01" class="form-input" value="${s?.cost ?? ''}">
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  `);
}

async function saveSupply(e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {
    name: fd.get('name'),
    quantity: +fd.get('quantity') || 0,
    minQty: +fd.get('minQty') || 0,
    unit: fd.get('unit') || 'ea',
    location: fd.get('location'),
    cost: +fd.get('cost') || 0
  };
  try {
    if (id) {
      const idx = state.supplies.findIndex(x => x.id === id);
      state.supplies[idx] = { ...state.supplies[idx], ...obj };
      toast('Updated (local)');
    } else {
      const res = await createSupply(obj);
      obj.id = res.id;
      state.supplies.push(obj);
      toast('Supply saved to Cloudflare');
    }
    closeModal();
    showView('supplies');
  } catch (err) {
    toast('Error: ' + err.message, 'err');
  }
}

function deleteSupply(id) {
  if (!confirm('Delete this item?')) return;
  state.supplies = state.supplies.filter(s => s.id !== id);
  showView('supplies');
  toast('Removed from view');
}

function renderInspections(el) {
  const asset = currentAsset();
  const list = state.inspections
    .filter(i => !asset || i.assetId === asset.id)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  el.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <p class="text-sm text-slate-400">${list.length} inspections</p>
      <button class="btn-primary" onclick="openInspectionForm()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        New Inspection
      </button>
    </div>
    ${list.length === 0 ? `
      <div class="empty-state">
        <p>No inspections yet</p>
        <p class="text-sm mt-1">Failing critical items will set asset to Out of Service</p>
      </div>
    ` : list.map(ins => `
      <div class="card mb-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="font-medium">${ins.template || 'Inspection'}</div>
            <div class="text-xs text-slate-400 mt-1">${ins.date || ''} ${ins.result ? '· ' + ins.result : ''}</div>
          </div>
          <span class="status-badge ${ins.result === 'FAIL' ? 'status-oos' : 'status-healthy'}">${ins.result || 'PASS'}</span>
        </div>
        ${ins.notes ? `<p class="text-sm text-slate-400 mt-2">${ins.notes}</p>` : ''}
      </div>
    `).join('')}
  `;
}

function openInspectionForm() {
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">New Inspection</h2>
      <form onsubmit="saveInspection(event)" class="space-y-3">
        <div>
          <label class="form-label">Template / Type</label>
          <input name="template" class="form-input" value="Daily Walkaround" required>
        </div>
        <div>
          <label class="form-label">Date</label>
          <input name="date" type="date" class="form-input" value="${new Date().toISOString().slice(0,10)}">
        </div>
        <div>
          <label class="form-label">Result</label>
          <select name="result" class="form-select">
            <option value="PASS">PASS</option>
            <option value="FAIL">FAIL (sets Out of Service)</option>
          </select>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <textarea name="notes" class="form-input" rows="3"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  `);
}

function saveInspection(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const result = fd.get('result');
  const ins = {
    id: generateId('insp'),
    assetId: state.currentAssetId,
    template: fd.get('template'),
    date: fd.get('date'),
    result: result,
    notes: fd.get('notes')
  };
  state.inspections.push(ins);
  if (result === 'FAIL') {
    const a = currentAsset();
    if (a) {
      a.status = 'out-of-service';
      toast('Inspection FAIL — asset set Out of Service', 'err');
    }
  } else {
    toast('Inspection saved — PASS');
  }
  updateStatusBadge();
  closeModal();
  showView('inspections');
}

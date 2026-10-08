function renderTools(el) {
  el.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <p class="text-sm text-slate-400">${state.tools.length} tools tracked</p>
      <button class="btn-primary" onclick="openToolForm()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Tool
      </button>
    </div>
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr><th>Name</th><th>Serial</th><th>Location</th><th>Assigned</th><th>Cost</th><th></th></tr>
        </thead>
        <tbody>
          ${state.tools.map(t => `
            <tr>
              <td class="font-medium">${t.name}</td>
              <td class="text-slate-400">${t.serial || '—'}</td>
              <td>${t.location || '—'}</td>
              <td>${t.assignedTo || '—'}</td>
              <td>${formatCurrency(t.cost)}</td>
              <td>
                <button class="text-slate-400 hover:text-white text-xs" onclick="openToolForm('${t.id}')">Edit</button>
                <button class="text-red-400 hover:text-red-300 text-xs ml-2" onclick="deleteTool('${t.id}')">Del</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openToolForm(id = null) {
  const t = id ? state.tools.find(x => x.id === id) : null;
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">${t ? 'Edit' : 'Add'} Tool</h2>
      <form onsubmit="saveTool(event, '${id||''}')" class="space-y-3">
        <div>
          <label class="form-label">Name *</label>
          <input name="name" class="form-input" required value="${t?.name || ''}">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Serial #</label>
            <input name="serial" class="form-input" value="${t?.serial || ''}">
          </div>
          <div>
            <label class="form-label">Cost ($)</label>
            <input name="cost" type="number" step="0.01" class="form-input" value="${t?.cost ?? ''}">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Location</label>
            <input name="location" class="form-input" value="${t?.location || ''}">
          </div>
          <div>
            <label class="form-label">Assigned To</label>
            <input name="assignedTo" class="form-input" value="${t?.assignedTo || ''}">
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

async function saveTool(e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {
    name: fd.get('name'),
    serial: fd.get('serial'),
    location: fd.get('location'),
    assignedTo: fd.get('assignedTo'),
    cost: +fd.get('cost') || 0
  };
  try {
    if (id) {
      const idx = state.tools.findIndex(x => x.id === id);
      state.tools[idx] = { ...state.tools[idx], ...obj };
      toast('Updated (local)');
    } else {
      const res = await createTool(obj);
      obj.id = res.id;
      state.tools.push(obj);
      toast('Tool saved to Cloudflare');
    }
    closeModal();
    showView('tools');
  } catch (err) {
    toast('Error: ' + err.message, 'err');
  }
}

function deleteTool(id) {
  if (!confirm('Delete this tool?')) return;
  state.tools = state.tools.filter(t => t.id !== id);
  showView('tools');
  toast('Removed from view');
}

function exportData() {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(state.assets.map(a => ({
      Unit: a.unitNumber, Type: a.type, Year: a.year, Make: a.make, Model: a.model,
      Plate: a.plate, Odometer: a.odometer, Hours: a.hours, Status: a.status, Notes: a.notes
    }))), 'Assets');

  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(state.serviceRecords.map(r => ({
      Asset: getAsset(state, r.assetId)?.unitNumber || r.assetId,
      Type: r.type, Date: r.date, Description: r.description,
      Odometer: r.odometer, Hours: r.hours, Cost: r.cost, Notes: r.notes
    }))), 'Service Records');

  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(state.fuelRecords.map(r => ({
      Asset: getAsset(state, r.assetId)?.unitNumber || r.assetId,
      Date: r.date, Odometer: r.odometer, Gallons: r.gallons,
      PricePerGallon: r.pricePerGallon, Total: r.totalCost, FuelType: r.fuelType
    }))), 'Fuel');

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.supplies), 'Supplies');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(state.tools), 'Tools');
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.json_to_sheet(state.reminders.map(r => ({
      Asset: getAsset(state, r.assetId)?.unitNumber || r.assetId,
      Title: r.title, DueDate: r.dueDate, DueOdometer: r.dueOdometer,
      DueHours: r.dueHours, Urgency: r.urgency, Completed: r.completed
    }))), 'Reminders');

  XLSX.writeFile(wb, `FleetTracker_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  toast('Exported to Excel');
}

function openServiceForm(id = null) {
  const r = id ? state.serviceRecords.find(x => x.id === id) : null;
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">${r ? 'Edit' : 'Add'} Service Record</h2>
      <form onsubmit="saveService(event, '${id || ''}')" class="space-y-3">
        <div>
          <label class="form-label">Type *</label>
          <select name="type" class="form-select">
            ${['service','repair','upgrade'].map(t => `<option value="${t}" ${r?.type===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">Date *</label>
          <input name="date" type="date" class="form-input" required value="${r?.date || new Date().toISOString().slice(0,10)}">
        </div>
        <div>
          <label class="form-label">Description *</label>
          <input name="description" class="form-input" required value="${r?.description || ''}">
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
          <textarea name="notes" class="form-input" rows="2">${r?.notes || ''}</textarea>
        </div>
        <div>
          <label class="form-label">Photo (optional, saved to R2)</label>
          <input name="photo" type="file" accept="image/*" class="form-input">
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
    odometer: fd.get('odometer') !== '' ? +fd.get('odometer') : null,
    hours: fd.get('hours') !== '' ? +fd.get('hours') : null,
    cost: fd.get('cost') !== '' ? +fd.get('cost') : 0,
    notes: fd.get('notes')
  };
  try {
    const file = e.target.querySelector('input[name="photo"]')?.files?.[0];
    if (file) {
      toast('Uploading photo…');
      obj.photo = await uploadPhoto(file);
    }
    if (id) {
      const existing = state.serviceRecords.find(x => x.id === id);
      if (!obj.photo && existing) obj.photo = existing.photo;
      await updateService(id, obj);
      const idx = state.serviceRecords.findIndex(x => x.id === id);
      state.serviceRecords[idx] = { ...state.serviceRecords[idx], ...obj };
      toast('Service saved to Cloudflare');
    } else {
      const res = await createService(obj);
      obj.id = res.id;
      state.serviceRecords.push(obj);
      toast(obj.photo ? 'Service + photo saved' : 'Service record saved');
    }
    closeModal();
    showView('service');
  } catch (err) {
    toast('Error: ' + err.message, 'err');
  }
}

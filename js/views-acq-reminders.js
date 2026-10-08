function acqOf(asset) {
  const match = String(asset?.notes || '').match(/__acq__:([\d.]+)/);
  return match ? Number(match[1]) : 0;
}
function notesWithAcq(notes, cost) {
  const plain = String(notes || '').replace(/\n?__acq__:[\d.]+/g, '');
  return (plain ? plain + '\n' : '') + '__acq__:' + cost;
}
const _openAcq = openAssetForm;
openAssetForm = function (id) {
  _openAcq(id);
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="acquisitionCost"]')) return;
  const asset = id ? state.assets.find(a => a.id === id) : null;
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">Acquisition cost *</label><input name="acquisitionCost" type="number" step="0.01" min="0" class="form-input" required value="${asset ? acqOf(asset) : ''}" placeholder="Purchase price">`;
  form.querySelector('[name="notes"]').parentElement.before(row);
};
const _saveAcq = saveAsset;
saveAsset = async function (e, id) {
  const cost = e.target.querySelector('[name="acquisitionCost"]').value;
  const notes = e.target.querySelector('[name="notes"]');
  notes.value = notesWithAcq(notes.value, cost);
  await _saveAcq.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (asset) asset.acquisitionCost = Number(cost);
};
function costPerMile(asset) {
  const miles = Number(asset.odometer) || 0;
  if (!miles) return null;
  const service = (state.serviceRecords || []).filter(r => r.assetId === asset.id).reduce((s, r) => s + (r.cost || 0), 0);
  const fuel = (state.fuelRecords || []).filter(r => r.assetId === asset.id).reduce((s, r) => s + (r.totalCost || 0), 0);
  return (acqOf(asset) + service + fuel) / miles;
}
const _renderAcq = renderGarage;
renderGarage = function (el) {
  _renderAcq(el);
  (state.assets || []).forEach((a, i) => {
    const card = el.querySelectorAll('.card')[i];
    const cpm = costPerMile(a);
    if (!card || cpm == null || card.querySelector('.acq-cpm')) return;
    const line = document.createElement('div');
    line.className = 'acq-cpm text-xs text-slate-300 mt-1';
    line.textContent = formatCurrency(cpm) + ' / mi including acquisition';
    card.appendChild(line);
  });
};
const THREE_QUARTER_TON = [
  ['Oil Change', '3000 mi'],
  ['Transmission Fluid', '30000 mi'],
  ['Tire Rotation', '8000 mi'],
  ["Casey's Inspection", 'Annual'],
  ['Front Differential', '50000 mi'],
  ['Rear Differential', '30000 mi'],
  ['Transfer Case Fluid', '30000 mi or Annual'],
  ['Air Filter', '15000 mi or Annual']
];
function renderPresetTable() {
  const today = new Date().toISOString().slice(0, 10);
  return `<div class="card mb-4"><div class="flex justify-between gap-2 mb-2"><h2 class="font-semibold">3/4 ton vehicle reminders</h2><button class="btn-primary text-sm" onclick="applyThreeQuarterPreset()">Apply to this vehicle</button></div><p class="text-sm text-slate-400 mb-3">Dates start as today. Edit the date or interval before applying.</p><div class="table-wrap"><table class="data-table"><thead><tr><th>Category</th><th>Last service</th><th>Interval</th></tr></thead><tbody>${THREE_QUARTER_TON.map((r, i) => `<tr><td>${r[0]}</td><td><input type="date" class="form-input preset-date" value="${today}"></td><td><input class="form-input preset-interval" data-i="${i}" value="${r[1]}"></td></tr>`).join('')}</tbody></table></div></div>`;
}
async function applyThreeQuarterPreset() {
  const asset = currentAsset();
  if (!asset) return toast('Select a vehicle first', 'err');
  const dates = [...document.querySelectorAll('.preset-date')];
  const intervals = [...document.querySelectorAll('.preset-interval')];
  for (let i = 0; i < THREE_QUARTER_TON.length; i++) {
    const title = THREE_QUARTER_TON[i][0];
    const last = dates[i].value;
    const interval = intervals[i].value;
    const miles = (String(interval).match(/(\d+)/) || [])[1];
    let dueDate = null;
    if (/annual/i.test(interval)) {
      const d = new Date(last);
      d.setFullYear(d.getFullYear() + 1);
      dueDate = d.toISOString().slice(0, 10);
    }
    await api('/api/reminders', { method: 'POST', body: JSON.stringify({ asset_id: asset.id, title, due_date: dueDate, due_odometer: miles && asset.odometer ? Number(asset.odometer) + Number(miles) : null, urgency: 'normal', notes: `Last service: ${last}. Interval: ${interval}` }) });
  }
  if (typeof loadAll === 'function') await loadAll();
  toast('Reminders saved. Dashboard updated.');
  showView('dashboard');
}
function editReminder(id) {
  const r = state.reminders.find(x => x.id === id);
  if (!r) return;
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Edit reminder</h2><input id="rem-title" class="form-input" value="${r.title || ''}"><input id="rem-date" type="date" class="form-input" value="${r.dueDate || ''}"><input id="rem-notes" class="form-input" value="${r.notes || ''}" placeholder="Interval"><button class="btn-primary" onclick="saveReminderEdit('${id}')">Save</button></div>`);
}
async function saveReminderEdit(id) {
  const r = state.reminders.find(x => x.id === id);
  r.title = document.getElementById('rem-title').value;
  r.dueDate = document.getElementById('rem-date').value;
  r.notes = document.getElementById('rem-notes').value;
  await updateReminder(id, r);
  closeModal();
  showView('reminders');
}
const _renderEditRem = renderReminders;
renderReminders = function (el) {
  _renderEditRem(el);
  if (!el.querySelector('.preset-date')) el.insertAdjacentHTML('afterbegin', renderPresetTable());
  el.querySelectorAll('.card').forEach(card => {
    const title = card.querySelector('div')?.textContent;
    const row = (state.reminders || []).find(r => title && title.includes(r.title));
    if (!row || card.querySelector('.edit-rem')) return;
    const btn = document.createElement('button');
    btn.className = 'btn-secondary text-xs edit-rem mt-2';
    btn.textContent = 'Edit date / interval';
    btn.onclick = () => editReminder(row.id);
    card.appendChild(btn);
  });
};

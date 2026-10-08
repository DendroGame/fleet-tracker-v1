function capitalizeMenus() {
  document.querySelectorAll('select').forEach(sel => {
    [...sel.options].forEach(opt => {
      const text = opt.textContent.trim();
      if (!text) return;
      opt.textContent = text.charAt(0).toUpperCase() + text.slice(1);
    });
  });
}
setInterval(capitalizeMenus, 1000);

const PRESETS = {
  '3/4 ton vehicle reminders': [
    ['Oil Change', '3000 mi'],
    ['Transmission Fluid', '30000 mi'],
    ['Tire Rotation', '8000 mi'],
    ["Casey's Inspection", 'Annual'],
    ['Front Differential', '50000 mi'],
    ['Rear Differential', '30000 mi'],
    ['Transfer Case Fluid', '30000 mi or Annual'],
    ['Air Filter', '15000 mi or Annual']
  ]
};

function presetPicker() {
  return `<div class="card mb-4"><label class="form-label">Reminder preset</label><select class="form-select" onchange="showPreset(this.value)"><option value="">Choose a preset</option>${Object.keys(PRESETS).map(name => `<option>${name}</option>`).join('')}</select><div id="preset-preview"></div></div>`;
}
function showPreset(name) {
  const box = document.getElementById('preset-preview');
  if (!name || !PRESETS[name]) { box.innerHTML = ''; return; }
  const today = new Date().toISOString().slice(0, 10);
  box.innerHTML = `<p class="text-sm text-slate-400 my-3">Change a date or interval, then apply. Categories already on this vehicle are skipped.</p><div class="table-wrap"><table class="data-table"><thead><tr><th>Category</th><th>Last service</th><th>Interval</th></tr></thead><tbody>${PRESETS[name].map(r => `<tr><td>${r[0]}</td><td><input type="date" class="form-input preset-date" value="${today}"></td><td><input class="form-input preset-interval" value="${r[1]}"></td></tr>`).join('')}</tbody></table></div><button class="btn-primary mt-3" onclick="applyNamedPreset('${name.replace(/'/g, '')}')">Apply preset</button>`;
}
async function applyNamedPreset(name) {
  const asset = currentAsset();
  if (!asset) return toast('Select a vehicle first', 'err');
  const rows = PRESETS[name] || [];
  const existing = new Set((state.reminders || []).filter(r => r.assetId === asset.id).map(r => (r.title || '').toLowerCase()));
  const dates = [...document.querySelectorAll('.preset-date')];
  const intervals = [...document.querySelectorAll('.preset-interval')];
  let added = 0;
  for (let i = 0; i < rows.length; i++) {
    if (existing.has(rows[i][0].toLowerCase())) continue;
    const last = dates[i].value;
    const interval = intervals[i].value;
    const miles = (String(interval).match(/(\d+)/) || [])[1];
    let dueDate = null;
    if (/annual/i.test(interval)) {
      const d = new Date(last);
      d.setFullYear(d.getFullYear() + 1);
      dueDate = d.toISOString().slice(0, 10);
    }
    await api('/api/reminders', { method: 'POST', body: JSON.stringify({ asset_id: asset.id, title: rows[i][0], due_date: dueDate, due_odometer: miles && asset.odometer ? Number(asset.odometer) + Number(miles) : null, urgency: 'normal', notes: `Last service: ${last}. Interval: ${interval}` }) });
    added++;
  }
  if (typeof loadAll === 'function') await loadAll();
  toast(added ? added + ' reminders added' : 'Those reminders are already on this vehicle');
  showView('dashboard');
}
const _renderPresetDrop = renderReminders;
renderReminders = function (el) {
  _renderPresetDrop(el);
  if (!el.querySelector('.form-select')) el.insertAdjacentHTML('afterbegin', presetPicker());
  else if (!document.getElementById('preset-preview')) el.insertAdjacentHTML('afterbegin', presetPicker());
};

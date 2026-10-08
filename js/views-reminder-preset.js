const THREE_QUARTER_TON = [
  ['Oil Change', '3,000 mi'],
  ['Transmission Fluid', '30,000 mi'],
  ['Tire Rotation', '8,000 mi'],
  ["Casey's Inspection", 'Annual'],
  ['Front Differential', '50,000 mi'],
  ['Rear Differential', '30,000 mi'],
  ['Transfer Case Fluid', '30,000 mi or Annual'],
  ['Air Filter', '15,000 mi or Annual']
];
function milesFromInterval(text) {
  const match = String(text).match(/([\d,]+)\s*mi/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}
function renderPresetTable() {
  const today = new Date().toISOString().slice(0, 10);
  return `<div class="card mb-4"><div class="flex flex-wrap items-center justify-between gap-2 mb-3"><h2 class="font-semibold">3/4 ton vehicle reminders</h2><button class="btn-primary text-sm" onclick="applyThreeQuarterPreset()">Apply to this vehicle</button></div><p class="text-sm text-slate-400 mb-3">Last service starts as today. Change any date before applying.</p><div class="table-wrap"><table class="data-table"><thead><tr><th>Maintenance Category</th><th>Last Service Date</th><th>Service Interval</th></tr></thead><tbody>${THREE_QUARTER_TON.map((r, i) => `<tr><td>${r[0]}</td><td><input type="date" class="form-input preset-date" data-i="${i}" value="${today}"></td><td>${r[1]}</td></tr>`).join('')}</tbody></table></div></div>`;
}
async function applyThreeQuarterPreset() {
  const asset = currentAsset();
  if (!asset) return toast('Select a vehicle first', 'err');
  const dates = [...document.querySelectorAll('.preset-date')];
  for (let i = 0; i < THREE_QUARTER_TON.length; i++) {
    const [title, interval] = THREE_QUARTER_TON[i];
    const last = dates[i]?.value || new Date().toISOString().slice(0, 10);
    const miles = milesFromInterval(interval);
    const annual = /annual/i.test(interval);
    let dueDate = null;
    if (annual) {
      const d = new Date(last);
      d.setFullYear(d.getFullYear() + 1);
      dueDate = d.toISOString().slice(0, 10);
    }
    await api('/api/reminders', {
      method: 'POST',
      body: JSON.stringify({
        asset_id: asset.id,
        title,
        due_date: dueDate,
        due_odometer: miles && asset.odometer ? Number(asset.odometer) + miles : null,
        urgency: 'normal',
        notes: `Preset: 3/4 ton vehicle reminders. Last service: ${last}. Interval: ${interval}`
      })
    });
  }
  toast('Preset added to ' + asset.unitNumber);
  if (typeof loadAll === 'function') await loadAll();
  showView('reminders');
}
const _renderRemindersPreset = renderReminders;
renderReminders = function (el) {
  _renderRemindersPreset(el);
  if (!el.querySelector('.preset-date')) el.insertAdjacentHTML('afterbegin', renderPresetTable());
};

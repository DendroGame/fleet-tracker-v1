const THREE_QUARTER_TON = [
  ['Oil Change', '2026-07-30', '3,000 mi'],
  ['Transmission Fluid', '2026-07-30', '30,000 mi'],
  ['Tire Rotation', '2026-08-04', '8,000 mi'],
  ["Casey's Inspection", '2025-11-17', 'Annual'],
  ['Front Differential', '2026-06-24', '50,000 mi'],
  ['Rear Differential', '', '30,000 mi'],
  ['Transfer Case Fluid', '2026-02-27', '30,000 mi or Annual'],
  ['Air Filter', '2025-11-13', '15,000 mi or Annual']
];

function milesFromInterval(text) {
  const match = String(text).match(/([\d,]+)\s*mi/i);
  return match ? Number(match[1].replace(/,/g, '')) : null;
}

function renderPresetTable() {
  return `<div class="card mb-4"><div class="flex flex-wrap items-center justify-between gap-2 mb-3"><h2 class="font-semibold">3/4 ton vehicle reminders</h2><button class="btn-primary text-sm" onclick="applyThreeQuarterPreset()">Apply to this vehicle</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Maintenance Category</th><th>Last Service Date</th><th>Service Interval</th></tr></thead><tbody>${THREE_QUARTER_TON.map(r => `<tr><td>${r[0]}</td><td>${r[1] || '—'}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table></div></div>`;
}

async function applyThreeQuarterPreset() {
  const asset = currentAsset();
  if (!asset) return toast('Select a vehicle first', 'err');
  for (const [title, last, interval] of THREE_QUARTER_TON) {
    const miles = milesFromInterval(interval);
    const annual = /annual/i.test(interval);
    let dueDate = null;
    if (annual && last) {
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
        due_odometer: miles && asset.odometer ? asset.odometer + miles : null,
        urgency: 'normal',
        notes: `Preset: 3/4 ton vehicle reminders. Last service: ${last || 'none'}. Interval: ${interval}`
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
  el.insertAdjacentHTML('afterbegin', renderPresetTable());
};

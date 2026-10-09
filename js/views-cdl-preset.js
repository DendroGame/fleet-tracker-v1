const CDL_PRETRIP = ['Lights','Tires','Brakes','Steering','Horn','Mirrors','Windshield and wipers','Fuel cap','Coupling','Cargo securement','Emergency equipment','Engine oil and coolant','Air system','Suspension'];
function inspectionPreset() {
  return `<div class="card mb-4"><label class="form-label">Inspection preset</label><select class="form-select" onchange="showInspectionPreset(this.value)"><option value="">Choose a preset</option><option>CDL pre-trip</option></select><div id="inspect-preview"></div></div>`;
}
function showInspectionPreset(name) {
  const box = document.getElementById('inspect-preview');
  if (name !== 'CDL pre-trip') { box.innerHTML = ''; return; }
  box.innerHTML = `<div class="mt-3 space-y-2">${CDL_PRETRIP.map(item => `<div class="flex items-center justify-between gap-2"><span>${item}</span><select class="form-select cdl-result" data-item="${item}"><option>Good</option><option>Needs maintenance</option><option>Fail</option></select></div>`).join('')}</div><button class="btn-primary mt-3" onclick="saveCdlPreset()">Save inspection</button>`;
}
async function saveCdlPreset() {
  const asset = currentAsset();
  if (!asset) return toast('Select a vehicle first', 'err');
  const rows = [...document.querySelectorAll('.cdl-result')].map(el => ({ item: el.dataset.item, result: el.value }));
  const worst = rows.some(r => r.result === 'Fail') ? 'Fail' : rows.some(r => r.result === 'Needs maintenance') ? 'Needs maintenance' : 'Good';
  const status = worst === 'Fail' ? 'Out of service' : worst === 'Needs maintenance' ? 'Inspection pending' : 'In service';
  await api('/api/inspections', { method: 'POST', body: JSON.stringify({ asset_id: asset.id, date: new Date().toISOString().slice(0, 10), template: 'CDL pre-trip', result: worst, notes: rows.map(r => r.item + ': ' + r.result).join('\n') }) });
  asset.status = status;
  await updateAsset(asset.id, asset);
  if (typeof loadAll === 'function') await loadAll();
  toast(worst + ' · ' + status);
  showView('dashboard');
}
const _renderInspectPreset = renderInspections;
renderInspections = function (el) {
  _renderInspectPreset(el);
  if (!document.getElementById('inspect-preview')) el.insertAdjacentHTML('afterbegin', inspectionPreset());
};

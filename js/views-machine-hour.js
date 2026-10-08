function isEquipment(asset) {
  const type = String(asset?.type || '').toLowerCase();
  return /machine|equipment|excavator|loader/.test(type);
}
function calcMode(asset) {
  const match = String(asset?.notes || '').match(/__calc__:(mile|hour)/);
  if (match) return match[1];
  return isEquipment(asset) ? 'hour' : 'mile';
}
function addCalcChoice(id) {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="calcMode"]')) return;
  const asset = id ? (state.assets || []).find(a => a.id === id) : null;
  const type = form.querySelector('[name="type"]')?.value || asset?.type || '';
  const mode = asset ? calcMode(asset) : (/equipment|machine/i.test(type) ? 'hour' : 'mile');
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">Calculate cost by</label><select name="calcMode" class="form-select"><option value="mile" ${mode==='mile'?'selected':''}>$/mile</option><option value="hour" ${mode==='hour'?'selected':''}>$/machine hour</option></select>`;
  const acq = form.querySelector('[name="acquisitionCost"]');
  (acq ? acq.parentElement : form).after(row);
}
const _openEquip = openAssetForm;
openAssetForm = function (id) {
  _openEquip.apply(this, arguments);
  setTimeout(() => addCalcChoice(id), 500);
};
const _renderEquip = renderGarage;
renderGarage = function (el) {
  _renderEquip(el);
  (state.assets || []).forEach((a, i) => {
    const card = el.querySelectorAll('.card')[i];
    const line = card?.querySelector('.acq-cpm');
    if (!line) return;
    const mode = calcMode(a);
    const base = mode === 'hour' ? Number(a.hours) : Number(a.odometer);
    if (!base) { line.textContent = mode === 'hour' ? 'No machine hours yet' : 'No miles yet'; return; }
    const service = (state.serviceRecords || []).filter(r => r.assetId === a.id).reduce((s, r) => s + (r.cost || 0), 0);
    const fuel = (state.fuelRecords || []).filter(r => r.assetId === a.id).reduce((s, r) => s + (r.totalCost || 0), 0);
    const acq = Number((String(a.notes || '').match(/__acq__:([\d.]+)/) || [])[1] || 0);
    line.textContent = formatCurrency((acq + service + fuel) / base) + (mode === 'hour' ? ' / machine hour' : ' / mi');
  });
};

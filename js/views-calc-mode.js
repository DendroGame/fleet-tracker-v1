function calcMode(asset) {
  const match = String(asset?.notes || '').match(/__calc__:(mile|hour)/);
  return match ? match[1] : 'mile';
}
function addCalcChoice(id) {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="calcMode"]')) return;
  const asset = id ? (state.assets || []).find(a => a.id === id) : null;
  const mode = calcMode(asset);
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">Calculate cost by</label><select name="calcMode" class="form-select"><option value="mile" ${mode==='mile'?'selected':''}>$/mile</option><option value="hour" ${mode==='hour'?'selected':''}>$/hour</option></select>`;
  const acq = form.querySelector('[name="acquisitionCost"]');
  (acq ? acq.parentElement : form).after(row);
}
const _openCalc = openAssetForm;
openAssetForm = function (id) {
  _openCalc.apply(this, arguments);
  setTimeout(() => addCalcChoice(id), 450);
};
const _saveCalc = saveAsset;
saveAsset = async function (e, id) {
  const mode = e.target.querySelector('[name="calcMode"]')?.value || 'mile';
  const notes = e.target.querySelector('[name="notes"]');
  if (notes) notes.value = String(notes.value || '').replace(/\n?__calc__:(mile|hour)/g, '') + '\n__calc__:' + mode;
  await _saveCalc.apply(this, arguments);
};
const _renderCalc = renderGarage;
renderGarage = function (el) {
  _renderCalc(el);
  (state.assets || []).forEach((a, i) => {
    const card = el.querySelectorAll('.card')[i];
    const line = card?.querySelector('.acq-cpm');
    if (!line) return;
    const mode = calcMode(a);
    const base = mode === 'hour' ? Number(a.hours) : Number(a.odometer);
    if (!base) { line.textContent = 'No ' + (mode === 'hour' ? 'hours' : 'miles') + ' yet'; return; }
    const service = (state.serviceRecords || []).filter(r => r.assetId === a.id).reduce((s, r) => s + (r.cost || 0), 0);
    const fuel = (state.fuelRecords || []).filter(r => r.assetId === a.id).reduce((s, r) => s + (r.totalCost || 0), 0);
    const acq = (String(a.notes || '').match(/__acq__:([\d.]+)/) || [])[1] || 0;
    line.textContent = formatCurrency((Number(acq) + service + fuel) / base) + (mode === 'hour' ? ' / hour' : ' / mi');
  });
};

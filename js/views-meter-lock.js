const unlockedMeters = new Set();
function meterMode(asset) {
  return typeof calcMode === 'function' ? calcMode(asset) : 'mile';
}
function lockMeterChoice() {
  const form = document.querySelector('#modal-content form');
  const select = form?.querySelector('[name="calcMode"]');
  if (!select) return;
  const unit = form.querySelector('[name="unitNumber"]')?.value;
  const asset = (state.assets || []).find(a => a.unitNumber === unit);
  const editing = !!asset;
  if (!editing) {
    select.required = true;
    select.disabled = false;
    if (!select.querySelector('option[value=""]')) select.insertAdjacentHTML('afterbegin', '<option value="">Choose miles or hours</option>');
    return;
  }
  if (unlockedMeters.has(asset.id)) {
    select.disabled = false;
    return;
  }
  select.disabled = true;
  if (form.querySelector('.unlock-meter')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'unlock-meter btn-secondary text-xs mt-2';
  btn.textContent = 'Change miles or hours';
  btn.onclick = () => unlockMeter(asset.id);
  select.after(btn);
}
function unlockMeter(id) {
  const pass = prompt('Admin password');
  if (pass === null) return;
  checkMeterPass(id, pass);
}
async function checkMeterPass(id, password) {
  try {
    const res = await api('/api/login', { method: 'POST', body: JSON.stringify({ name: "Jonathan's Fleet", password }) });
    if (res.role !== 'admin') throw new Error('Admin account required');
    unlockedMeters.add(id);
    const select = document.querySelector('#modal-content [name="calcMode"]');
    if (select) select.disabled = false;
    toast('Miles or hours unlocked');
  } catch (err) {
    toast(err.message || 'Blocked', 'err');
  }
}
function hideUnusedMeter() {
  if (document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!asset) return;
  const hour = meterMode(asset) === 'hour';
  document.querySelectorAll('#main-content .card').forEach(card => {
    const label = (card.querySelector('.uppercase, .text-xs')?.textContent || '').toLowerCase();
    const isOdo = label === 'odometer' || label.startsWith('odometer');
    const isHours = label === 'hours' || label.startsWith('hours');
    if (hour && isOdo) card.style.display = 'none';
    if (hour && isHours) card.style.display = '';
    if (!hour && isHours) card.style.display = 'none';
    if (!hour && isOdo) card.style.display = '';
  });
}
const _saveMeter = saveAsset;
saveAsset = async function (e, id) {
  const select = e.target.querySelector('[name="calcMode"]');
  if (select) select.disabled = false;
  const mode = select?.value === 'hour' ? 'hour' : 'mile';
  await _saveMeter.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset) return;
  asset.notes = String(asset.notes || '').replace(/\n?__calc__:(mile|hour)/g, '') + '\n__calc__:' + mode;
  await updateAsset(asset.id, asset);
  toast(mode === 'hour' ? 'Saved as hours' : 'Saved as miles');
};
const _openMeter = openAssetForm;
openAssetForm = function () {
  _openMeter.apply(this, arguments);
  setTimeout(lockMeterChoice, 600);
};
setInterval(() => { lockMeterChoice(); hideUnusedMeter(); }, 800);

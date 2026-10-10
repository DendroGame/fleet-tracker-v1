function meterMode(asset) {
  return typeof calcMode === 'function' ? calcMode(asset) : 'mile';
}
function lockMeterChoice() {
  const form = document.querySelector('#modal-content form');
  const select = form?.querySelector('[name="calcMode"]');
  if (!select || select.dataset.locked) return;
  const editing = !!form.querySelector('[name="unitNumber"]')?.value && document.querySelector('#modal-content h2')?.textContent?.includes('Edit');
  if (!editing) {
    select.required = true;
    if (!select.querySelector('option[value=""]')) select.insertAdjacentHTML('afterbegin', '<option value="">Choose miles or hours</option>');
    if (!select.value) select.value = '';
    return;
  }
  select.disabled = true;
  select.dataset.locked = '1';
  if (form.querySelector('.unlock-meter')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'unlock-meter btn-secondary text-xs mt-2';
  btn.textContent = 'Change miles or hours';
  btn.onclick = () => unlockMeter(select);
  select.after(btn);
}
function unlockMeter(select) {
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Admin password</h2><p class="text-sm text-slate-400">Only an admin can change miles or hours.</p><input id="meter-pass" type="password" class="form-input" placeholder="Admin password"><button class="btn-primary" onclick="checkMeterPass()">Unlock</button></div>`);
  window._meterSelect = select;
}
async function checkMeterPass() {
  const password = document.getElementById('meter-pass').value;
  try {
    const res = await api('/api/login', { method: 'POST', body: JSON.stringify({ name: "Jonathan's Fleet", password }) });
    if (res.role !== 'admin') throw new Error('Admin account required');
    if (window._meterSelect) window._meterSelect.disabled = false;
    closeModal();
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
    const text = (card.textContent || '').toLowerCase();
    if (hour && /odometer/.test(text) && !/hour/.test(text)) card.style.display = 'none';
    if (!hour && /\bhours\b/.test(text) && !/odometer/.test(text)) card.style.display = 'none';
  });
}
const _openMeter = openAssetForm;
openAssetForm = function () {
  _openMeter.apply(this, arguments);
  setTimeout(lockMeterChoice, 600);
};
setInterval(() => { lockMeterChoice(); hideUnusedMeter(); }, 800);

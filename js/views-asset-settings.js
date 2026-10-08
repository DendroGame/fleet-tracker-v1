const ASSET_TOGGLES = [
  ['odometer', 'Odometer'],
  ['hours', 'Hours'],
  ['service', 'Service cost tile'],
  ['fuel', 'Fuel cost tile'],
  ['mpg', 'MPG tile'],
  ['reminders', 'Reminders tile'],
  ['status', 'Status tile']
];
function readAssetSettings(asset) {
  const base = { odometer: true, hours: true, service: true, fuel: true, mpg: true, reminders: true, status: true };
  const raw = asset?.notes || '';
  const match = raw.match(/__ft__(\{.*\})\s*$/);
  if (!match) return base;
  try { return { ...base, ...JSON.parse(match[1]) }; } catch (e) { return base; }
}
function notesWithSettings(asset, settings) {
  const plain = (asset.notes || '').replace(/\n?__ft__\{.*\}\s*$/, '');
  return (plain ? plain + '\n' : '') + '__ft__' + JSON.stringify(settings);
}
function applyAssetSettings() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!asset) return;
  const s = readAssetSettings(asset);
  document.querySelectorAll('#main-content .card').forEach(card => {
    const text = (card.textContent || '').toLowerCase();
    const hide = (s.service === false && text.includes('service cost')) || (s.fuel === false && text.includes('fuel')) || (s.mpg === false && text.includes('mpg')) || (s.reminders === false && text.includes('reminder')) || (s.status === false && (text.includes('status') || text.includes('state')));
    card.style.display = hide ? 'none' : '';
  });
  document.querySelectorAll('#main-content p').forEach(p => {
    if (!/mi|hrs/.test(p.textContent)) return;
    let text = p.textContent;
    if (s.odometer === false) text = text.replace(/[\d,]+ mi/g, '');
    if (s.hours === false) text = text.replace(/[\d,]+ hrs/g, '');
    p.textContent = text.replace(/^\s*·\s*/, '').trim();
  });
}
function openAssetDisplaySettings() {
  const asset = currentAsset();
  if (!asset) return;
  const s = readAssetSettings(asset);
  openModal(`<div class="p-5 space-y-3"><h2 class="text-lg font-semibold">${asset.unitNumber} display</h2><p class="text-sm text-slate-400">Saved on this vehicle in D1. Same on every device.</p>${ASSET_TOGGLES.map(([k, label]) => `<label class="flex gap-2 text-sm"><input type="checkbox" data-set="${k}" ${s[k]!==false?'checked':''}> ${label}</label>`).join('')}<div class="flex justify-end gap-2"><button class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveAssetDisplaySettings()">Save</button></div></div>`);
}
async function saveAssetDisplaySettings() {
  const asset = currentAsset();
  const settings = {};
  document.querySelectorAll('[data-set]').forEach(el => settings[el.dataset.set] = el.checked);
  asset.notes = notesWithSettings(asset, settings);
  try {
    await updateAsset(asset.id, asset);
    toast('Saved for ' + asset.unitNumber);
    closeModal();
    showView(document.querySelector('.nav-btn.active')?.dataset.view || 'dashboard');
  } catch (err) {
    toast(err.message, 'err');
  }
}
const _renderAssetSettings = renderDashboard;
renderDashboard = function (el) {
  _renderAssetSettings(el);
  if (!el.querySelector('.asset-display-btn')) {
    const btn = document.createElement('button');
    btn.className = 'btn-secondary text-sm asset-display-btn mb-3';
    btn.textContent = 'Vehicle display settings';
    btn.onclick = openAssetDisplaySettings;
    el.prepend(btn);
  }
  applyAssetSettings();
};

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
  const at = raw.lastIndexOf('__ft__');
  if (at < 0) return base;
  try { return { ...base, ...JSON.parse(raw.slice(at + 6)) }; } catch (e) { return base; }
}
function notesWithSettings(asset, settings) {
  const plain = (asset.notes || '').replace(/\n?__ft__[\s\S]*$/, '');
  return (plain ? plain + '\n' : '') + '__ft__' + JSON.stringify(settings);
}
function applyAssetSettings() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!asset) return;
  const s = readAssetSettings(asset);
  document.querySelectorAll('#main-content .card').forEach(card => {
    const label = (card.querySelector('.uppercase, .text-xs')?.textContent || card.textContent || '').toLowerCase();
    let key = '';
    if (label.includes('service cost') || label.includes('service spend')) key = 'service';
    else if (label.includes('fuel cost') || label.includes('fuel spend')) key = 'fuel';
    else if (label.includes('mpg')) key = 'mpg';
    else if (label.includes('reminder')) key = 'reminders';
    else if (label.includes('status') || label.includes('asset state') || label.includes('state of')) key = 'status';
    if (key) card.style.display = s[key] === false ? 'none' : '';
  });
  document.querySelectorAll('#main-content p, #now-selected').forEach(p => {
    if (s.odometer === false) p.querySelectorAll('.mi, .odo') ;
    if (!/mi|hrs/.test(p.textContent || '')) return;
    let text = p.textContent;
    if (s.odometer === false) text = text.replace(/[\d,]+\s*mi/gi, '');
    if (s.hours === false) text = text.replace(/[\d,]+\s*hrs/gi, '');
    p.textContent = text.replace(/\s+·\s+/g, ' ').replace(/^\s*·\s*/, '').trim();
  });
}
function openAssetDisplaySettings() {
  const asset = currentAsset();
  if (!asset) return toast('Select a vehicle first', 'err');
  const s = readAssetSettings(asset);
  openModal(`<div class="p-5 space-y-3"><h2 class="text-lg font-semibold">${asset.unitNumber} display</h2><p class="text-sm text-slate-400">Saved on this vehicle. Uncheck to hide.</p>${ASSET_TOGGLES.map(([k, label]) => `<label class="flex gap-2 text-sm"><input type="checkbox" data-set="${k}" ${s[k]!==false?'checked':''}> ${label}</label>`).join('')}<div class="flex justify-end gap-2"><button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button><button type="button" class="btn-primary" onclick="saveAssetDisplaySettings()">Save</button></div></div>`);
}
async function saveAssetDisplaySettings() {
  const asset = currentAsset();
  const settings = {};
  document.querySelectorAll('#modal-content [data-set]').forEach(el => settings[el.dataset.set] = el.checked);
  asset.notes = notesWithSettings(asset, settings);
  try { await updateAsset(asset.id, asset); } catch (err) { toast('Saved on screen, D1 update failed: ' + err.message, 'err'); }
  closeModal();
  toast('Display updated for ' + asset.unitNumber);
  showView('dashboard');
  setTimeout(applyAssetSettings, 50);
}
const _renderApply = renderDashboard;
renderDashboard = function (el) {
  _renderApply(el);
  if (!el.querySelector('.asset-display-btn')) {
    const btn = document.createElement('button');
    btn.className = 'btn-secondary text-sm asset-display-btn mb-3';
    btn.textContent = 'Vehicle display settings';
    btn.onclick = openAssetDisplaySettings;
    el.prepend(btn);
  }
  setTimeout(applyAssetSettings, 0);
};

const VEHICLE_VIEWS = ['dashboard','service','fuel','supplies','inspections','reminders','tools','insurance','taxes','subscriptions'];
function unitPath(unit, view) {
  const base = '/' + encodeURIComponent(unit || '');
  return view && view !== 'dashboard' ? base + '/' + view : base;
}
function goToUnit(asset, view) {
  if (!asset?.unitNumber) return;
  const path = unitPath(asset.unitNumber, view || 'dashboard');
  if (location.pathname !== path) history.pushState({ unit: asset.unitNumber, view }, '', path);
}
function goGarage() {
  if (location.pathname !== '/garage') history.pushState({ view: 'garage' }, '', '/garage');
}
function readUnitFromUrl() {
  const parts = decodeURIComponent(location.pathname).split('/').filter(Boolean);
  if (!parts.length || parts[0] === 'index.html') return;
  if (parts[0] === 'garage') {
    if (document.getElementById('view-title')?.textContent !== 'Garage') showView('garage');
    return;
  }
  const asset = (state.assets || []).find(a => a.unitNumber === parts[0]);
  if (!asset) return;
  if (state.currentAssetId !== asset.id) switchAsset(asset.id);
  const view = VEHICLE_VIEWS.includes(parts[1]) ? parts[1] : 'dashboard';
  const titles = { dashboard: 'Dashboard', service: 'Service', fuel: 'Fuel', supplies: 'Supplies', inspections: 'Inspections', reminders: 'Reminders', tools: 'Tools', insurance: 'Insurance', taxes: 'Taxes', subscriptions: 'Subscriptions' };
  if (document.getElementById('view-title')?.textContent !== titles[view]) showView(view);
}
function blockDuplicateUnit(e, id) {
  const unit = e.target.querySelector('[name="unitNumber"]')?.value?.trim();
  if (!unit) return false;
  const taken = (state.assets || []).some(a => a.unitNumber === unit && a.id !== id);
  if (!taken) return false;
  toast('Unit number ' + unit + ' is already used', 'err');
  e.preventDefault();
  return true;
}
const _saveUnit = saveAsset;
saveAsset = async function (e, id) {
  if (blockDuplicateUnit(e, id)) return;
  await _saveUnit.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (asset) goToUnit(asset, 'dashboard');
};
const _switchUnit = switchAsset;
switchAsset = function (id) {
  _switchUnit(id);
  const asset = (state.assets || []).find(a => a.id === id);
  if (asset && !location.pathname.startsWith('/' + encodeURIComponent(asset.unitNumber))) goToUnit(asset, 'dashboard');
};
const _showPath = showView;
showView = function (name) {
  const result = _showPath.apply(this, arguments);
  if (name === 'garage') goGarage();
  else if (VEHICLE_VIEWS.includes(name)) {
    const asset = typeof currentAsset === 'function' ? currentAsset() : null;
    if (asset) goToUnit(asset, name);
  }
  return result;
};
window.addEventListener('popstate', readUnitFromUrl);
setInterval(readUnitFromUrl, 1500);

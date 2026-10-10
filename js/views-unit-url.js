function unitPath(unit) {
  return '/' + encodeURIComponent(unit || '');
}
function goToUnit(asset, view) {
  if (!asset?.unitNumber) return;
  const path = unitPath(asset.unitNumber);
  if (location.pathname !== path) history.pushState({ unit: asset.unitNumber }, '', path);
  if (view) showView(view);
}
function goGarage() {
  if (location.pathname !== '/garage') history.pushState({ view: 'garage' }, '', '/garage');
}
function readUnitFromUrl() {
  const unit = decodeURIComponent(location.pathname.replace(/^\//, ''));
  if (!unit || unit === 'index.html') return;
  if (unit === 'garage') {
    if (document.getElementById('view-title')?.textContent !== 'Garage') showView('garage');
    return;
  }
  const asset = (state.assets || []).find(a => a.unitNumber === unit);
  if (!asset) return;
  if (state.currentAssetId !== asset.id) switchAsset(asset.id);
  if (document.getElementById('view-title')?.textContent === 'Garage') showView('dashboard');
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
  if (asset) goToUnit(asset);
};
const _showGarage = showView;
showView = function (name) {
  const result = _showGarage.apply(this, arguments);
  if (name === 'garage') goGarage();
  return result;
};
window.addEventListener('popstate', readUnitFromUrl);
setInterval(readUnitFromUrl, 1500);

function isTrailer(asset) {
  return /trailer/i.test(asset?.type || '') || /trailer/i.test(asset?.notes || '');
}
function trailerNav() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const fuel = document.querySelector('[data-view="fuel"]');
  if (!fuel) return;
  if (isTrailer(asset)) {
    fuel.textContent = 'Odometer';
    fuel.onclick = () => showView('trailer-odo');
  } else {
    fuel.textContent = 'Fuel';
    fuel.onclick = () => showView('fuel');
  }
}
function renderTrailerOdo(el) {
  const asset = currentAsset();
  if (!asset) { el.innerHTML = '<p>Select a trailer.</p>'; return; }
  el.innerHTML = `<div class="card max-w-md space-y-3"><h2 class="font-semibold">${asset.unitNumber} odometer</h2><p class="text-sm text-slate-400">Current ${asset.odometer || 0} mi</p><label class="form-label">Miles traveled</label><input id="trailer-miles" type="number" min="0" class="form-input" placeholder="Miles to add"><button class="btn-primary" onclick="addTrailerMiles()">Add to odometer</button></div>`;
}
async function addTrailerMiles() {
  const asset = currentAsset();
  const add = Number(document.getElementById('trailer-miles').value);
  if (!asset || !add) return toast('Enter miles', 'err');
  asset.odometer = (Number(asset.odometer) || 0) + add;
  await updateAsset(asset.id, asset);
  toast('Odometer is now ' + asset.odometer);
  showView('trailer-odo');
}
const _showTrailer = showView;
showView = function (name) {
  if (name === 'trailer-odo') {
    document.getElementById('view-title').textContent = 'Odometer';
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="fuel"]')?.classList.add('active');
    renderTrailerOdo(document.getElementById('main-content'));
    return;
  }
  _showTrailer(name);
  trailerNav();
};
setInterval(trailerNav, 800);

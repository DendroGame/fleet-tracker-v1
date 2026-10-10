function onVehiclePage() {
  const path = decodeURIComponent(location.pathname.replace(/^\//, ''));
  return path && path !== 'garage' && path !== 'index.html' && (state.assets || []).some(a => a.unitNumber === path);
}
function sideForPage() {
  const vehicle = onVehiclePage();
  document.querySelectorAll('nav .nav-btn').forEach(btn => {
    const view = btn.dataset.view;
    btn.style.display = !vehicle && view !== 'todos' && view !== 'garage' ? 'none' : '';
  });
  const settings = document.querySelector('aside .border-t');
  if (!settings) return;
  if (!vehicle) {
    settings.querySelectorAll('[data-settings], .nav-btn').forEach(btn => btn.style.display = '');
    settings.querySelector('.vehicle-side')?.remove();
    return;
  }
  settings.querySelectorAll('[data-settings]').forEach(btn => btn.style.display = 'none');
  if (settings.querySelector('.vehicle-side')) return;
  const asset = currentAsset();
  const box = document.createElement('div');
  box.className = 'vehicle-side space-y-1';
  box.innerHTML = `
    <button class="nav-btn" onclick="openAssetForm('${asset.id}')">Edit vehicle</button>
    <button class="nav-btn" onclick="openAssetDisplaySettings()">Display</button>
    <button class="nav-btn" onclick="openVehicleDashSettings()">Charts</button>
  `;
  settings.querySelector('.uppercase')?.after(box);
}
setInterval(sideForPage, 500);

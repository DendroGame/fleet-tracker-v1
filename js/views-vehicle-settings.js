function vehicleSettingsBar() {
  if (document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const main = document.getElementById('main-content');
  if (!asset || !main || main.querySelector('.vehicle-settings-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'vehicle-settings-bar flex flex-wrap items-center gap-2 mb-4';
  bar.innerHTML = `
    <h2 class="text-lg font-semibold mr-2">${asset.unitNumber} settings</h2>
    <button class="btn-secondary text-sm" onclick="openAssetForm('${asset.id}')">Edit vehicle</button>
    <button class="btn-secondary text-sm" onclick="openAssetDisplaySettings()">Dashboard display</button>
    <button class="btn-secondary text-sm" onclick="openVehicleDashSettings()">Chart settings</button>
  `;
  main.prepend(bar);
  const old = main.querySelector('h2');
  if (old && /reports/.test(old.textContent || '') && old !== bar.querySelector('h2')) old.closest('.flex')?.querySelector('button')?.remove();
}
setInterval(vehicleSettingsBar, 700);

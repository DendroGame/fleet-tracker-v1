function hideDuplicateDisplay() {
  document.querySelectorAll('.asset-display-btn, button').forEach(btn => {
    if (/vehicle display settings/i.test(btn.textContent || '')) btn.remove();
  });
}
function vehicleSettingsButton() {
  hideDuplicateDisplay();
  if (document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const main = document.getElementById('main-content');
  if (!asset || !main || main.querySelector('.vehicle-settings-btn')) return;
  document.querySelectorAll('.vehicle-settings-bar').forEach(el => el.remove());
  const wrap = document.createElement('div');
  wrap.className = 'mt-6 flex justify-center';
  wrap.innerHTML = `<button class="btn-primary vehicle-settings-btn" onclick="openVehicleSettings()">${asset.unitNumber} Settings</button>`;
  main.appendChild(wrap);
}
function openVehicleSettings(tab) {
  const asset = currentAsset();
  if (!asset) return;
  const which = tab || 'display';
  openModal(`<div class="p-5 space-y-4">
    <h2 class="text-lg font-semibold">${asset.unitNumber} Settings</h2>
    <div class="flex gap-2">
      <button class="btn-secondary text-sm" onclick="openVehicleSettings('display')">Display</button>
      <button class="btn-secondary text-sm" onclick="openVehicleSettings('chart')">Chart</button>
      <button class="btn-secondary text-sm" onclick="openVehicleSettings('edit')">Edit vehicle</button>
    </div>
    <div id="vehicle-settings-pane"></div>
  </div>`);
  const pane = document.getElementById('vehicle-settings-pane');
  if (which === 'display' && typeof openAssetDisplaySettings === 'function') {
    openAssetDisplaySettings();
    return;
  }
  if (which === 'chart' && typeof openVehicleDashSettings === 'function') {
    openVehicleDashSettings();
    return;
  }
  if (which === 'edit') openAssetForm(asset.id);
}
setInterval(vehicleSettingsButton, 700);

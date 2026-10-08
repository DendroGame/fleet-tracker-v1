const TILE_OPTS = [
  ['state', 'State', true],
  ['cost', 'Cost per mile or hour', true],
  ['mpg', 'Average MPG', true],
  ['fuelBtn', 'Add fuel button', true],
  ['serviceBtn', 'Add service button', true],
  ['inspectBtn', 'Inspection button', true],
  ['photo', 'Vehicle picture', true]
];
function tileOpt(key) {
  const raw = localStorage.getItem('ft_tile_' + key);
  if (raw === null) return true;
  return raw === '1';
}
function setTileOpt(key, on) {
  localStorage.setItem('ft_tile_' + key, on ? '1' : '0');
  if (typeof showView === 'function') showView('garage');
}
function photoMode() { return localStorage.getItem('ft_photo_mode') || 'icon'; }
function setPhotoMode(mode) {
  localStorage.setItem('ft_photo_mode', mode);
  showView('garage');
}
function assetPhoto(id) {
  try { return JSON.parse(localStorage.getItem('ft_photos') || '{}')[id] || ''; } catch (e) { return ''; }
}
function setAssetPhoto(id, url) {
  const map = JSON.parse(localStorage.getItem('ft_photos') || '{}');
  map[id] = url;
  localStorage.setItem('ft_photos', JSON.stringify(map));
}
function assetFuelType(id) {
  try { return JSON.parse(localStorage.getItem('ft_fuel_types') || '{}')[id] || ''; } catch (e) { return ''; }
}
function setAssetFuelType(id, value) {
  const map = JSON.parse(localStorage.getItem('ft_fuel_types') || '{}');
  map[id] = value;
  localStorage.setItem('ft_fuel_types', JSON.stringify(map));
  applyFuelTab();
}
function applyFuelTab() {
  const btn = document.querySelector('[data-view="fuel"]');
  const a = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!btn) return;
  btn.style.display = a && assetFuelType(a.id) === 'none' ? 'none' : '';
}
function goToService(id) { switchAsset(id); showView('service'); if (typeof openServiceForm === 'function') openServiceForm(); }
function goToInspection(id) { switchAsset(id); showView('inspections'); if (typeof openInspectionForm === 'function') openInspectionForm(); }

const _renderGarageOpts = renderGarage;
renderGarage = function (el) {
  _renderGarageOpts(el);
  (state.assets || []).forEach((a, i) => {
    const card = el.querySelectorAll('.card')[i];
    if (!card) return;
    if (!tileOpt('state')) card.querySelectorAll('.status-badge, .asset-state-line').forEach(n => n.style.display = 'none');
    const stats = card.querySelector('.tile-stats');
    if (stats) {
      const chips = stats.querySelectorAll('span');
      if (chips[0] && !tileOpt('cost')) chips[0].style.display = 'none';
      if (chips[1] && !tileOpt('mpg')) chips[1].style.display = 'none';
      const fuel = stats.querySelector('button');
      if (fuel && !tileOpt('fuelBtn')) fuel.style.display = 'none';
      if (tileOpt('serviceBtn')) {
        const b = document.createElement('button');
        b.className = 'btn-secondary text-xs';
        b.textContent = 'Add service';
        b.onclick = (e) => { e.stopPropagation(); goToService(a.id); };
        stats.appendChild(b);
      }
      if (tileOpt('inspectBtn')) {
        const b = document.createElement('button');
        b.className = 'btn-secondary text-xs';
        b.textContent = 'Inspection';
        b.onclick = (e) => { e.stopPropagation(); goToInspection(a.id); };
        stats.appendChild(b);
      }
    }
    const pic = assetPhoto(a.id);
    if (pic && tileOpt('photo')) {
      if (photoMode() === 'background') {
        card.style.backgroundImage = `linear-gradient(rgba(15,23,42,.82), rgba(15,23,42,.88)), url('${pic}')`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';
      } else {
        const icon = card.querySelector('.text-2xl');
        if (icon) icon.innerHTML = `<img src="${pic}" alt="" class="w-10 h-10 rounded-full object-cover">`;
      }
    }
    const photoBtn = document.createElement('button');
    photoBtn.className = 'btn-secondary text-xs';
    photoBtn.textContent = 'Picture';
    photoBtn.onclick = (e) => { e.stopPropagation(); pickTilePhoto(a.id); };
    const actions = card.querySelector('.mt-4.flex.gap-2');
    if (actions) actions.appendChild(photoBtn);
  });
  applyFuelTab();
};

function pickTilePhoto(id) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setAssetPhoto(id, reader.result); showView('garage'); toast('Picture saved on this device'); };
    reader.readAsDataURL(file);
  };
  input.click();
}

const _openAssetFuel = openAssetForm;
openAssetForm = function (id) {
  _openAssetFuel(id);
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="fuelPreset"]')) return;
  const current = id ? assetFuelType(id) : '';
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">Fuel</label><select name="fuelPreset" class="form-select"><option value="">Choose later</option><option value="none" ${current==='none'?'selected':''}>No fuel</option><option value="Regular">Regular</option><option value="Diesel">Diesel</option><option value="Premium">Premium</option><option value="E85">E85</option></select>`;
  form.insertBefore(row, form.querySelector('.flex.justify-end'));
};
const _saveAssetFuel = saveAsset;
saveAsset = async function (e, id) {
  const preset = e.target.querySelector('[name="fuelPreset"]')?.value || '';
  await _saveAssetFuel.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (asset && preset) setAssetFuelType(asset.id, preset);
};
const _openFuelPreset = openFuelForm;
openFuelForm = function (id) {
  _openFuelPreset(id);
  const a = currentAsset();
  const preset = a ? assetFuelType(a.id) : '';
  const sel = document.querySelector('#modal-content select[name="fuelType"]');
  if (sel && preset && preset !== 'none') sel.value = preset;
};
const _switchFuel = switchAsset;
switchAsset = function (id) { _switchFuel(id); applyFuelTab(); };

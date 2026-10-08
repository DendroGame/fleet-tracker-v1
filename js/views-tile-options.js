function photoModeFor(id) {
  try { return JSON.parse(localStorage.getItem('ft_photo_modes') || '{}')[id] || 'off'; } catch (e) { return 'off'; }
}
function setPhotoModeFor(id, mode) {
  const map = JSON.parse(localStorage.getItem('ft_photo_modes') || '{}');
  map[id] = mode;
  localStorage.setItem('ft_photo_modes', JSON.stringify(map));
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
function tileOpt(key) {
  const raw = localStorage.getItem('ft_tile_' + key);
  if (raw === null) return true;
  return raw === '1';
}
function setTileOpt(key, on) {
  localStorage.setItem('ft_tile_' + key, on ? '1' : '0');
  showView('garage');
}

const _renderGaragePhoto = renderGarage;
renderGarage = function (el) {
  _renderGaragePhoto(el);
  (state.assets || []).forEach((a, i) => {
    const card = el.querySelectorAll('.card')[i];
    if (!card) return;
    if (!tileOpt('state')) card.querySelectorAll('.status-badge, .asset-state-line').forEach(n => n.style.display = 'none');
    const stats = card.querySelector('.tile-stats');
    if (stats) {
      const chips = stats.querySelectorAll('span');
      if (chips[0] && !tileOpt('cost')) chips[0].style.display = 'none';
      if (chips[1] && !tileOpt('mpg')) chips[1].style.display = 'none';
      const fuel = [...stats.querySelectorAll('button')].find(b => /fuel/i.test(b.textContent));
      if (fuel && !tileOpt('fuelBtn')) fuel.style.display = 'none';
      if (tileOpt('serviceBtn') && !stats.querySelector('.svc-btn')) {
        const b = document.createElement('button');
        b.className = 'btn-secondary text-xs svc-btn';
        b.textContent = 'Add service';
        b.onclick = (e) => { e.stopPropagation(); goToService(a.id); };
        stats.appendChild(b);
      }
      if (tileOpt('inspectBtn') && !stats.querySelector('.insp-btn')) {
        const b = document.createElement('button');
        b.className = 'btn-secondary text-xs insp-btn';
        b.textContent = 'Inspection';
        b.onclick = (e) => { e.stopPropagation(); goToInspection(a.id); };
        stats.appendChild(b);
      }
    }
    const pic = assetPhoto(a.id);
    const mode = photoModeFor(a.id);
    if (pic && mode === 'background') {
      card.style.backgroundImage = `linear-gradient(rgba(15,23,42,.82), rgba(15,23,42,.88)), url('${pic}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    }
    if (pic && mode === 'round') {
      const icon = card.querySelector('.text-2xl');
      if (icon) icon.innerHTML = `<img src="${pic}" alt="" class="w-10 h-10 rounded-full object-cover">`;
    }
  });
  applyFuelTab();
};

const _openAssetPhoto = openAssetForm;
openAssetForm = function (id) {
  _openAssetPhoto(id);
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="photoMode"]')) return;
  const mode = id ? photoModeFor(id) : 'off';
  const fuel = id ? assetFuelType(id) : '';
  const row = document.createElement('div');
  row.className = 'space-y-3';
  row.innerHTML = `
    <div>
      <label class="form-label">Picture</label>
      <input name="tilePhoto" type="file" accept="image/*" class="form-input">
    </div>
    <div>
      <label class="form-label">Picture display</label>
      <select name="photoMode" class="form-select">
        <option value="off" ${mode==='off'?'selected':''}>Off</option>
        <option value="round" ${mode==='round'?'selected':''}>Round corner</option>
        <option value="background" ${mode==='background'?'selected':''}>Faded tile background</option>
      </select>
    </div>
    <div>
      <label class="form-label">Fuel</label>
      <select name="fuelPreset" class="form-select">
        <option value="">Choose later</option>
        <option value="none" ${fuel==='none'?'selected':''}>No fuel</option>
        <option value="Regular" ${fuel==='Regular'?'selected':''}>Regular</option>
        <option value="Diesel" ${fuel==='Diesel'?'selected':''}>Diesel</option>
        <option value="Premium" ${fuel==='Premium'?'selected':''}>Premium</option>
        <option value="E85" ${fuel==='E85'?'selected':''}>E85</option>
      </select>
    </div>`;
  form.insertBefore(row, form.querySelector('.flex.justify-end'));
};
const _saveAssetPhoto = saveAsset;
saveAsset = async function (e, id) {
  const mode = e.target.querySelector('[name="photoMode"]')?.value || 'off';
  const preset = e.target.querySelector('[name="fuelPreset"]')?.value || '';
  const file = e.target.querySelector('[name="tilePhoto"]')?.files?.[0];
  await _saveAssetPhoto.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset) return;
  setPhotoModeFor(asset.id, mode);
  if (preset) setAssetFuelType(asset.id, preset);
  if (file) {
    const reader = new FileReader();
    reader.onload = () => { setAssetPhoto(asset.id, reader.result); showView('garage'); };
    reader.readAsDataURL(file);
  }
};

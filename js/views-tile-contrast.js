const TILE_ICONS = { truck: '\u{1F69A}', car: '\u{1F697}', trailer: '\u{1F69B}', excavator: '\u{1F3D7}', tractor: '\u{1F69C}', wrench: '\u{1F527}' };
function iconChoice(asset) {
  return (String(asset?.notes || '').match(/__icon__:([^\n]+)/) || [])[1] || '';
}
function contrastTiles() {
  document.querySelectorAll('#main-content .card').forEach(card => {
    const photo = card.querySelector('.tile-photo');
    if (!photo || photo.style.opacity === '') return;
    if (photo.style.position !== 'absolute' || photo.style.width === '40px') return;
    card.style.color = '#f8fafc';
    card.style.textShadow = '0 1px 2px #000, 0 0 8px #000';
    card.querySelectorAll('button, span, div').forEach(el => {
      if (el.classList.contains('tile-photo')) return;
      el.style.textShadow = '0 1px 2px #000';
    });
    if (!card.querySelector('.tile-scrim')) {
      const scrim = document.createElement('div');
      scrim.className = 'tile-scrim';
      scrim.style.cssText = 'position:absolute;inset:0;background:linear-gradient(rgba(2,6,23,.55), rgba(2,6,23,.72));z-index:0;pointer-events:none';
      card.prepend(scrim);
    }
  });
}
function applyCornerIcon() {
  if (document.getElementById('view-title')?.textContent !== 'Garage') return;
  (state.assets || []).forEach((a, i) => {
    const card = document.querySelectorAll('#main-content .card')[i];
    const icon = card?.querySelector('.text-2xl');
    const choice = iconChoice(a);
    if (!icon || !choice) return;
    if (choice === 'photo') {
      const img = card.querySelector('.tile-photo');
      if (img) icon.innerHTML = `<img src="${img.src}" alt="" class="w-10 h-10 rounded-full object-cover">`;
      return;
    }
    icon.textContent = TILE_ICONS[choice] || choice;
  });
}
function addIconPicker() {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="cornerIcon"]')) return;
  const id = form.dataset.id || '';
  const asset = (state.assets || []).find(a => a.id === id);
  const current = iconChoice(asset);
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">Corner icon</label><select name="cornerIcon" class="form-select"><option value="">Default</option><option value="truck">Truck</option><option value="car">Car</option><option value="trailer">Trailer</option><option value="excavator">Excavator</option><option value="tractor">Tractor</option><option value="wrench">Wrench</option><option value="photo">Use picture</option></select><input name="cornerEmoji" class="form-input mt-2" placeholder="Or type an emoji">`;
  const select = row.querySelector('select');
  if ([...select.options].some(o => o.value === current)) select.value = current;
  else if (current) row.querySelector('[name="cornerEmoji"]').value = current;
  form.insertBefore(row, form.querySelector('.flex.justify-end'));
}
const _openIcon = openAssetForm;
openAssetForm = function (id) {
  _openIcon(id);
  setTimeout(addIconPicker, 0);
  setTimeout(addIconPicker, 250);
};
const _saveIcon = saveAsset;
saveAsset = async function (e, id) {
  const choice = e.target.querySelector('[name="cornerEmoji"]')?.value || e.target.querySelector('[name="cornerIcon"]')?.value || '';
  await _saveIcon.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset || !choice) return;
  asset.notes = String(asset.notes || '').replace(/\n?__icon__:[^\n]*/g, '') + '\n__icon__:' + choice;
  await updateAsset(asset.id, asset);
};
setInterval(() => { contrastTiles(); applyCornerIcon(); }, 800);

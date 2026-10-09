function contrastValue(asset) {
  const found = (String(asset?.notes || '').match(/__contrast__:([^\n]+)/) || [])[1];
  const n = found === undefined ? 16 : Number(found);
  return Math.min(40, Math.max(0, n));
}
function applyContrast() {
  document.querySelectorAll('.tile-scrim').forEach(el => el.remove());
  if (document.getElementById('view-title')?.textContent !== 'Garage') return;
  (state.assets || []).forEach((a, i) => {
    const card = document.querySelectorAll('#main-content .card')[i];
    if (!card) return;
    const photo = card.querySelector('.tile-photo');
    const amount = contrastValue(a);
    const fade = String(Math.max(0.2, 1 - amount / 40));
    if (photo && photo.style.width !== '40px') {
      photo.style.opacity = fade;
      photo.style.zIndex = '0';
      photo.style.pointerEvents = 'none';
      [...card.children].forEach(child => {
        if (child !== photo) { child.style.position = 'relative'; child.style.zIndex = '1'; }
      });
    }
    if (card.style.backgroundImage) card.style.backgroundColor = 'rgba(15,23,42,' + (amount / 40) + ')';
  });
}
function addContrastSlider() {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="tileContrast"]')) return;
  const unit = form.querySelector('[name="unitNumber"]')?.value;
  const asset = (state.assets || []).find(a => a.unitNumber === unit);
  const value = contrastValue(asset);
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">Picture contrast <span id="contrast-num">${value}</span></label><input name="tileContrast" type="range" min="0" max="40" value="${value}" class="w-full">`;
  row.querySelector('input').oninput = (e) => { document.getElementById('contrast-num').textContent = e.target.value; };
  form.insertBefore(row, form.querySelector('.flex.justify-end'));
}
const _openContrast = openAssetForm;
openAssetForm = function () {
  _openContrast.apply(this, arguments);
  setTimeout(addContrastSlider, 200);
};
const _saveContrast = saveAsset;
saveAsset = async function (e, id) {
  const value = e.target.querySelector('[name="tileContrast"]')?.value;
  await _saveContrast.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset || value === undefined) return;
  asset.notes = String(asset.notes || '').replace(/\n?__contrast__:[^\n]*/g, '') + '\n__contrast__:' + value;
  await updateAsset(asset.id, asset);
};
setInterval(applyContrast, 800);

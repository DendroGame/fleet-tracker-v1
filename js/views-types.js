const ASSET_TYPES = ['Truck', 'Car', 'Trailer', 'Light Equipment', 'Heavy Equipment', 'Other'];
function assetTypeLabel(a) {
  try {
    const custom = JSON.parse(localStorage.getItem('ft_custom_types') || '{}')[a.id];
    if (custom) return custom;
  } catch (e) {}
  const map = { vehicle: 'Truck', machine: 'Heavy Equipment', trailer: 'Trailer' };
  return ASSET_TYPES.includes(a.type) ? a.type : (map[a.type] || a.type || 'Other');
}
function setCustomType(id, label) {
  const map = JSON.parse(localStorage.getItem('ft_custom_types') || '{}');
  if (label) map[id] = label; else delete map[id];
  localStorage.setItem('ft_custom_types', JSON.stringify(map));
}
const _openType = openAssetForm;
openAssetForm = function (id) {
  _openType(id);
  const sel = document.querySelector('#modal-content select[name="type"]');
  if (!sel || sel.dataset.ready) return;
  sel.dataset.ready = '1';
  const a = id ? state.assets.find(x => x.id === id) : null;
  const current = a ? assetTypeLabel(a) : 'Truck';
  const isCustom = a && !ASSET_TYPES.includes(current);
  sel.innerHTML = ASSET_TYPES.map(t => `<option ${current===t?'selected':''}>${t}</option>`).join('') + `<option value="custom" ${isCustom?'selected':''}>Custom</option>`;
  const custom = document.createElement('input');
  custom.name = 'customType';
  custom.className = 'form-input mt-2';
  custom.placeholder = 'Custom type';
  custom.value = isCustom ? current : '';
  custom.style.display = isCustom ? '' : 'none';
  sel.after(custom);
  sel.onchange = () => { custom.style.display = sel.value === 'custom' ? '' : 'none'; };
};
const _saveType = saveAsset;
saveAsset = async function (e, id) {
  const sel = e.target.querySelector('[name="type"]');
  const custom = e.target.querySelector('[name="customType"]')?.value?.trim();
  if (sel && sel.value === 'custom' && custom) sel.value = 'vehicle';
  await _saveType.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (asset) setCustomType(asset.id, sel && sel.value === 'vehicle' && custom ? custom : (sel && sel.value !== 'vehicle' ? '' : custom));
};
const _renderType = renderGarage;
renderGarage = function (el) {
  _renderType(el);
  (state.assets || []).forEach((a, i) => {
    const card = el.querySelectorAll('.card')[i];
    if (!card || card.querySelector('.type-line')) return;
    const line = document.createElement('div');
    line.className = 'type-line text-xs text-slate-400 mt-1';
    line.textContent = assetTypeLabel(a);
    const block = card.querySelector('.mt-3');
    if (block) block.appendChild(line);
  });
};

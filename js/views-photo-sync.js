function notePart(asset, key) {
  return (String(asset?.notes || '').match(new RegExp(key + ':([^\\n]+)')) || [])[1] || '';
}
function withNote(notes, key, value) {
  return String(notes || '').replace(new RegExp('\\n?' + key + ':[^\\n]*'), '') + '\n' + key + ':' + value;
}
function applyTilePhoto(card, asset) {
  const key = notePart(asset, '__pkey__');
  const mode = notePart(asset, '__pmode__') || 'off';
  if (!card || !key || mode === 'off') return;
  const url = API_BASE + '/api/files/' + encodeURIComponent(key);
  if (mode === 'background') {
    card.style.backgroundImage = `linear-gradient(rgba(15,23,42,.72), rgba(15,23,42,.82)), url('${url}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
  } else if (mode === 'round') {
    const icon = card.querySelector('.text-2xl') || card.querySelector('img')?.parentElement;
    if (icon) icon.innerHTML = `<img src="${url}" alt="" class="w-10 h-10 rounded-full object-cover">`;
  }
}
const _renderPhotoSync = renderGarage;
renderGarage = function (el) {
  const result = _renderPhotoSync(el);
  const paint = () => (state.assets || []).forEach((a, i) => applyTilePhoto(el.querySelectorAll('.card')[i], a));
  paint();
  setTimeout(paint, 400);
  return result;
};
const _savePhotoSync = saveAsset;
saveAsset = async function (e, id) {
  const mode = e.target.querySelector('[name="photoMode"]')?.value || 'off';
  const file = e.target.querySelector('[name="tilePhoto"]')?.files?.[0];
  await _savePhotoSync.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset) return;
  let key = notePart(asset, '__pkey__');
  if (file) {
    const data = await fileToBase64(file);
    const res = await api('/api/files', { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type || 'image/jpeg', data, unit_number: asset.unitNumber || 'UNASSIGNED', category: 'Garage', record_id: asset.id }) });
    key = res.key;
  }
  if (key || mode) {
    asset.notes = withNote(withNote(asset.notes, '__pmode__', mode), '__pkey__', key);
    await updateAsset(asset.id, asset);
    showView('garage');
  }
};

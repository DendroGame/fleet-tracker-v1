let garageFiles = [];
async function loadGarageFiles() {
  try { garageFiles = await api('/api/files'); } catch (e) { garageFiles = []; }
}
function fileKey(row) { return row?.r2_key || row?.key || row?.path || ''; }
function photoForUnit(unit) {
  const rows = garageFiles.filter(f => String(f.unit_number || f.unit || '') === String(unit) && /garage/i.test(f.category || ''));
  return fileKey(rows[rows.length - 1]);
}
function paintTilePhoto(card, asset) {
  if (!card || !asset) return;
  const fromNotes = (String(asset.notes || '').match(/__pkey__:([^\n]+)/) || [])[1] || '';
  const mode = (String(asset.notes || '').match(/__pmode__:([^\n]+)/) || [])[1] || (typeof photoModeFor === 'function' ? photoModeFor(asset.id) : 'background');
  const key = fromNotes || photoForUnit(asset.unitNumber);
  if (!key || mode === 'off') return;
  const url = API_BASE + '/api/files/' + key.split('/').map(encodeURIComponent).join('/');
  let img = card.querySelector('.tile-photo');
  if (!img) {
    img = document.createElement('img');
    img.className = 'tile-photo';
    img.alt = '';
    card.style.position = 'relative';
    card.style.overflow = 'hidden';
    card.prepend(img);
  }
  img.src = url;
  img.style.cssText = mode === 'round'
    ? 'width:40px;height:40px;border-radius:999px;object-fit:cover;position:absolute;top:12px;left:12px;z-index:2'
    : 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.45;z-index:0;pointer-events:none';
  [...card.children].forEach(child => { if (child !== img) child.style.position = 'relative'; child.style.zIndex = '1'; });
}
async function paintAllTilePhotos() {
  if (document.getElementById('view-title')?.textContent !== 'Garage') return;
  if (!garageFiles.length) await loadGarageFiles();
  (state.assets || []).forEach((a, i) => paintTilePhoto(document.querySelectorAll('#main-content .card')[i], a));
}
const _saveShowPhoto = saveAsset;
saveAsset = async function (e, id) {
  const mode = e.target.querySelector('[name="photoMode"]')?.value || 'background';
  const file = e.target.querySelector('[name="tilePhoto"]')?.files?.[0];
  await _saveShowPhoto.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset) return;
  let key = (String(asset.notes || '').match(/__pkey__:([^\n]+)/) || [])[1] || '';
  if (file) {
    const data = await fileToBase64(file);
    const res = await api('/api/files', { method: 'POST', body: JSON.stringify({ filename: file.name, contentType: file.type || 'image/jpeg', data, unit_number: asset.unitNumber, category: 'Garage', record_id: asset.id }) });
    key = res.key || res.r2_key || key;
    garageFiles.push({ unit_number: asset.unitNumber, category: 'Garage', r2_key: key });
  }
  asset.notes = String(asset.notes || '').replace(/\n?__pkey__:[^\n]*/g, '').replace(/\n?__pmode__:[^\n]*/g, '') + '\n__pkey__:' + key + '\n__pmode__:' + mode;
  await updateAsset(asset.id, asset);
  toast('Picture linked to ' + asset.unitNumber);
  showView('garage');
  setTimeout(paintAllTilePhotos, 300);
};
setInterval(paintAllTilePhotos, 1500);

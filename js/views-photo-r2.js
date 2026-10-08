let fileIndex = [];
async function loadFileIndex() {
  try { fileIndex = await api('/api/files'); } catch (e) { fileIndex = []; }
}
function latestGaragePhoto(unit) {
  const rows = fileIndex.filter(f => f.unit_number === unit && f.category === 'Garage');
  return rows[rows.length - 1] || null;
}
async function uploadTilePhoto(file, asset) {
  const data = await fileToBase64(file);
  const res = await api('/api/files', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'image/jpeg',
      data,
      unit_number: asset.unitNumber || 'UNASSIGNED',
      category: 'Garage',
      record_id: asset.id
    })
  });
  fileIndex.push({ unit_number: asset.unitNumber, category: 'Garage', r2_key: res.key });
  return res.key;
}
const _renderR2 = renderGarage;
renderGarage = async function (el) {
  _renderR2(el);
  if (!fileIndex.length) await loadFileIndex();
  (state.assets || []).forEach((a, i) => {
    const card = el.querySelectorAll('.card')[i];
    const row = latestGaragePhoto(a.unitNumber);
    if (!card || !row) return;
    const mode = typeof photoModeFor === 'function' ? photoModeFor(a.id) : 'round';
    const url = API_BASE + '/api/files/' + encodeURIComponent(row.r2_key);
    if (mode === 'background') {
      card.style.backgroundImage = `linear-gradient(rgba(15,23,42,.82), rgba(15,23,42,.88)), url('${url}')`;
      card.style.backgroundSize = 'cover';
      card.style.backgroundPosition = 'center';
    } else if (mode === 'round') {
      const icon = card.querySelector('.text-2xl');
      if (icon) icon.innerHTML = `<img src="${url}" alt="" class="w-10 h-10 rounded-full object-cover">`;
    }
  });
};
const _saveR2 = saveAsset;
saveAsset = async function (e, id) {
  const file = e.target.querySelector('[name="tilePhoto"]')?.files?.[0];
  await _saveR2.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (file && asset) {
    try {
      toast('Uploading picture to R2…');
      await uploadTilePhoto(file, asset);
      toast('Picture saved to ' + asset.unitNumber + '/Garage/');
      showView('garage');
    } catch (err) {
      toast('R2 upload failed: ' + err.message, 'err');
    }
  }
};

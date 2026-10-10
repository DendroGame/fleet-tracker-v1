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
const _saveR2 = saveAsset;
saveAsset = async function (e, id) {
  const file = e.target.querySelector('[name="tilePhoto"]')?.files?.[0];
  await _saveR2.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (file && asset) {
    try {
      toast('Uploading picture to R2…');
      const key = await uploadTilePhoto(file, asset);
      asset.notes = String(asset.notes || '').replace(/\n?__pkey__:[^\n]*/g, '') + '\n__pkey__:' + key;
      await updateAsset(asset.id, asset);
      toast('Picture saved to ' + asset.unitNumber + '/Garage/');
      showView('garage');
    } catch (err) {
      toast('R2 upload failed: ' + err.message, 'err');
    }
  }
};

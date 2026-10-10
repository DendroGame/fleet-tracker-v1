async function compressPhoto(file) {
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = URL.createObjectURL(file);
  });
  const max = 800;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.6));
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
}
let fileIndex = [];
async function loadFileIndex() {
  try { fileIndex = await api('/api/files'); } catch (e) { fileIndex = []; }
}
async function uploadTilePhoto(file, asset) {
  const small = await compressPhoto(file);
  const data = await fileToBase64(small);
  const res = await api('/api/files', {
    method: 'POST',
    body: JSON.stringify({
      filename: small.name,
      contentType: 'image/jpeg',
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
      toast('Compressing and uploading picture…');
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

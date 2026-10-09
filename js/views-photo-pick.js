async function photoChoices(asset) {
  const files = await api('/api/files').catch(() => []);
  return files.filter(f => String(f.unit_number || '') === String(asset.unitNumber) && /garage/i.test(f.category || ''));
}
async function showPhotoPicker() {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('.photo-pick')) return;
  const id = new URLSearchParams(location.hash).get('id');
  const title = document.querySelector('#modal-content h2')?.textContent || '';
  const unit = form.querySelector('[name="unitNumber"]')?.value;
  const asset = (state.assets || []).find(a => a.unitNumber === unit);
  if (!asset) return;
  const current = (String(asset.notes || '').match(/__pkey__:([^\n]+)/) || [])[1] || '';
  const rows = await photoChoices(asset);
  const box = document.createElement('div');
  box.className = 'photo-pick space-y-2';
  box.innerHTML = `<label class="form-label">Saved pictures</label><div class="flex flex-wrap gap-2" id="photo-pick-row">${rows.length ? '' : '<span class="text-sm text-slate-400">No saved pictures yet</span>'}</div>`;
  form.insertBefore(box, form.querySelector('.flex.justify-end'));
  const row = box.querySelector('#photo-pick-row');
  for (const file of rows) {
    const key = file.r2_key || file.key || '';
    if (!key || typeof fileBlob !== 'function') continue;
    const url = await fileBlob(key);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'rounded-lg overflow-hidden border-2 ' + (key === current ? 'border-sky-400' : 'border-transparent');
    btn.innerHTML = `<img src="${url}" alt="" class="w-16 h-16 object-cover">`;
    btn.onclick = () => chooseTilePhoto(asset.id, key);
    row.appendChild(btn);
  }
}
async function chooseTilePhoto(id, key) {
  const asset = state.assets.find(a => a.id === id);
  if (!asset) return;
  asset.notes = String(asset.notes || '').replace(/\n?__pkey__:[^\n]*/g, '') + '\n__pkey__:' + key;
  await updateAsset(asset.id, asset);
  toast('Tile picture updated');
  closeModal();
  showView('garage');
}
const _openPick = openAssetForm;
openAssetForm = function () {
  _openPick.apply(this, arguments);
  setTimeout(showPhotoPicker, 300);
};

function setNote(notes, key, value) {
  const clean = String(notes || '').replace(new RegExp('\\n?' + key + ':[^\\n]*', 'g'), '');
  if (value === '' || value == null) return clean;
  return clean + '\n' + key + ':' + value;
}
function noteValue(notes, key) {
  return (String(notes || '').match(new RegExp(key + ':([^\\n]+)')) || [])[1] || '';
}
const _saveVehicle = saveAsset;
saveAsset = async function (e, id) {
  const form = e.target;
  const visibleNotes = form.querySelector('[name="notes"]')?.value || '';
  const acq = form.querySelector('[name="acquisitionCost"]')?.value || '';
  const mode = form.querySelector('[name="calcMode"]')?.value || '';
  const photoMode = form.querySelector('[name="photoMode"]')?.value || '';
  const contrast = form.querySelector('[name="tileContrast"]')?.value || '';
  const icon = form.querySelector('[name="cornerEmoji"]')?.value || form.querySelector('[name="cornerIcon"]')?.value || '';
  await _saveVehicle.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset) return;
  let notes = visibleNotes.replace(/\n?__[a-z]+__:[^\n]*/gi, '').trim();
  const keep = ['__pkey__', '__pmode__', '__contrast__', '__icon__', '__ft__'];
  keep.forEach(key => {
    const old = noteValue(asset.notes, key);
    if (old) notes = setNote(notes, key, old);
  });
  if (acq !== '') notes = setNote(notes, '__acq__', acq);
  if (mode === 'mile' || mode === 'hour') notes = setNote(notes, '__calc__', mode);
  if (photoMode) notes = setNote(notes, '__pmode__', photoMode);
  if (contrast !== '') notes = setNote(notes, '__contrast__', contrast);
  if (icon) notes = setNote(notes, '__icon__', icon);
  asset.notes = notes;
  if (acq !== '') asset.purchaseCost = Number(acq);
  await updateAsset(asset.id, asset);
  toast('Vehicle saved');
};

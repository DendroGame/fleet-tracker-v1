function applyContrast() {
  if (document.getElementById('view-title')?.textContent !== 'Garage') return;
  (state.assets || []).forEach((a, i) => {
    const card = document.querySelectorAll('#main-content .card')[i];
    const photo = card?.querySelector('.tile-photo');
    if (!photo || photo.style.width === '40px') return;
    photo.style.opacity = '0.5';
    photo.style.zIndex = '0';
    photo.style.pointerEvents = 'none';
  });
}
const _saveFade = saveAsset;
saveAsset = async function (e, id) {
  await _saveFade.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset || !e.target.querySelector('[name="tilePhoto"]')?.files?.[0]) return;
  asset.notes = String(asset.notes || '').replace(/\n?__contrast__:[^\n]*/g, '').replace(/\n?__pmode__:[^\n]*/g, '') + '\n__contrast__:20\n__pmode__:background';
  await updateAsset(asset.id, asset);
};
setInterval(applyContrast, 800);

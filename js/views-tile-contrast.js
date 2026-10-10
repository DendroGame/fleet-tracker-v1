function applyContrast() {
  document.querySelectorAll('.tile-scrim, [name="tileContrast"]')?.forEach?.(el => {
    if (el.name === 'tileContrast') el.closest('div')?.remove();
  });
  if (document.getElementById('view-title')?.textContent !== 'Garage') return;
  (state.assets || []).forEach((a, i) => {
    const card = document.querySelectorAll('#main-content .card')[i];
    const photo = card?.querySelector('.tile-photo');
    if (!photo || photo.style.width === '40px') return;
    photo.style.opacity = '0.75';
    photo.style.zIndex = '0';
    photo.style.pointerEvents = 'none';
    [...card.children].forEach(child => {
      if (child !== photo) { child.style.position = 'relative'; child.style.zIndex = '1'; }
    });
  });
}
const _saveFade = saveAsset;
saveAsset = async function (e, id) {
  await _saveFade.apply(this, arguments);
  const asset = id ? state.assets.find(a => a.id === id) : state.assets[state.assets.length - 1];
  if (!asset || !e.target.querySelector('[name="tilePhoto"]')?.files?.[0]) return;
  asset.notes = String(asset.notes || '').replace(/\n?__contrast__:[^\n]*/g, '').replace(/\n?__pmode__:[^\n]*/g, '') + '\n__contrast__:10\n__pmode__:background';
  await updateAsset(asset.id, asset);
};
setInterval(applyContrast, 800);

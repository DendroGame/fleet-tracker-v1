/* Hide the Hours and Odometer tiles, not only the text under the vehicle name. */
const _tagHours = tagDashTiles;
tagDashTiles = function () {
  _tagHours();
  document.querySelectorAll('#main-content .card').forEach(card => {
    const label = (card.querySelector('.uppercase, .text-xs')?.textContent || card.textContent || '').toLowerCase();
    if (label.includes('hour')) card.dataset.tile = 'hours';
    else if (label.trim().startsWith('odometer') || label.includes('odometer')) card.dataset.tile = 'odometer';
  });
};
const _applyHours = applyAssetSettings;
applyAssetSettings = function () {
  tagDashTiles();
  const asset = currentAsset();
  if (!asset) return;
  const s = readAssetSettings(asset);
  document.querySelectorAll('#main-content [data-tile]').forEach(card => {
    const key = card.dataset.tile;
    if (s[key] === false) card.style.display = 'none';
  });
};

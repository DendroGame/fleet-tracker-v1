/* Build the row from visible tiles only, so a hidden Hours tile does not leave a gap. */
function isSummaryTile(card) {
  const label = (card.querySelector('.uppercase, .text-xs')?.textContent || '').trim().toLowerCase();
  return ['status', 'odometer', 'hours', 'open reminders', 'service cost', 'fuel spend', 'fuel cost', 'avg mpg', 'mpg'].includes(label);
}
function fillLeftToRight() {
  const main = document.getElementById('main-content');
  if (!main || document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const settings = asset && typeof readAssetSettings === 'function' ? readAssetSettings(asset) : {};
  const cards = [...main.querySelectorAll('.card')].filter(isSummaryTile).filter(card => {
    const key = card.dataset.tile;
    return !key || settings[key] !== false;
  });
  if (!cards.length) return;
  let grid = document.getElementById('dash-tile-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'dash-tile-grid';
  }
  const heading = [...main.querySelectorAll('h2')].find(h => /unit-/i.test(h.textContent));
  if (heading) heading.after(grid);
  else main.prepend(grid);
  cards.forEach(card => grid.appendChild(card));
  const mobile = window.innerWidth < 900;
  const cols = mobile ? 2 : Math.min(cards.length, 4);
  grid.style.cssText = `display:grid;width:100%;gap:16px;margin:12px 0 24px;grid-template-columns:repeat(${cols}, minmax(0, 1fr));`;
}
layoutTiles = fillLeftToRight;
tileGrid = function () { fillLeftToRight(); };
setInterval(fillLeftToRight, 1200);

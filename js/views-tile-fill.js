/* Visible tiles fill the row. Drag one onto another to reorder. */
let draggingTile = false;
function isSummaryTile(card) {
  const label = (card.querySelector('.uppercase, .text-xs')?.textContent || '').trim().toLowerCase();
  return ['status', 'odometer', 'hours', 'open reminders', 'service cost', 'fuel spend', 'fuel cost', 'avg mpg', 'mpg'].includes(label);
}
function tileKey(card) {
  return card.dataset.tile || (card.querySelector('.uppercase, .text-xs')?.textContent || '').trim().toLowerCase();
}
function fillLeftToRight() {
  if (draggingTile) return;
  const main = document.getElementById('main-content');
  if (!main || document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const settings = asset && typeof readAssetSettings === 'function' ? readAssetSettings(asset) : {};
  const order = settings.order || [];
  const cards = [...main.querySelectorAll('.card')].filter(isSummaryTile).filter(card => settings[card.dataset.tile] !== false);
  cards.sort((a, b) => {
    const ia = order.indexOf(tileKey(a));
    const ib = order.indexOf(tileKey(b));
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
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
  const mobile = window.innerWidth < 900;
  grid.style.cssText = `display:grid;width:100%;gap:16px;margin:12px 0 24px;grid-template-columns:repeat(${mobile ? 2 : Math.min(cards.length, 4)}, minmax(0, 1fr));`;
  cards.forEach(card => {
    grid.appendChild(card);
    card.draggable = true;
    card.style.cursor = 'grab';
    card.ondragstart = () => { draggingTile = true; card.dataset.drag = tileKey(card); };
    card.ondragend = () => { draggingTile = false; };
    card.ondragover = (e) => e.preventDefault();
    card.ondrop = async (e) => {
      e.preventDefault();
      draggingTile = false;
      const from = [...grid.children].find(el => tileKey(el) === e.dataTransfer.getData('text/plain') || el.dataset.drag);
      if (from && from !== card) grid.insertBefore(from, card);
      if (!asset) return;
      const next = readAssetSettings(asset);
      next.order = [...grid.children].map(tileKey);
      asset.notes = notesWithSettings(asset, next);
      try { await updateAsset(asset.id, asset); } catch (err) {}
      toast('Tile order saved');
    };
    card.ondragstart = (e) => {
      draggingTile = true;
      card.dataset.drag = tileKey(card);
      e.dataTransfer.setData('text/plain', tileKey(card));
    };
  });
}
layoutTiles = fillLeftToRight;
tileGrid = function () { fillLeftToRight(); };
setInterval(fillLeftToRight, 1500);

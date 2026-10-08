/* Every dashboard card can be dragged. Visible ones fill the width. */
let draggingTile = false;
function tileKey(card) {
  if (card.dataset.tile) return card.dataset.tile;
  const label = (card.querySelector('h3, .uppercase, .text-sm, .text-xs')?.textContent || card.textContent || '').trim().toLowerCase().slice(0, 24);
  card.dataset.tile = label.replace(/\s+/g, '-');
  return card.dataset.tile;
}
function fillLeftToRight() {
  if (draggingTile) return;
  const main = document.getElementById('main-content');
  if (!main || document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const settings = asset && typeof readAssetSettings === 'function' ? readAssetSettings(asset) : {};
  const order = settings.order || [];
  const cards = [...main.querySelectorAll('.card')].filter(card => card.id !== 'dash-tile-grid' && settings[card.dataset.tile] !== false);
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
  grid.style.cssText = `display:grid;width:100%;gap:16px;margin:12px 0 24px;grid-template-columns:repeat(${mobile ? 1 : 2}, minmax(0, 1fr));`;
  cards.forEach(card => {
    grid.appendChild(card);
    card.draggable = true;
    card.style.cursor = 'grab';
    card.ondragstart = (e) => {
      draggingTile = true;
      e.dataTransfer.setData('text/plain', tileKey(card));
    };
    card.ondragend = () => { draggingTile = false; };
    card.ondragover = (e) => e.preventDefault();
    card.ondrop = async (e) => {
      e.preventDefault();
      draggingTile = false;
      const key = e.dataTransfer.getData('text/plain');
      const from = [...grid.children].find(el => tileKey(el) === key);
      if (from && from !== card) grid.insertBefore(from, card);
      if (!asset) return;
      const next = readAssetSettings(asset);
      next.order = [...grid.children].map(tileKey);
      asset.notes = notesWithSettings(asset, next);
      try { await updateAsset(asset.id, asset); } catch (err) {}
      toast('Tile order saved');
    };
  });
}
layoutTiles = fillLeftToRight;
tileGrid = function () { fillLeftToRight(); };
setInterval(fillLeftToRight, 1500);

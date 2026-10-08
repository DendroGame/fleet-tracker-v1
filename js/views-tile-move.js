/* Let dashboard tiles reflow and be dragged. Order is saved on the vehicle. */
function tileGrid() {
  const cards = [...document.querySelectorAll('#main-content [data-tile]')];
  if (!cards.length) return;
  let grid = document.getElementById('dash-tile-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'dash-tile-grid';
    grid.className = 'grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4';
    cards[0].parentElement.insertBefore(grid, cards[0]);
  }
  const asset = currentAsset();
  const order = asset ? (readAssetSettings(asset).order || []) : [];
  cards.sort((a, b) => {
    const ia = order.indexOf(a.dataset.tile);
    const ib = order.indexOf(b.dataset.tile);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  cards.forEach(card => {
    card.draggable = true;
    card.classList.add('cursor-move');
    grid.appendChild(card);
    card.ondragstart = (e) => { e.dataTransfer.setData('text/plain', card.dataset.tile); };
    card.ondragover = (e) => e.preventDefault();
    card.ondrop = async (e) => {
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain');
      const moving = grid.querySelector(`[data-tile="${from}"]`);
      if (moving && moving !== card) grid.insertBefore(moving, card);
      const next = [...grid.querySelectorAll('[data-tile]')].map(el => el.dataset.tile);
      const settings = readAssetSettings(asset);
      settings.order = next;
      asset.notes = notesWithSettings(asset, settings);
      try { await updateAsset(asset.id, asset); } catch (err) {}
      toast('Tile order saved');
    };
  });
}
const _applyMove = applyAssetSettings;
applyAssetSettings = function () {
  _applyMove();
  tileGrid();
};

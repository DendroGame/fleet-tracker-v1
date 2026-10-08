/* Desktop tiles fill the width. Mobile tiles stay compact. */
function layoutTiles() {
  const grid = document.getElementById('dash-tile-grid');
  if (!grid) return;
  const mobile = window.innerWidth < 768;
  grid.style.display = 'grid';
  grid.style.width = '100%';
  grid.style.gap = mobile ? '8px' : '16px';
  grid.style.gridTemplateColumns = mobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(220px, 1fr))';
  grid.querySelectorAll('[data-tile]').forEach(card => {
    card.style.minHeight = mobile ? '88px' : '140px';
    card.style.padding = mobile ? '10px' : '18px';
  });
}
const _gridLayout = tileGrid;
tileGrid = function () {
  _gridLayout();
  layoutTiles();
};
window.addEventListener('resize', layoutTiles);

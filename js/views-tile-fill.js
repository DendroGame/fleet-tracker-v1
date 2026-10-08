/* Place dashboard tiles left to right. Four across on desktop, two on a phone. */
function fillLeftToRight() {
  const main = document.getElementById('main-content');
  if (!main || document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const cards = [...main.querySelectorAll('.card')].filter(card => {
    const t = (card.textContent || '').toLowerCase();
    return /status|odometer|hour|reminder|service cost|fuel spend|fuel cost|mpg/.test(t);
  });
  if (!cards.length) return;
  let grid = document.getElementById('dash-tile-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'dash-tile-grid';
    main.insertBefore(grid, cards[0]);
  }
  cards.forEach(card => {
    if (card.style.display === 'none') return;
    grid.appendChild(card);
  });
  const mobile = window.innerWidth < 768;
  grid.style.cssText = 'display:grid;width:100%;gap:12px;margin:12px 0 20px;grid-template-columns:' + (mobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))');
  [...grid.children].forEach(card => {
    card.style.width = '100%';
    card.style.minHeight = mobile ? '92px' : '120px';
    card.style.margin = '0';
  });
}
const _layoutFill = layoutTiles;
layoutTiles = function () { fillLeftToRight(); };
setInterval(fillLeftToRight, 800);

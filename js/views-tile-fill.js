/* Full-width left-to-right tiles. Other layout scripts are ignored. */
function isSummaryTile(card) {
  const label = (card.querySelector('.uppercase, .text-xs')?.textContent || '').trim().toLowerCase();
  return ['status', 'odometer', 'hours', 'open reminders', 'service cost', 'fuel spend', 'fuel cost', 'avg mpg', 'mpg'].includes(label);
}
function fillLeftToRight() {
  const main = document.getElementById('main-content');
  if (!main || document.getElementById('view-title')?.textContent !== 'Dashboard') return;
  const cards = [...main.querySelectorAll('.card')].filter(isSummaryTile);
  if (!cards.length) return;
  let grid = document.getElementById('dash-tile-grid');
  if (!grid) {
    grid = document.createElement('div');
    grid.id = 'dash-tile-grid';
  }
  const title = main.querySelector('h2');
  if (title && title.nextSibling) main.insertBefore(grid, title.nextSibling);
  else main.insertBefore(grid, main.children[2] || null);
  cards.forEach(card => { if (card.style.display !== 'none') grid.appendChild(card); });
  const mobile = window.innerWidth < 900;
  grid.style.setProperty('display', 'grid', 'important');
  grid.style.setProperty('width', '100%', 'important');
  grid.style.setProperty('max-width', 'none', 'important');
  grid.style.setProperty('grid-template-columns', mobile ? '1fr 1fr' : 'repeat(4, minmax(0, 1fr))', 'important');
  grid.style.setProperty('gap', '16px', 'important');
  grid.style.setProperty('margin', '12px 0 24px', 'important');
  [...grid.children].forEach(card => {
    card.style.setProperty('width', '100%', 'important');
    card.style.setProperty('max-width', 'none', 'important');
    card.style.setProperty('min-height', mobile ? '100px' : '140px', 'important');
  });
}
layoutTiles = fillLeftToRight;
tileGrid = function () { fillLeftToRight(); };
setInterval(fillLeftToRight, 1000);

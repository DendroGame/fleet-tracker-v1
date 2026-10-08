/* Readable left-to-right tiles. Charts stay below. */
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
    main.insertBefore(grid, cards[0]);
  }
  cards.forEach(card => { if (card.style.display !== 'none') grid.appendChild(card); });
  const mobile = window.innerWidth < 768;
  grid.style.cssText = 'display:grid;width:100%;gap:16px;margin:16px 0 24px;grid-template-columns:' + (mobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(240px, 1fr))');
  [...grid.children].forEach(card => {
    card.style.width = 'auto';
    card.style.minWidth = '0';
    card.style.minHeight = mobile ? '96px' : '130px';
    card.style.overflow = 'hidden';
  });
}

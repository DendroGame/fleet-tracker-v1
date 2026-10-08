function wireDashTiles() {
  const main = document.getElementById('main-content');
  if (!main) return;
  main.querySelectorAll('.card').forEach(card => {
    const text = (card.textContent || '').toLowerCase();
    let view = '';
    if (text.includes('service spend')) {
      card.innerHTML = card.innerHTML.replace(/Service Spend/ig, 'Service cost');
      view = 'service';
    } else if (text.includes('service cost')) view = 'service';
    else if (text.includes('fuel spend') || text.includes('fuel cost')) view = 'fuel';
    else if (text.includes('status') || text.includes('state of') || text.includes('asset state')) view = 'inspections';
    else if (text.includes('reminder')) view = 'reminders';
    if (!view || card.dataset.wired) return;
    card.dataset.wired = view;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => showView(view));
  });
}
const _renderDashLinks = renderDashboard;
renderDashboard = function (el) {
  _renderDashLinks(el);
  wireDashTiles();
};

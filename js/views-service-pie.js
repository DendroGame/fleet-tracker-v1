function servicePie() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const rows = (state.serviceRecords || []).filter(r => !asset || r.assetId === asset.id);
  const sum = (type) => rows.filter(r => (r.type || '') === type).reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const card = [...document.querySelectorAll('#main-content .card')].find(c => /total cost|service cost/i.test(c.textContent) && !/recent/i.test(c.textContent));
  if (!card || card.querySelector('canvas')) return;
  const canvas = document.createElement('canvas');
  canvas.height = 140;
  card.appendChild(canvas);
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Service', 'Repairs', 'Upgrades', 'Insurance', 'Taxes', 'Subscriptions'],
      datasets: [{ data: [sum('service'), sum('repair'), sum('upgrade'), sum('insurance'), sum('taxes'), sum('subscriptions')], backgroundColor: ['#38bdf8', '#f59e0b', '#a78bfa', '#34d399', '#fb7185', '#22d3ee'] }]
    },
    options: { plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', boxWidth: 10 } } } }
  });
}
const _renderPie = renderDashboard;
renderDashboard = function (el) {
  _renderPie(el);
  setTimeout(servicePie, 300);
};

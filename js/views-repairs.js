function renderRepairs(el) {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const rows = (state.serviceRecords || []).filter(r => r.type === 'repair' && (!asset || r.assetId === asset.id));
  el.innerHTML = `<div class="flex justify-between mb-4"><p class="text-sm text-slate-400">${rows.length} repairs</p><button class="btn-primary" onclick="openServiceForm()">Add repair</button></div>${rows.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Date</th><th>Description</th><th>Cost</th></tr></thead><tbody>${rows.map(r => `<tr><td>${r.date||''}</td><td>${r.description||''}</td><td>${formatCurrency(r.cost)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="text-sm text-slate-500">No repairs yet. Add one from Service and set the type to repair.</p>'}`;
}
if (typeof VIEW_META === 'object') VIEW_META.repairs = { title: 'Repairs', sub: 'Repair records' };
const _showRepairs = showView;
showView = function (name) {
  if (name === 'repairs') {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === 'repairs'));
    document.getElementById('view-title').textContent = 'Repairs';
    document.getElementById('view-subtitle').textContent = 'Repair records';
    renderRepairs(document.getElementById('main-content'));
    if (window.innerWidth < 768 && typeof closeSidebarMobile === 'function') closeSidebarMobile();
    return;
  }
  return _showRepairs(name);
};
function ensureRepairsNav() {
  if (document.querySelector('[data-view="repairs"]')) return;
  const service = document.querySelector('[data-view="service"]');
  if (!service) return;
  const btn = document.createElement('button');
  btn.className = 'nav-btn';
  btn.dataset.view = 'repairs';
  btn.textContent = 'Repairs';
  btn.onclick = () => showView('repairs');
  service.after(btn);
}
function reminderPie(card) {
  if (card.querySelector('canvas')) return;
  const vis = typeof reminderVisual === 'function' ? reminderVisual() : { good: 1, upcoming: 0, urgent: 0 };
  const canvas = document.createElement('canvas');
  canvas.height = 90;
  card.appendChild(canvas);
  charts.remindersTile = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Good', 'Upcoming', 'Urgent'],
      datasets: [{ data: [vis.good, vis.upcoming, vis.urgent], backgroundColor: ['#34d399', '#f59e0b', '#ef4444'] }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', boxWidth: 10 } } } }
  });
}
const _renderDashPie = renderDashboard;
renderDashboard = function (el) {
  _renderDashPie(el);
  document.querySelectorAll('#main-content .card').forEach(card => {
    const text = (card.textContent || '').toLowerCase();
    if (text.includes('recent service')) {
      card.style.cursor = 'pointer';
      card.onclick = () => showView('service');
    }
    if (text.includes('reminder') && !text.includes('recent')) reminderPie(card);
  });
};
document.addEventListener('DOMContentLoaded', ensureRepairsNav);
setTimeout(ensureRepairsNav, 400);

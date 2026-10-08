function serviceBreakdown() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const rows = (state.serviceRecords || []).filter(r => !asset || r.assetId === asset.id);
  const sum = (type) => rows.filter(r => (r.type || '') === type).reduce((s, r) => s + (Number(r.cost) || 0), 0);
  const card = [...document.querySelectorAll('#main-content .card')].find(c => /service cost/i.test(c.textContent) && !/recent/i.test(c.textContent));
  if (!card || card.querySelector('.svc-break')) return;
  const box = document.createElement('div');
  box.className = 'svc-break mt-2 text-xs text-slate-300 space-y-1';
  box.innerHTML = `<div>Service ${formatCurrency(sum('service'))}</div><div>Repairs ${formatCurrency(sum('repair'))}</div><div>Upgrades ${formatCurrency(sum('upgrade'))}</div>`;
  card.appendChild(box);
}
const _renderBreak = renderDashboard;
renderDashboard = function (el) {
  _renderBreak(el);
  setTimeout(serviceBreakdown, 200);
};

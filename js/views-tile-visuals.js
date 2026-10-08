function reminderVisual() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const rows = (state.reminders || []).filter(r => !asset || r.assetId === asset.id);
  const open = rows.filter(r => !r.completed);
  const urgent = open.filter(r => r.urgency === 'urgent' || r.urgency === 'overdue' || (r.dueDate && new Date(r.dueDate) < new Date())).length;
  const upcoming = open.filter(r => r.urgency === 'soon' || r.urgency === 'high').length;
  const good = Math.max(0, open.length - urgent - upcoming);
  return { good, upcoming, urgent };
}
function moveAssetState() {
  const box = document.getElementById('dash-status')?.closest('.card');
  const main = document.getElementById('main-content');
  if (box && main && document.getElementById('view-title')?.textContent === 'Inspections') main.prepend(box);
  if (box && document.getElementById('view-title')?.textContent === 'Dashboard') box.remove();
}
function paintTiles() {
  const vis = reminderVisual();
  document.querySelectorAll('#main-content .card').forEach(card => {
    const text = (card.textContent || '').toLowerCase();
    if (card.querySelector('.tile-visual')) return;
    let html = '';
    if (text.includes('reminder')) {
      html = `<div class="tile-visual mt-2 flex gap-2 text-xs"><span class="text-emerald-400">Good ${vis.good}</span><span class="text-amber-400">Upcoming ${vis.upcoming}</span><span class="text-red-400">Urgent ${vis.urgent}</span></div>`;
    } else if (text.includes('service cost')) {
      html = '<div class="tile-visual mt-2 h-1.5 rounded bg-slate-800"><div class="h-1.5 rounded bg-sky-500" style="width:70%"></div></div>';
    } else if (text.includes('fuel cost') || text.includes('fuel spend')) {
      html = '<div class="tile-visual mt-2 h-1.5 rounded bg-slate-800"><div class="h-1.5 rounded bg-amber-500" style="width:55%"></div></div>';
    } else if (text.includes('status') || text.includes('state')) {
      const a = currentAsset();
      const label = a && typeof stateLabel === 'function' ? stateLabel(a.status) : 'In Service';
      html = `<div class="tile-visual mt-2 text-xs text-slate-300">${label}</div>`;
    }
    if (html) card.insertAdjacentHTML('beforeend', html);
  });
}
const _renderInspState = renderInspections;
renderInspections = function (el) {
  _renderInspState(el);
  if (!document.getElementById('dash-status')) {
    const asset = currentAsset();
    if (asset && typeof ASSET_STATES !== 'undefined') {
      const box = document.createElement('div');
      box.className = 'card mb-4';
      box.innerHTML = `<div class="text-xs text-slate-400 uppercase mb-2">Asset state</div><div class="flex flex-col sm:flex-row gap-2 sm:items-center"><select id="dash-status" class="form-select">${ASSET_STATES.map(([v, l]) => `<option value="${v}" ${asset.status===v?'selected':''}>${l}</option>`).join('')}</select><button class="btn-primary" onclick="saveDashStatus()">Update state</button></div>`;
      el.prepend(box);
    }
  }
};
const _renderDashVisual = renderDashboard;
renderDashboard = function (el) {
  _renderDashVisual(el);
  const old = document.getElementById('dash-status')?.closest('.card');
  if (old) old.remove();
  paintTiles();
};

const ASSET_STATES = [
  ['in-service', 'In Service'],
  ['inspection-needed', 'Inspection Needed'],
  ['inspection-pending', 'Inspection Pending'],
  ['maintenance-active', 'Maintenance Active'],
  ['due-soon', 'Due Soon'],
  ['out-of-service', 'Out of Service'],
  ['sold', 'Sold']
];

function stateLabel(code) {
  const hit = ASSET_STATES.find(s => s[0] === code);
  return hit ? hit[1] : (code || 'In Service');
}

function stateClass(code) {
  if (code === 'sold') return 'status-oos';
  if (code === 'out-of-service' || code === 'inspection-needed') return 'status-oos';
  if (code === 'inspection-pending' || code === 'maintenance-active' || code === 'due-soon') return 'status-due';
  return 'status-healthy';
}

const _openAssetFormStates = openAssetForm;
openAssetForm = function (id) {
  _openAssetFormStates(id);
  const sel = document.querySelector('#modal-content select[name="status"]');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = ASSET_STATES.map(([v, l]) => `<option value="${v}" ${v === current ? 'selected' : ''}>${l}</option>`).join('');
};

const _renderDashboardStates = renderDashboard;
renderDashboard = function (el) {
  _renderDashboardStates(el);
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!asset) return;
  const box = document.createElement('div');
  box.className = 'card mb-4';
  box.innerHTML = `
    <div class="text-xs text-slate-400 uppercase mb-2">Asset state</div>
    <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
      <select id="dash-status" class="form-select">
        ${ASSET_STATES.map(([v, l]) => `<option value="${v}" ${asset.status === v ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <button class="btn-primary" onclick="saveDashStatus()">Update state</button>
    </div>`;
  el.prepend(box);
};

async function saveDashStatus() {
  const asset = currentAsset();
  if (!asset) return;
  const status = document.getElementById('dash-status').value;
  asset.status = status;
  try {
    await updateAsset(asset.id, asset);
    toast('State saved: ' + stateLabel(status));
    updateStatusBadge();
    showView('dashboard');
  } catch (err) {
    toast(err.message, 'err');
  }
}

const _badge = updateStatusBadge;
updateStatusBadge = function () {
  _badge();
  const badge = document.getElementById('asset-status-badge');
  const a = currentAsset();
  if (!badge || !a) return;
  badge.textContent = stateLabel(a.status);
  badge.className = 'status-badge ml-auto ' + stateClass(a.status);
};

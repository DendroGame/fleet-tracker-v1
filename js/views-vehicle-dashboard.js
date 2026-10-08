function dashKey(id) { return 'ft_dash_' + id; }
function loadDashSettings(id) {
  const base = { months: 12, showMiles: true, showMpg: true, showFuel: true, showHealth: true };
  try { return { ...base, ...JSON.parse(localStorage.getItem(dashKey(id)) || '{}') }; } catch (e) { return base; }
}
function saveDashSettings(id, settings) {
  localStorage.setItem(dashKey(id), JSON.stringify(settings));
}
function monthKeys(n) {
  const out = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: d.toLocaleString('en-US', { month: 'short' }) });
  }
  return out;
}
function monthOf(date) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function vehicleSeries(asset, months) {
  const keys = monthKeys(months);
  const fuels = (state.fuelRecords || []).filter(r => r.assetId === asset.id);
  const inspections = (state.inspections || []).filter(r => r.assetId === asset.id);
  return keys.map(m => {
    const rows = fuels.filter(f => monthOf(f.date) === m.key);
    const miles = rows.reduce((s, f, i, arr) => i === 0 ? s : s + Math.max(0, (arr[i].odometer || 0) - (arr[i - 1].odometer || 0)), 0);
    const gallons = rows.reduce((s, f) => s + (f.gallons || 0), 0);
    const cost = rows.reduce((s, f) => s + (f.totalCost || 0), 0);
    const checks = inspections.filter(r => monthOf(r.date) === m.key);
    const fails = checks.filter(r => String(r.result).toUpperCase() === 'FAIL').length;
    const health = checks.length ? Math.round(((checks.length - fails) / checks.length) * 100) : null;
    return { label: m.label, miles, mpg: gallons ? +(miles / gallons).toFixed(1) : 0, cost, health };
  });
}
function drawChart(id, labels, data, label, color) {
  const ctx = document.getElementById(id);
  if (!ctx || typeof Chart === 'undefined') return;
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label, data, backgroundColor: color }] },
    options: { responsive: true, plugins: { legend: { labels: { color: '#cbd5e1' } } }, scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } } }
  });
}
const _renderVehicleDash = renderDashboard;
renderDashboard = function (el) {
  _renderVehicleDash(el);
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!asset) return;
  const s = loadDashSettings(asset.id);
  const series = vehicleSeries(asset, Number(s.months) || 12);
  const box = document.createElement('div');
  box.className = 'space-y-4 mt-4';
  box.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-lg font-semibold">${asset.unitNumber} reports</h2>
      <button class="btn-secondary text-sm" onclick="openVehicleDashSettings()">Vehicle chart settings</button>
    </div>
    <div class="grid gap-4 lg:grid-cols-2">
      ${s.showMiles ? `<div class="card"><div class="text-sm mb-2">Miles traveled</div><canvas id="chart-miles"></canvas></div>` : ''}
      ${s.showMpg ? `<div class="card"><div class="text-sm mb-2">MPG by month</div><canvas id="chart-mpg"></canvas></div>` : ''}
      ${s.showFuel ? `<div class="card"><div class="text-sm mb-2">Fuel cost by month</div><canvas id="chart-fuel"></canvas></div>` : ''}
      ${s.showHealth ? `<div class="card"><div class="text-sm mb-2">State of health</div><canvas id="chart-health"></canvas></div>` : ''}
    </div>`;
  el.appendChild(box);
  const labels = series.map(x => x.label);
  if (s.showMiles) drawChart('chart-miles', labels, series.map(x => x.miles), 'Miles', '#38bdf8');
  if (s.showMpg) drawChart('chart-mpg', labels, series.map(x => x.mpg), 'MPG', '#34d399');
  if (s.showFuel) drawChart('chart-fuel', labels, series.map(x => x.cost), 'Fuel $', '#f59e0b');
  if (s.showHealth) drawChart('chart-health', labels, series.map(x => x.health || 0), 'Health %', '#a78bfa');
};
function openVehicleDashSettings() {
  const asset = currentAsset();
  if (!asset) return;
  const s = loadDashSettings(asset.id);
  openModal(`<div class="p-5 space-y-3">
    <h2 class="text-lg font-semibold">${asset.unitNumber} chart settings</h2>
    <p class="text-sm text-slate-400">Saved for this vehicle only.</p>
    <div><label class="form-label">Months</label><input id="dash-months" type="number" min="1" max="36" class="form-input" value="${s.months}"></div>
    <label class="flex gap-2 text-sm"><input id="dash-miles" type="checkbox" ${s.showMiles?'checked':''}> Miles traveled</label>
    <label class="flex gap-2 text-sm"><input id="dash-mpg" type="checkbox" ${s.showMpg?'checked':''}> MPG by month</label>
    <label class="flex gap-2 text-sm"><input id="dash-fuel" type="checkbox" ${s.showFuel?'checked':''}> Fuel cost by month</label>
    <label class="flex gap-2 text-sm"><input id="dash-health" type="checkbox" ${s.showHealth?'checked':''}> State of health</label>
    <div class="flex justify-end gap-2"><button class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-primary" onclick="saveVehicleDashSettings()">Save</button></div>
  </div>`);
}
function saveVehicleDashSettings() {
  const asset = currentAsset();
  saveDashSettings(asset.id, {
    months: Number(document.getElementById('dash-months').value) || 12,
    showMiles: document.getElementById('dash-miles').checked,
    showMpg: document.getElementById('dash-mpg').checked,
    showFuel: document.getElementById('dash-fuel').checked,
    showHealth: document.getElementById('dash-health').checked
  });
  closeModal();
  toast('Saved for ' + asset.unitNumber);
  showView('dashboard');
}

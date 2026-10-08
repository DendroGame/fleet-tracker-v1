function bucketKey(date, mode) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  if (mode === 'day') return d.toISOString().slice(0, 10);
  if (mode === 'week') {
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().slice(0, 10);
  }
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}
function bucketLabel(key, mode) {
  if (mode === 'month') return key.slice(5);
  return key.slice(5);
}
const _openFuelCalc = openFuelForm;
openFuelForm = function () {
  _openFuelCalc.apply(this, arguments);
  const form = document.querySelector('#modal-content form');
  if (!form) return;
  const gallons = form.querySelector('[name="gallons"]');
  const price = form.querySelector('[name="pricePerGallon"]');
  const total = form.querySelector('[name="totalCost"]');
  if (!gallons || !price || !total) return;
  const calc = () => {
    const g = parseFloat(gallons.value);
    const p = parseFloat(price.value);
    const t = parseFloat(total.value);
    if (g > 0 && p > 0 && !total.value) total.value = (g * p).toFixed(2);
    else if (g > 0 && t > 0 && !price.value) price.value = (t / g).toFixed(3);
    else if (p > 0 && t > 0 && !gallons.value) gallons.value = (t / p).toFixed(3);
  };
  [gallons, price, total].forEach(el => el.addEventListener('change', calc));
};
const _saveFuelCalc = saveFuel;
saveFuel = async function (e) {
  const form = e.target;
  const g = parseFloat(form.querySelector('[name="gallons"]')?.value);
  const p = parseFloat(form.querySelector('[name="pricePerGallon"]')?.value);
  const t = parseFloat(form.querySelector('[name="totalCost"]')?.value);
  if (g > 0 && p > 0 && !(t > 0)) form.querySelector('[name="totalCost"]').value = (g * p).toFixed(2);
  if (g > 0 && t > 0 && !(p > 0)) form.querySelector('[name="pricePerGallon"]').value = (t / g).toFixed(3);
  if (p > 0 && t > 0 && !(g > 0)) form.querySelector('[name="gallons"]').value = (t / p).toFixed(3);
  return _saveFuelCalc.apply(this, arguments);
};
const _openDashInc = openVehicleDashSettings;
openVehicleDashSettings = function () {
  _openDashInc();
  const asset = currentAsset();
  const s = loadDashSettings(asset.id);
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">Miles increment</label><select id="dash-increment" class="form-select"><option value="day" ${s.increment==='day'?'selected':''}>Per day</option><option value="week" ${s.increment==='week'?'selected':''}>Per week</option><option value="month" ${!s.increment||s.increment==='month'?'selected':''}>Per month</option></select>`;
  document.getElementById('dash-months').parentElement.after(row);
};
const _saveDashInc = saveVehicleDashSettings;
saveVehicleDashSettings = function () {
  const asset = currentAsset();
  const prev = loadDashSettings(asset.id);
  _saveDashInc();
  const next = loadDashSettings(asset.id);
  next.increment = document.getElementById('dash-increment')?.value || 'month';
  saveDashSettings(asset.id, next);
};
const _seriesInc = vehicleSeries;
vehicleSeries = function (asset, months) {
  const s = loadDashSettings(asset.id);
  const mode = s.increment || 'month';
  if (mode === 'month') return _seriesInc(asset, months);
  const fuels = (state.fuelRecords || []).filter(r => r.assetId === asset.id).sort((a, b) => new Date(a.date) - new Date(b.date));
  const since = new Date();
  since.setDate(since.getDate() - (mode === 'week' ? months * 7 : months * 30));
  const map = {};
  fuels.forEach((f, i) => {
    if (new Date(f.date) < since) return;
    const key = bucketKey(f.date, mode);
    if (!map[key]) map[key] = { label: bucketLabel(key, mode), miles: 0, gallons: 0, cost: 0, health: 0 };
    const prev = fuels[i - 1];
    if (prev && f.odometer && prev.odometer) map[key].miles += Math.max(0, f.odometer - prev.odometer);
    map[key].gallons += f.gallons || 0;
    map[key].cost += f.totalCost || 0;
  });
  return Object.values(map).map(x => ({ ...x, mpg: x.gallons ? +(x.miles / x.gallons).toFixed(1) : 0 }));
};

function assetCosts(a) {
  const services = (state.serviceRecords || []).filter(r => r.assetId === a.id);
  const fuels = (state.fuelRecords || []).filter(r => r.assetId === a.id);
  const total = services.reduce((s, r) => s + (r.cost || 0), 0) + fuels.reduce((s, r) => s + (r.totalCost || 0), 0);
  let per = '—';
  if (a.odometer > 0) per = formatCurrency(total / a.odometer) + '/mi';
  else if (a.hours > 0) per = formatCurrency(total / a.hours) + '/hr';
  let mpg = '';
  if (a.type === 'vehicle') {
    const fulls = fuels.filter(f => f.isFull && f.odometer != null).sort((x, y) => new Date(y.date) - new Date(x.date));
    if (fulls.length >= 2) {
      const miles = fulls[0].odometer - fulls[1].odometer;
      if (miles > 0 && fulls[0].gallons > 0) mpg = (miles / fulls[0].gallons).toFixed(1) + ' MPG';
      else mpg = 'MPG —';
    } else mpg = 'MPG —';
  }
  return { per, mpg };
}
function goToFuel(id) {
  switchAsset(id);
  showView('fuel');
  if (typeof openFuelForm === 'function') openFuelForm();
}
const _renderGarageStats = renderGarage;
renderGarage = function (el) {
  _renderGarageStats(el);
  const cards = el.querySelectorAll('.card');
  (state.assets || []).forEach((a, i) => {
    const card = cards[i];
    if (!card || card.querySelector('.tile-stats')) return;
    const stats = assetCosts(a);
    const row = document.createElement('div');
    row.className = 'tile-stats mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300';
    row.innerHTML = `<span class="px-2 py-1 rounded bg-slate-800">${stats.per}</span>${stats.mpg ? `<span class="px-2 py-1 rounded bg-slate-800">${stats.mpg}</span>` : ''}<button class="btn-secondary text-xs" onclick="event.stopPropagation(); goToFuel('${a.id}')">Add fuel</button>`;
    const actions = card.querySelector('.mt-4.flex.gap-2');
    if (actions) card.insertBefore(row, actions);
    else card.appendChild(row);
  });
};

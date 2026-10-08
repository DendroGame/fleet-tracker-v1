const TILE_OPTS = [
  ['state', 'State'],
  ['cost', 'Cost per mile or hour'],
  ['mpg', 'Average MPG'],
  ['fuelBtn', 'Add fuel button'],
  ['serviceBtn', 'Add service button'],
  ['inspectBtn', 'Inspection button']
];
function tileOpt(key) {
  const raw = localStorage.getItem('ft_tile_' + key);
  if (raw === null) return true;
  return raw === '1';
}
function setTileOpt(key, on) {
  localStorage.setItem('ft_tile_' + key, on ? '1' : '0');
  toast(on ? 'Shown on tiles' : 'Hidden on tiles');
}
function renderDashboardSettings(el) {
  const mode = localStorage.getItem('ft_tile_primary') || 'model';
  el.innerHTML = `
    <h2 class="text-lg font-semibold mb-2">Dashboard display</h2>
    <p class="text-sm text-slate-400 mb-4">Same choices on desktop and mobile. Picture display is set on each asset in Edit Asset.</p>
    <div class="card space-y-3 text-sm mb-4">
      <div class="font-medium">Tile title</div>
      <label class="flex items-center gap-2"><input type="radio" name="tile" ${mode==='model'?'checked':''} onchange="setTileMode('model')"> Model large, unit small</label>
      <label class="flex items-center gap-2"><input type="radio" name="tile" ${mode==='unit'?'checked':''} onchange="setTileMode('unit')"> Unit large, model small</label>
    </div>
    <div class="card space-y-2 text-sm">
      <div class="font-medium mb-1">Show on tiles</div>
      ${TILE_OPTS.map(([k, label]) => `<label class="flex items-center gap-2"><input type="checkbox" ${tileOpt(k)?'checked':''} onchange="setTileOpt('${k}', this.checked)"> ${label}</label>`).join('')}
    </div>`;
}

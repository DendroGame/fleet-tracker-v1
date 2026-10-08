function renderDashboardSettings(el) {
  const mode = localStorage.getItem('ft_tile_primary') || 'model';
  const photo = localStorage.getItem('ft_photo_mode') || 'icon';
  el.innerHTML = `
    <h2 class="text-lg font-semibold mb-2">Dashboard display</h2>
    <p class="text-sm text-slate-400 mb-4">Same choices on desktop and mobile.</p>
    <div class="card space-y-3 text-sm mb-4">
      <div class="font-medium">Tile title</div>
      <label class="flex items-center gap-2"><input type="radio" name="tile" ${mode==='model'?'checked':''} onchange="setTileMode('model')"> Model large, unit small</label>
      <label class="flex items-center gap-2"><input type="radio" name="tile" ${mode==='unit'?'checked':''} onchange="setTileMode('unit')"> Unit large, model small</label>
    </div>
    <div class="card space-y-3 text-sm mb-4">
      <div class="font-medium">Picture</div>
      <label class="flex items-center gap-2"><input type="radio" name="photo" ${photo==='icon'?'checked':''} onchange="setPhotoMode('icon')"> Round icon, top left</label>
      <label class="flex items-center gap-2"><input type="radio" name="photo" ${photo==='background'?'checked':''} onchange="setPhotoMode('background')"> Faded tile background</label>
    </div>
    <div class="card space-y-2 text-sm">
      <div class="font-medium mb-1">Show on tiles</div>
      ${TILE_OPTS.map(([k, label]) => `<label class="flex items-center gap-2"><input type="checkbox" ${tileOpt(k)?'checked':''} onchange="setTileOpt('${k}', this.checked)"> ${label}</label>`).join('')}
    </div>`;
}

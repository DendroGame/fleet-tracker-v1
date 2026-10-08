function renderDashboardSettings(el) {
  const mode = localStorage.getItem('ft_tile_primary') || 'model';
  el.innerHTML = `
    <h2 class="text-lg font-semibold mb-2">Dashboard display</h2>
    <p class="text-sm text-slate-400 mb-4">Choose what is large on each asset tile.</p>
    <div class="card space-y-3 text-sm">
      <label class="flex items-center gap-2">
        <input type="radio" name="tile" ${mode === 'model' ? 'checked' : ''} onchange="setTileMode('model')">
        Model large, unit number small
      </label>
      <label class="flex items-center gap-2">
        <input type="radio" name="tile" ${mode === 'unit' ? 'checked' : ''} onchange="setTileMode('unit')">
        Unit number large, model small
      </label>
    </div>`;
}

function tileMode() {
  return localStorage.getItem('ft_tile_primary') || 'model';
}
function setTileMode(mode) {
  localStorage.setItem('ft_tile_primary', mode);
  if (typeof showView === 'function') showView('garage');
  if (typeof refreshSelectedLabel === 'function') refreshSelectedLabel();
}
function tileText(a) {
  const model = [a.year, a.make, a.model].filter(Boolean).join(' ') || 'No model';
  const unit = a.unitNumber || 'No unit';
  if (tileMode() === 'unit') {
    return { title: unit, sub: model };
  }
  return { title: model, sub: unit };
}
const _renderGarageTiles = renderGarage;
renderGarage = function (el) {
  _renderGarageTiles(el);
  const cards = el.querySelectorAll('.card');
  state.assets.forEach((a, i) => {
    const card = cards[i];
    if (!card) return;
    const block = card.querySelector('.mt-3');
    if (!block) return;
    const text = tileText(a);
    const title = block.querySelector('.font-semibold');
    const sub = block.querySelector('.text-sm');
    if (title) {
      title.textContent = text.title;
      title.className = 'font-bold text-xl';
    }
    if (sub) {
      sub.textContent = text.sub;
      sub.className = 'text-xs text-slate-400 mt-1';
    }
  });
};
const _refreshSelected = typeof refreshSelectedLabel === 'function' ? refreshSelectedLabel : function () {};
refreshSelectedLabel = function () {
  const el = document.getElementById('now-selected');
  const a = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!el) return;
  if (!a) { el.textContent = 'None'; return; }
  const text = tileText(a);
  el.innerHTML = `<div class="font-bold text-base">${text.title}</div><div class="text-xs text-slate-400">${text.sub}</div>`;
};

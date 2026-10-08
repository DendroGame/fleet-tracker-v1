const _renderGarageState = renderGarage;
renderGarage = function (el) {
  _renderGarageState(el);
  const cards = el.querySelectorAll('.card');
  (state.assets || []).forEach((a, i) => {
    const card = cards[i];
    if (!card) return;
    const badge = card.querySelector('.status-badge');
    const label = typeof stateLabel === 'function' ? stateLabel(a.status) : (a.status || 'In Service');
    if (badge) badge.textContent = label;
    let line = card.querySelector('.asset-state-line');
    if (!line) {
      line = document.createElement('div');
      line.className = 'asset-state-line text-sm mt-2 text-slate-200';
      const block = card.querySelector('.mt-3') || card;
      block.appendChild(line);
    }
    line.textContent = 'State: ' + label;
  });
};

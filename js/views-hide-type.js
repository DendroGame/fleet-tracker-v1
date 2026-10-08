function hideTileTypes() {
  if (document.getElementById('view-title')?.textContent !== 'Garage') return;
  document.querySelectorAll('#main-content .card').forEach(card => {
    card.querySelectorAll('span, div, p').forEach(el => {
      const text = (el.textContent || '').trim();
      if (['Truck', 'Car', 'Trailer', 'Vehicle', 'Machine', 'Light Equipment', 'Heavy Equipment', 'Other', 'Custom'].includes(text)) el.style.display = 'none';
    });
  });
}
const _renderHideType = renderGarage;
renderGarage = function (el) {
  _renderHideType(el);
  hideTileTypes();
};
setInterval(hideTileTypes, 700);

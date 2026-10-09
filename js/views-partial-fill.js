/* Partial fill replaces Full tank. Checked means the tank was not filled. */
function swapFuelCheckbox() {
  const box = document.querySelector('#modal-content input[name="isFull"]');
  if (!box || box.dataset.partial) return;
  box.dataset.partial = '1';
  box.id = 'isPartial';
  box.name = 'isPartial';
  box.checked = false;
  const label = box.parentElement.querySelector('label');
  if (label) {
    label.setAttribute('for', 'isPartial');
    label.textContent = 'Partial fill';
  }
}
const _openFuelPartial = openFuelForm;
openFuelForm = function () {
  _openFuelPartial.apply(this, arguments);
  setTimeout(swapFuelCheckbox, 0);
  setTimeout(swapFuelCheckbox, 250);
};
const _saveFuelPartial = saveFuel;
saveFuel = async function (e, id) {
  const partial = e.target.querySelector('[name="isPartial"]');
  if (partial) {
    const hidden = document.createElement('input');
    hidden.type = 'hidden';
    hidden.name = 'isFull';
    hidden.value = partial.checked ? '' : 'on';
    e.target.appendChild(hidden);
  }
  return _saveFuelPartial.apply(this, arguments);
};

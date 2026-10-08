/*
 * Section: fuel math
 * Bug: the fuel form had gallons and price, but no total field, so the calculator had nothing to fill.
 * Fix: add Total cost, then any two of the three calculate the missing one.
 */
const _openFuelReviewed = openFuelForm;
openFuelForm = function () {
  _openFuelReviewed.apply(this, arguments);
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="totalCost"]')) return;
  const gallons = form.querySelector('[name="gallons"]');
  if (!gallons) return;
  gallons.required = false;
  const row = document.createElement('div');
  row.innerHTML = '<label class="form-label">Total cost</label><input name="totalCost" type="number" step="0.01" class="form-input" placeholder="Calculated if blank">';
  gallons.parentElement.parentElement.after(row);
  const price = form.querySelector('[name="pricePerGallon"]');
  const total = form.querySelector('[name="totalCost"]');
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

/*
 * Section: vehicle display settings
 * Bug: checkboxes saved, but tiles were not marked, so hide did not match them.
 * Fix: tag each tile, then hide from the saved vehicle settings.
 */
function tagDashTiles() {
  document.querySelectorAll('#main-content .card').forEach(card => {
    const label = (card.querySelector('.uppercase, .text-xs')?.textContent || '').toLowerCase();
    if (label.includes('service cost') || label.includes('service spend')) card.dataset.tile = 'service';
    else if (label.includes('fuel cost') || label.includes('fuel spend')) card.dataset.tile = 'fuel';
    else if (label.includes('mpg')) card.dataset.tile = 'mpg';
    else if (label.includes('reminder')) card.dataset.tile = 'reminders';
    else if (label.includes('status') || label.includes('state')) card.dataset.tile = 'status';
  });
}
const _applyReviewed = applyAssetSettings;
applyAssetSettings = function () {
  tagDashTiles();
  const asset = currentAsset();
  if (!asset) return;
  const s = readAssetSettings(asset);
  document.querySelectorAll('#main-content [data-tile]').forEach(card => {
    card.style.display = s[card.dataset.tile] === false ? 'none' : '';
  });
  _applyReviewed();
};

/*
 * Section: reminders pie
 * Good = green, upcoming = amber, urgent = red. Counts come from open reminders on the selected vehicle.
 */

/*
 * Section: repairs tab
 * Shows service records whose type is repair. Other service types stay on the Service tab.
 */

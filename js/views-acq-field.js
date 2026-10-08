function addAcquisitionField(id) {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="acquisitionCost"]')) return;
  const asset = id ? (state.assets || []).find(a => a.id === id) : null;
  const match = String(asset?.notes || '').match(/__acq__:([\d.]+)/);
  const row = document.createElement('div');
  row.innerHTML = '<label class="form-label">Acquisition cost *</label><input name="acquisitionCost" type="number" step="0.01" min="0" class="form-input" required value="' + (match ? match[1] : '') + '" placeholder="Purchase price">';
  const actions = form.querySelector('.flex.justify-end') || form.lastElementChild;
  form.insertBefore(row, actions);
}
const _openAcqLate = openAssetForm;
openAssetForm = function (id) {
  _openAcqLate.apply(this, arguments);
  setTimeout(() => addAcquisitionField(id), 0);
  setTimeout(() => addAcquisitionField(id), 400);
};

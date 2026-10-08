function addPartNumber() {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('[name="partNumber"]')) return;
  if (!form.querySelector('[name="description"]')) return;
  const row = document.createElement('div');
  row.innerHTML = '<label class="form-label">Part number</label><input name="partNumber" class="form-input" placeholder="Part number">';
  form.querySelector('[name="description"]').parentElement.after(row);
}
const _openPart = openServiceForm;
openServiceForm = function () {
  _openPart.apply(this, arguments);
  setTimeout(addPartNumber, 0);
  setTimeout(addPartNumber, 300);
};
const _savePart = saveService;
saveService = async function (e, id) {
  const part = e.target.querySelector('[name="partNumber"]')?.value?.trim();
  const notes = e.target.querySelector('[name="notes"]');
  if (part && notes && !String(notes.value).includes('Part #:')) notes.value = 'Part #: ' + part + (notes.value ? '\n' + notes.value : '');
  return _savePart.apply(this, arguments);
};

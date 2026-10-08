function oneFileInput() {
  const form = document.querySelector('#modal-content form');
  if (!form) return;
  const files = [...form.querySelectorAll('input[type="file"]')];
  files.slice(1).forEach(input => (input.closest('div') || input).remove());
}
const _openOneFile = openServiceForm;
openServiceForm = function () {
  _openOneFile.apply(this, arguments);
  setTimeout(oneFileInput, 0);
  setTimeout(oneFileInput, 300);
};

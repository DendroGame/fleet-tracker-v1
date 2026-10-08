const _renderNoDelete = renderGarage;
renderGarage = function (el) {
  _renderNoDelete(el);
  el.querySelectorAll('.btn-danger').forEach(b => b.remove());
};
const _openNoDelete = openAssetForm;
openAssetForm = function () {
  _openNoDelete.apply(this, arguments);
  document.querySelectorAll('#modal-content .btn-danger').forEach(b => b.remove());
};

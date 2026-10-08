const _openHardDelete = openAssetForm;
openAssetForm = function (id) {
  _openHardDelete.apply(this, arguments);
  if (!id) return;
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('.hard-delete')) return;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'hard-delete text-xs text-red-400 mt-3';
  btn.textContent = 'Hard delete from D1';
  btn.onclick = () => confirmHardDelete(id);
  form.appendChild(btn);
};
function confirmHardDelete(id) {
  const asset = state.assets.find(a => a.id === id);
  const name = asset ? asset.unitNumber : 'this asset';
  openModal(`<div class="p-5 space-y-3">
    <h2 class="text-lg font-semibold">Hard delete ${name}</h2>
    <p class="text-sm text-slate-400">This removes the asset from D1. Admin password required.</p>
    <input id="admin-pass" type="password" class="form-input" placeholder="Admin password">
    <div class="flex justify-end gap-2">
      <button class="btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="runHardDelete('${id}')">Delete</button>
    </div>
  </div>`);
}
async function runHardDelete(id) {
  const password = document.getElementById('admin-pass').value;
  try {
    const res = await api('/api/login', { method: 'POST', body: JSON.stringify({ name: "Jonathan's Fleet", password }) });
    if (res.role !== 'admin') throw new Error('Admin account required');
    await api('/api/assets/' + id, { method: 'DELETE' });
    state.assets = state.assets.filter(a => a.id !== id);
    if (state.currentAssetId === id) state.currentAssetId = state.assets[0]?.id || null;
    closeModal();
    toast('Deleted from D1');
    showView('garage');
  } catch (err) {
    toast(err.message || 'Delete blocked', 'err');
  }
}

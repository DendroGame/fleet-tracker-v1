const EXTRA_TABS = [
  ['insurance', 'Insurance'],
  ['taxes', 'Taxes'],
  ['subscriptions', 'Subscriptions']
];
function extraRecords(kind) {
  return (state.serviceRecords || []).filter(r => r.type === kind && (!currentAsset() || r.assetId === currentAsset().id));
}
function renderExtra(el, kind, label) {
  const rows = extraRecords(kind);
  el.innerHTML = `
    <div class="flex justify-between items-center mb-4"><p class="text-sm text-slate-400">${rows.length} ${label.toLowerCase()}</p><button class="btn-primary" onclick="openExtraForm('${kind}')">Add ${label.slice(0, -1)}</button></div>
    ${rows.map(r => `<div class="card mb-2"><div class="font-medium">${r.description || label}</div><div class="text-xs text-slate-400">${r.date || ''} · due ${r.notes?.match(/Due: ([^\n]+)/)?.[1] || '—'} · ${formatCurrency(r.cost || 0)}</div></div>`).join('') || '<p class="text-slate-500">None yet</p>'}`;
}
function openExtraForm(kind) {
  const label = EXTRA_TABS.find(t => t[0] === kind)?.[1] || kind;
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Add ${label.slice(0, -1)}</h2>
    <label class="form-label">Name</label><input id="ex-name" class="form-input" required>
    <label class="form-label">Date</label><input id="ex-date" type="date" class="form-input" value="${new Date().toISOString().slice(0,10)}">
    <label class="form-label">Due date</label><input id="ex-due" type="date" class="form-input">
    <label class="form-label">Cost</label><input id="ex-cost" type="number" step="0.01" class="form-input">
    <label class="form-label">Notes</label><textarea id="ex-notes" class="form-input" rows="2"></textarea>
    <label class="form-label">File</label><input id="ex-file" type="file" class="form-input">
    <button class="btn-primary" onclick="saveExtra('${kind}')">Save</button></div>`);
}
async function saveExtra(kind) {
  const asset = currentAsset();
  if (!asset) return toast('Select a vehicle first', 'err');
  const name = document.getElementById('ex-name').value.trim();
  const due = document.getElementById('ex-due').value;
  const file = document.getElementById('ex-file').files?.[0];
  let photo = null;
  if (file && typeof uploadPhoto === 'function') photo = await uploadPhoto(file);
  const obj = {
    assetId: asset.id,
    type: kind,
    date: document.getElementById('ex-date').value,
    description: name,
    cost: Number(document.getElementById('ex-cost').value) || 0,
    notes: 'Due: ' + (due || '') + '\n' + document.getElementById('ex-notes').value,
    photo
  };
  const res = await createService(obj);
  obj.id = res.id;
  state.serviceRecords.push(obj);
  closeModal();
  if (due && confirm('Add a reminder for ' + name + ' due ' + due + '?')) {
    await api('/api/reminders', { method: 'POST', body: JSON.stringify({ asset_id: asset.id, title: name, due_date: due, urgency: 'normal', completed: false, notes: 'From ' + kind }) });
    if (confirm('Also add it to the to-do list?')) addTodo({ title: name, assetId: asset.id, unit: asset.unitNumber, source: kind });
  }
  toast('Saved');
  showView(kind);
}
function addExtraNav() {
  const nav = document.querySelector('nav');
  if (!nav || nav.querySelector('[data-view="insurance"]')) return;
  EXTRA_TABS.forEach(([view, label]) => {
    const btn = document.createElement('button');
    btn.className = 'nav-btn';
    btn.dataset.view = view;
    btn.textContent = label;
    btn.onclick = () => showView(view);
    nav.appendChild(btn);
  });
}
const _showExtra = showView;
showView = function (name) {
  if (EXTRA_TABS.some(t => t[0] === name)) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-view="${name}"]`)?.classList.add('active');
    const label = EXTRA_TABS.find(t => t[0] === name)[1];
    document.getElementById('view-title').textContent = label;
    document.getElementById('view-subtitle').textContent = 'List for this vehicle';
    renderExtra(document.getElementById('main-content'), name, label);
    return;
  }
  return _showExtra.apply(this, arguments);
};
setInterval(addExtraNav, 800);

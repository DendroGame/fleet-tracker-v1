function todos() {
  try { return JSON.parse(localStorage.getItem('ft_todos') || '[]'); } catch (e) { return []; }
}
function saveTodos(rows) {
  localStorage.setItem('ft_todos', JSON.stringify(rows));
}
function addTodo(item) {
  const rows = todos();
  rows.unshift({ id: generateId('todo'), done: false, auto: false, ...item });
  saveTodos(rows);
}
function renderTodos(el) {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const filter = el.dataset.filter || 'all';
  const rows = todos().filter(r => filter === 'all' || r.assetId === asset?.id);
  el.innerHTML = `
    <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
      <div class="flex gap-2">
        <button class="btn-secondary text-sm" onclick="this.closest('#main-content').dataset.filter='all'; renderTodos(this.closest('#main-content'))">All</button>
        <button class="btn-secondary text-sm" onclick="this.closest('#main-content').dataset.filter='vehicle'; renderTodos(this.closest('#main-content'))">${asset ? asset.unitNumber : 'Vehicle'}</button>
      </div>
      <button class="btn-primary" onclick="openTodoForm()">Add task</button>
    </div>
    <p class="text-xs text-slate-400 mb-4">Upcoming reminders are added only when that reminder has Add to to-do turned on.</p>
    ${rows.length ? rows.map(r => `<div class="card mb-2 flex items-center justify-between gap-3 ${r.done?'opacity-50':''}"><div><div class="font-medium">${r.title}</div><div class="text-xs text-slate-400">${r.unit || 'Shop'} · ${r.source || 'Task'}</div></div><button class="btn-secondary text-xs" onclick="toggleTodo('${r.id}')">${r.done?'Undo':'Done'}</button></div>`).join('') : '<p class="text-slate-500">No tasks</p>'}`;
}
function openTodoForm() {
  const asset = currentAsset();
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Add task</h2><input id="todo-title" class="form-input" placeholder="Task"><button class="btn-primary" onclick="saveManualTodo()">Save</button></div>`);
  window._todoAsset = asset;
}
function saveManualTodo() {
  const asset = window._todoAsset;
  const title = document.getElementById('todo-title').value.trim();
  if (!title) return;
  addTodo({ title, assetId: asset?.id || '', unit: asset?.unitNumber || 'Shop', source: 'Manual' });
  closeModal();
  showView('todos');
}
function toggleTodo(id) {
  const rows = todos();
  const row = rows.find(r => r.id === id);
  if (row) row.done = !row.done;
  saveTodos(rows);
  showView('todos');
}
function syncUpcomingReminders() {}
async function offerTodoFromInspection(asset, answers) {
  const problems = answers.filter(r => r.result === 'Fail' || r.result === 'Needs maintenance');
  if (!problems.length) return;
  if (!confirm('Add these to the to-do list?\n\n' + problems.map(r => r.item + ' (' + r.result + ')').join('\n'))) return;
  problems.forEach(r => addTodo({ title: r.item + ' ' + r.result.toLowerCase(), assetId: asset.id, unit: asset.unitNumber, source: 'Inspection' }));
  toast('Added to to-do');
}
const _finishTodo = finishCdl;
finishCdl = async function () {
  const asset = currentAsset();
  const problems = cdlAnswers.slice();
  await _finishTodo.apply(this, arguments);
  if (asset) await offerTodoFromInspection(asset, problems);
};
const _showTodo = showView;
showView = function (name) {
  if (name === 'todos') {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-view="todos"]')?.classList.add('active');
    document.getElementById('view-title').textContent = 'To do';
    document.getElementById('view-subtitle').textContent = 'Shop list, filter by vehicle';
    if (typeof syncUpcomingReminders === 'function') syncUpcomingReminders();
    renderTodos(document.getElementById('main-content'));
    return;
  }
  return _showTodo.apply(this, arguments);
};
function addTodoNav() {
  const nav = document.querySelector('nav');
  if (!nav || nav.querySelector('[data-view="todos"]')) return;
  const btn = document.createElement('button');
  btn.className = 'nav-btn';
  btn.dataset.view = 'todos';
  btn.textContent = 'To do';
  btn.onclick = () => showView('todos');
  nav.appendChild(btn);
}
setInterval(addTodoNav, 800);

function todoFlag(notes, on) {
  return String(notes || '').replace(/\n?__todo__:[^\n]*/g, '') + (on ? '\n__todo__:1' : '');
}
function wantsTodo(r) {
  return /__todo__:1/.test(r?.notes || '');
}
const _editTodoFlag = editReminder;
editReminder = function (id) {
  _editTodoFlag(id);
  setTimeout(() => {
    const form = document.querySelector('#modal-content');
    if (!form || form.querySelector('#rem-todo')) return;
    const r = (state.reminders || []).find(x => x.id === id);
    const box = document.createElement('label');
    box.className = 'flex gap-2 text-sm';
    box.innerHTML = `<input id="rem-todo" type="checkbox" ${wantsTodo(r) ? 'checked' : ''}> Add to to-do when upcoming`;
    form.querySelector('button')?.before(box);
  }, 0);
};
const _saveTodoFlag = saveReminderEdit;
saveReminderEdit = async function (id) {
  const on = document.getElementById('rem-todo')?.checked;
  await _saveTodoFlag.apply(this, arguments);
  const r = state.reminders.find(x => x.id === id);
  if (!r) return;
  r.notes = todoFlag(r.notes, on);
  await updateReminder(id, r);
};
function syncUpcomingReminders() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  (state.reminders || []).filter(r => !r.completed && wantsTodo(r)).forEach(r => {
    const owner = (state.assets || []).find(a => a.id === r.assetId);
    const level = typeof reminderLevel === 'function' ? reminderLevel(r, owner) : '';
    if (level !== 'upcoming' && level !== 'urgent') return;
    if (todos().some(t => t.sourceId === r.id)) return;
    addTodo({ title: r.title, assetId: r.assetId, unit: owner?.unitNumber || '', source: 'Reminder', sourceId: r.id });
  });
}

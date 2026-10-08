function renderReminders(el) {
  const asset = currentAsset();
  const list = state.reminders
    .filter(r => !asset || r.assetId === asset.id)
    .sort((a,b) => {
      const order = { overdue: 0, soon: 1, normal: 2 };
      return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
    });

  el.innerHTML = `
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <p class="text-sm text-slate-400">${list.filter(r=>!r.completed).length} open reminders</p>
      <button class="btn-primary" onclick="openReminderForm()">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Reminder
      </button>
    </div>
    <div class="space-y-3">
      ${list.length === 0 ? `<div class="empty-state"><p>No reminders</p></div>` :
        list.map(r => `
          <div class="card flex items-start gap-4 ${r.completed ? 'opacity-50' : ''}">
            <div class="mt-1">
              <span class="status-badge ${
                r.urgency === 'overdue' ? 'status-oos' :
                r.urgency === 'soon'    ? 'status-due' : 'status-healthy'
              }">${r.urgency}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-medium ${r.completed ? 'line-through' : ''}">${r.title}</div>
              <div class="text-xs text-slate-400 mt-1">
                ${r.dueDate ? 'Due ' + r.dueDate : ''}
                ${r.dueOdometer ? ' · ' + formatNumber(r.dueOdometer) + ' mi' : ''}
                ${r.dueHours ? ' · ' + formatNumber(r.dueHours) + ' hrs' : ''}
              </div>
              ${r.notes ? `<div class="text-xs text-slate-500 mt-1">${r.notes}</div>` : ''}
            </div>
            <div class="flex gap-2">
              ${!r.completed ? `<button class="btn-secondary text-xs" onclick="completeReminder('${r.id}')">Done</button>` : ''}
              <button class="btn-danger text-xs" onclick="deleteReminder('${r.id}')">Del</button>
            </div>
          </div>
        `).join('')
      }
    </div>
  `;
}

function openReminderForm() {
  openModal(`
    <div class="p-5">
      <h2 class="text-lg font-semibold mb-4">Add Reminder</h2>
      <form onsubmit="saveReminder(event)" class="space-y-3">
        <div>
          <label class="form-label">Title *</label>
          <input name="title" class="form-input" required placeholder="Oil Change, Inspection…">
        </div>
        <div>
          <label class="form-label">Due Date</label>
          <input name="dueDate" type="date" class="form-input">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="form-label">Due Odometer</label>
            <input name="dueOdometer" type="number" class="form-input">
          </div>
          <div>
            <label class="form-label">Due Hours</label>
            <input name="dueHours" type="number" class="form-input">
          </div>
        </div>
        <div>
          <label class="form-label">Urgency</label>
          <select name="urgency" class="form-select">
            <option value="normal">Normal</option>
            <option value="soon">Due Soon</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <div>
          <label class="form-label">Notes</label>
          <input name="notes" class="form-input">
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn-primary">Save</button>
        </div>
      </form>
    </div>
  `);
}

async function saveReminder(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const obj = {
    assetId: state.currentAssetId,
    title: fd.get('title'),
    dueDate: fd.get('dueDate') || null,
    dueOdometer: fd.get('dueOdometer') ? +fd.get('dueOdometer') : null,
    dueHours: fd.get('dueHours') ? +fd.get('dueHours') : null,
    urgency: fd.get('urgency'),
    completed: false,
    notes: fd.get('notes')
  };
  try {
    const res = await createReminder(obj);
    obj.id = res.id;
    state.reminders.push(obj);
    closeModal();
    showView('reminders');
    toast('Reminder saved to Cloudflare');
  } catch (err) {
    toast('Error: ' + err.message, 'err');
  }
}

function completeReminder(id) {
  const r = state.reminders.find(x => x.id === id);
  if (r) r.completed = true;
  showView('reminders');
  toast('Marked complete');
}

function deleteReminder(id) {
  if (!confirm('Delete reminder?')) return;
  state.reminders = state.reminders.filter(r => r.id !== id);
  showView('reminders');
  toast('Removed from view');
}

function hideLevelButton() {
  document.querySelectorAll('.level-btn').forEach(el => el.remove());
}
function editReminder(id) {
  const r = (state.reminders || []).find(x => x.id === id);
  if (!r) return;
  const notes = r.notes || '';
  const up = (notes.match(/upcoming:(\d+)/) || [])[1] || 30;
  const urg = (notes.match(/urgent:(\d+)/) || [])[1] || 7;
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Edit reminder</h2><label class="form-label">Name</label><input id="rem-title" class="form-input" value="${r.title || ''}"><label class="form-label">Due date</label><input id="rem-date" type="date" class="form-input" value="${r.dueDate || ''}"><label class="form-label">Due odometer</label><input id="rem-odo" type="number" class="form-input" value="${r.dueOdometer || ''}"><label class="form-label">Upcoming within days</label><input id="rem-up" type="number" class="form-input" value="${up}"><label class="form-label">Urgent within days</label><input id="rem-urg" type="number" class="form-input" value="${urg}"><label class="form-label">Notes</label><input id="rem-notes" class="form-input" value="${notes.replace(/\n?upcoming:\d+\n?urgent:\d+/g, '')}"><button class="btn-primary" onclick="saveReminderEdit('${id}')">Save</button></div>`);
}
async function saveReminderEdit(id) {
  const r = state.reminders.find(x => x.id === id);
  r.title = document.getElementById('rem-title').value;
  r.dueDate = document.getElementById('rem-date').value;
  r.dueOdometer = document.getElementById('rem-odo').value ? +document.getElementById('rem-odo').value : null;
  const plain = document.getElementById('rem-notes').value.replace(/\n?upcoming:\d+\n?urgent:\d+/g, '');
  r.notes = plain + '\nupcoming:' + document.getElementById('rem-up').value + '\nurgent:' + document.getElementById('rem-urg').value;
  await updateReminder(id, r);
  closeModal();
  toast('Reminder updated');
  showView('reminders');
}
setInterval(hideLevelButton, 600);

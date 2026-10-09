function hideLevelButton() {
  document.querySelectorAll('.level-btn').forEach(el => el.remove());
}
function noteVal(notes, key, fallback) {
  return (String(notes || '').match(new RegExp(key + ':([^\\n]+)')) || [])[1] || fallback;
}
function editReminder(id) {
  const r = (state.reminders || []).find(x => x.id === id);
  if (!r) return;
  const notes = r.notes || '';
  const mode = noteVal(notes, 'mode', 'either');
  openModal(`<div class="p-5"><h2 class="font-semibold mb-3">Edit reminder</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="space-y-3">
        <label class="form-label">Name</label><input id="rem-title" class="form-input" value="${r.title || ''}">
        <label class="form-label">Due date</label><input id="rem-date" type="date" class="form-input" value="${r.dueDate || ''}">
        <label class="form-label">Due odometer</label><input id="rem-odo" type="number" class="form-input" value="${r.dueOdometer || ''}">
        <label class="form-label">Upcoming within days</label><input id="rem-up" type="number" class="form-input" value="${noteVal(notes, 'upcoming', '30')}">
        <label class="form-label">Urgent within days</label><input id="rem-urg" type="number" class="form-input" value="${noteVal(notes, 'urgent', '7')}">
      </div>
      <div class="space-y-3">
        <label class="form-label">Upcoming within miles</label><input id="rem-up-mi" type="number" class="form-input" value="${noteVal(notes, 'upcomingMi', '500')}">
        <label class="form-label">Urgent within miles</label><input id="rem-urg-mi" type="number" class="form-input" value="${noteVal(notes, 'urgentMi', '100')}">
        <label class="form-label">Trigger</label>
        <select id="rem-mode" class="form-select">
          <option value="date" ${mode==='date'?'selected':''}>Date</option>
          <option value="odometer" ${mode==='odometer'?'selected':''}>Odometer</option>
          <option value="either" ${mode==='either'?'selected':''}>Whichever comes first</option>
        </select>
        <label class="flex items-center gap-2 text-sm"><input id="rem-recur" type="checkbox" ${/recur:yes/.test(notes)?'checked':''}> Recurring</label>
        <label class="form-label">Every miles</label><input id="rem-miles" type="number" class="form-input" value="${noteVal(notes, 'everyMiles', '')}" placeholder="2000">
        <label class="form-label">Every months</label><input id="rem-months" type="number" class="form-input" value="${noteVal(notes, 'everyMonths', '')}" placeholder="1">
      </div>
    </div>
    <p class="text-xs text-slate-400 mt-3">Fill miles, months, or both. Both means whichever comes first. Example: car wash every 2000 miles or every 1 month.</p>
    <button class="btn-primary mt-4" onclick="saveReminderEdit('${id}')">Save</button></div>`);
}
async function saveReminderEdit(id) {
  const r = state.reminders.find(x => x.id === id);
  r.title = document.getElementById('rem-title').value;
  r.dueDate = document.getElementById('rem-date').value;
  r.dueOdometer = document.getElementById('rem-odo').value ? +document.getElementById('rem-odo').value : null;
  r.notes = [
    'upcoming:' + document.getElementById('rem-up').value,
    'urgent:' + document.getElementById('rem-urg').value,
    'upcomingMi:' + document.getElementById('rem-up-mi').value,
    'urgentMi:' + document.getElementById('rem-urg-mi').value,
    'mode:' + document.getElementById('rem-mode').value,
    'recur:' + (document.getElementById('rem-recur').checked ? 'yes' : 'no'),
    'everyMiles:' + document.getElementById('rem-miles').value,
    'everyMonths:' + document.getElementById('rem-months').value
  ].join('\n');
  await updateReminder(id, r);
  closeModal();
  toast('Reminder updated');
  showView('reminders');
}
setInterval(hideLevelButton, 600);

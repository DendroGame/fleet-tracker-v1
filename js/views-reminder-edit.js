function urgencyRules() {
  const raw = localStorage.getItem('ft_urgency');
  return raw ? JSON.parse(raw) : { upcomingDays: 30, urgentDays: 7, upcomingMiles: 500, urgentMiles: 100 };
}
function reminderLevel(r, asset) {
  const rules = urgencyRules();
  const today = new Date();
  let days = null;
  if (r.dueDate) days = Math.ceil((new Date(r.dueDate) - today) / 86400000);
  let miles = null;
  if (r.dueOdometer && asset?.odometer) miles = r.dueOdometer - asset.odometer;
  if ((days != null && days <= rules.urgentDays) || (miles != null && miles <= rules.urgentMiles)) return 'urgent';
  if ((days != null && days <= rules.upcomingDays) || (miles != null && miles <= rules.upcomingMiles)) return 'upcoming';
  return 'good';
}
function openUrgencySettings() {
  const r = urgencyRules();
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Reminder levels</h2><label class="form-label">Upcoming within days</label><input id="up-days" type="number" class="form-input" value="${r.upcomingDays}"><label class="form-label">Urgent within days</label><input id="urg-days" type="number" class="form-input" value="${r.urgentDays}"><label class="form-label">Upcoming within miles</label><input id="up-mi" type="number" class="form-input" value="${r.upcomingMiles}"><label class="form-label">Urgent within miles</label><input id="urg-mi" type="number" class="form-input" value="${r.urgentMiles}"><p class="text-sm text-slate-400">Anything farther out is Good. These rules are what a later email or text would use.</p><button class="btn-primary" onclick="saveUrgencySettings()">Save</button></div>`);
}
function saveUrgencySettings() {
  localStorage.setItem('ft_urgency', JSON.stringify({
    upcomingDays: +document.getElementById('up-days').value,
    urgentDays: +document.getElementById('urg-days').value,
    upcomingMiles: +document.getElementById('up-mi').value,
    urgentMiles: +document.getElementById('urg-mi').value
  }));
  closeModal();
  toast('Reminder levels saved');
  showView('reminders');
}
function editReminder(id) {
  const r = (state.reminders || []).find(x => x.id === id);
  if (!r) return;
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Edit reminder</h2><label class="form-label">Name</label><input id="rem-title" class="form-input" value="${r.title || ''}"><label class="form-label">Due date</label><input id="rem-date" type="date" class="form-input" value="${r.dueDate || ''}"><label class="form-label">Due odometer</label><input id="rem-odo" type="number" class="form-input" value="${r.dueOdometer || ''}"><label class="form-label">Interval notes</label><input id="rem-notes" class="form-input" value="${r.notes || ''}"><button class="btn-primary" onclick="saveReminderEdit('${id}')">Save</button></div>`);
}
async function saveReminderEdit(id) {
  const r = state.reminders.find(x => x.id === id);
  r.title = document.getElementById('rem-title').value;
  r.dueDate = document.getElementById('rem-date').value;
  r.dueOdometer = document.getElementById('rem-odo').value ? +document.getElementById('rem-odo').value : null;
  r.notes = document.getElementById('rem-notes').value;
  await updateReminder(id, r);
  closeModal();
  toast('Reminder updated');
  showView('reminders');
}
const _renderLevels = renderReminders;
renderReminders = function (el) {
  _renderLevels(el);
  if (!el.querySelector('.level-btn')) {
    const btn = document.createElement('button');
    btn.className = 'btn-secondary text-sm level-btn mb-3';
    btn.textContent = 'Good / upcoming / urgent';
    btn.onclick = openUrgencySettings;
    el.prepend(btn);
  }
  const asset = currentAsset();
  (state.reminders || []).filter(r => !asset || r.assetId === asset.id).forEach(r => {
    const card = [...el.querySelectorAll('.card')].find(c => c.textContent.includes(r.title));
    if (!card || card.querySelector('.edit-rem')) return;
    const level = reminderLevel(r, asset);
    const tag = document.createElement('span');
    tag.className = 'text-xs ml-2 ' + (level === 'urgent' ? 'text-red-400' : level === 'upcoming' ? 'text-amber-400' : 'text-emerald-400');
    tag.textContent = level;
    card.appendChild(tag);
    const btn = document.createElement('button');
    btn.className = 'btn-secondary text-xs edit-rem mt-2';
    btn.textContent = 'Edit';
    btn.onclick = () => editReminder(r.id);
    card.appendChild(btn);
  });
};

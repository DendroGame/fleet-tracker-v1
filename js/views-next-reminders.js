function nextReminders() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const rows = (state.reminders || []).filter(r => !r.completed && (!asset || r.assetId === asset.id));
  rows.sort((a, b) => String(a.dueDate || '9999').localeCompare(String(b.dueDate || '9999')));
  const card = [...document.querySelectorAll('#main-content .card')].find(c => /reminder/i.test(c.textContent) && !/recent/i.test(c.textContent));
  if (!card || card.querySelector('.next-rems')) return;
  const box = document.createElement('div');
  box.className = 'next-rems mt-2 text-xs text-slate-300 space-y-1 overflow-hidden';
  box.style.maxHeight = '96px';
  box.innerHTML = rows.slice(0, 6).map(r => `<div>${r.dueDate || 'No date'} · ${r.title}</div>`).join('') || '<div>No upcoming reminders</div>';
  card.appendChild(box);
}
const _renderNext = renderDashboard;
renderDashboard = function (el) {
  _renderNext(el);
  setTimeout(nextReminders, 250);
};

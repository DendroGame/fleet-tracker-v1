function dueInMonths(months) {
  const base = document.getElementById('ex-date')?.value || new Date().toISOString().slice(0, 10);
  const d = new Date(base + 'T12:00:00');
  d.setMonth(d.getMonth() + months);
  const due = document.getElementById('ex-due');
  if (due) due.value = d.toISOString().slice(0, 10);
}
function dueButtons(kind) {
  const sets = {
    insurance: [6, 12],
    taxes: [3, 6, 12, 24],
    subscriptions: [1, 6, 12]
  };
  return (sets[kind] || []).map(n => `<button type="button" class="btn-secondary text-sm" onclick="dueInMonths(${n})">Due ${n} month${n === 1 ? '' : 's'}</button>`).join('');
}
function openExtraForm(kind) {
  const label = EXTRA_TABS.find(t => t[0] === kind)?.[1] || kind;
  const presets = dueButtons(kind);
  openModal(`<div class="p-5 space-y-3"><h2 class="font-semibold">Add ${label.slice(0, -1)}</h2>
    <label class="form-label">Name</label><input id="ex-name" class="form-input" required>
    <label class="form-label">Date</label><input id="ex-date" type="date" class="form-input" value="${new Date().toISOString().slice(0,10)}">
    <label class="form-label">Due date</label><input id="ex-due" type="date" class="form-input">
    ${presets ? `<div class="flex flex-wrap gap-2">${presets}</div>` : ''}
    <label class="form-label">Cost</label><input id="ex-cost" type="number" step="0.01" class="form-input">
    <label class="form-label">Notes</label><textarea id="ex-notes" class="form-input" rows="2"></textarea>
    <label class="form-label">File</label><input id="ex-file" type="file" class="form-input">
    <button class="btn-primary" onclick="saveExtra('${kind}')">Save</button></div>`);
}

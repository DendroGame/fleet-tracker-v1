/* The always-visible 3/4 ton box is removed. Use the Reminder preset dropdown. */
function renderPresetTable() { return ''; }
function applyThreeQuarterPreset() {
  const sel = document.querySelector('select');
  if (sel) sel.value = '3/4 ton vehicle reminders';
  if (typeof showPreset === 'function') showPreset('3/4 ton vehicle reminders');
}

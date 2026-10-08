function wireNowSelected() {
  const box = document.getElementById('now-selected');
  if (!box || box.dataset.wired) return;
  const wrap = box.parentElement;
  wrap.style.cursor = 'pointer';
  wrap.dataset.wired = '1';
  wrap.title = 'Back to garage';
  wrap.addEventListener('click', () => showView('garage'));
}
document.addEventListener('DOMContentLoaded', wireNowSelected);
setTimeout(wireNowSelected, 500);

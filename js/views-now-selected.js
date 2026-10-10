function wireNowSelected() {
  const box = document.getElementById('now-selected');
  if (!box) return;
  const wrap = box.parentElement;
  if (wrap.dataset.wired) return;
  wrap.style.cursor = 'pointer';
  wrap.dataset.wired = '1';
  wrap.title = 'Back to garage';
  wrap.addEventListener('click', () => {
    history.pushState({ view: 'garage' }, '', '/garage');
    showView('garage');
  });
}
document.addEventListener('DOMContentLoaded', wireNowSelected);
setTimeout(wireNowSelected, 500);
setInterval(wireNowSelected, 1500);

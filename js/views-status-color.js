function colorStatus() {
  const colors = {
    'out of service': ['rgba(220,38,38,.35)', '#fecaca'],
    'inspection pending': ['rgba(234,179,8,.35)', '#fde68a'],
    'inspection needed': ['rgba(245,158,11,.35)', '#fde68a'],
    'maintenance active': ['rgba(56,189,248,.35)', '#bae6fd'],
    'service needed': ['rgba(249,115,22,.35)', '#fed7aa'],
    'sold': ['rgba(100,116,139,.35)', '#e2e8f0'],
    'in service': ['rgba(22,163,74,.35)', '#bbf7d0']
  };
  document.querySelectorAll('.status-badge, #main-content .card span').forEach(el => {
    if (el.children.length) return;
    const text = (el.textContent || '').trim().toLowerCase();
    const match = Object.keys(colors).find(key => text === key || text.endsWith(key));
    if (!match) return;
    el.style.background = colors[match][0];
    el.style.color = colors[match][1];
    el.style.borderRadius = '999px';
    el.style.padding = '2px 8px';
  });
}
setInterval(colorStatus, 500);

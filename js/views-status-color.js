function colorStatus() {
  const colors = {
    'out of service': ['#dc2626', '#fff'],
    'inspection pending': ['#eab308', '#1c1917'],
    'inspection needed': ['#f59e0b', '#1c1917'],
    'maintenance active': ['#38bdf8', '#0f172a'],
    'service needed': ['#f97316', '#1c1917'],
    'sold': ['#64748b', '#fff'],
    'in service': ['#16a34a', '#fff']
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

function latestInspection() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const rows = (state.inspections || []).filter(r => !asset || r.assetId === asset.id);
  return rows.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0];
}
function problemLine(inspection) {
  if (!inspection?.notes) return '';
  return inspection.notes.split('\n').filter(line => line.includes(':') && !/odometer/i.test(line) && !/: Good$/i.test(line) && !/undefined/i.test(line)).map(line => {
    const [item, result] = line.split(':');
    return item.trim() + ' ' + result.trim().toLowerCase();
  }).join(', ');
}
function inspectionBanner() {
  let bar = document.getElementById('inspect-banner');
  const text = problemLine(latestInspection());
  if (!text) { bar?.remove(); return; }
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'inspect-banner';
    bar.className = 'px-4 py-2 text-sm font-medium';
    bar.style.background = '#eab308';
    bar.style.color = '#1c1917';
    document.querySelector('header')?.after(bar);
  }
  bar.textContent = text;
}
function oneInspectionList() {
  document.querySelectorAll('.odo-list').forEach(el => el.remove());
  if (document.getElementById('view-title')?.textContent !== 'Inspections') return;
  document.querySelectorAll('#main-content .card').forEach(card => {
    if (card.querySelector('.form-select, .insp-del')) return;
    const title = card.textContent || '';
    const match = (state.inspections || []).find(r => title.includes(r.date || 'no-date') && title.includes(r.result || ''));
    if (!match) return;
    const odo = (String(match.notes || '').match(/Odometer:\s*(\d+)/i) || [])[1];
    if (odo && !card.querySelector('.odo-line')) {
      const line = document.createElement('div');
      line.className = 'odo-line text-sm text-slate-400';
      line.textContent = odo + ' mi';
      card.appendChild(line);
    }
    const btn = document.createElement('button');
    btn.className = 'btn-danger text-xs insp-del mt-2';
    btn.textContent = 'Delete';
    btn.onclick = () => deleteInspection(match.id);
    card.appendChild(btn);
  });
}
function yellowPending() {
  document.querySelectorAll('#main-content .card span, .status-badge').forEach(el => {
    if (!/inspection pending/i.test(el.textContent || '')) return;
    el.style.background = '#eab308';
    el.style.color = '#1c1917';
    el.style.borderRadius = '999px';
    el.style.padding = '2px 8px';
  });
}
setInterval(() => { inspectionBanner(); oneInspectionList(); yellowPending(); }, 800);

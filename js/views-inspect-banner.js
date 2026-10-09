function latestInspection() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const rows = (state.inspections || []).filter(r => !asset || r.assetId === asset.id);
  return rows.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))[0];
}
function problemLine(inspection) {
  if (!inspection?.notes) return '';
  return inspection.notes.split('\n').filter(line => line.includes(':') && !/odometer/i.test(line) && !/: Good$/i.test(line)).map(line => {
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
function listInspectionOdo() {
  if (document.getElementById('view-title')?.textContent !== 'Inspections') return;
  const el = document.getElementById('main-content');
  if (!el || el.querySelector('.odo-list')) return;
  const asset = currentAsset();
  const rows = (state.inspections || []).filter(r => !asset || r.assetId === asset.id);
  const box = document.createElement('div');
  box.className = 'odo-list mt-4 space-y-2';
  box.innerHTML = rows.map(r => {
    const odo = (String(r.notes || '').match(/Odometer: (\d+)/) || [])[1] || 'No reading';
    return `<div class="card flex items-center justify-between"><div><div class="font-medium">${r.template || 'Inspection'} · ${r.result || ''}</div><div class="text-sm text-slate-400">${r.date || ''} · ${odo} mi</div></div><button class="btn-danger text-xs" onclick="deleteInspection('${r.id}')">Delete</button></div>`;
  }).join('') || '<p class="text-sm text-slate-400">No inspections yet</p>';
  el.appendChild(box);
}
setInterval(() => { inspectionBanner(); listInspectionOdo(); }, 800);

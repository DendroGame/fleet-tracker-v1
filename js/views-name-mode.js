function nameMode() {
  return localStorage.getItem('ft_tile_primary') || 'unit';
}
function vehicleName(a) {
  const model = [a?.year, a?.make, a?.model].filter(Boolean).join(' ') || 'No model';
  const unit = a?.unitNumber || 'No unit';
  return nameMode() === 'model' ? { title: model, sub: unit } : { title: unit, sub: model };
}
function nameSetting() {
  const title = document.getElementById('view-title')?.textContent || '';
  const main = document.getElementById('main-content');
  if (!main || main.querySelector('.name-mode')) return;
  if (!(title === 'General' || (title === 'Settings' && /general/i.test(main.textContent || '')))) return;
  const box = document.createElement('div');
  box.className = 'name-mode card mt-4 space-y-2';
  box.innerHTML = `<h2 class="font-semibold">Fleet names</h2><p class="text-xs text-slate-400">Applies to every vehicle, tile, and button.</p><label class="flex gap-2 text-sm"><input type="radio" name="nameMode" value="unit" ${nameMode()==='unit'?'checked':''}> Unit number first</label><label class="flex gap-2 text-sm"><input type="radio" name="nameMode" value="model" ${nameMode()==='model'?'checked':''}> Year / make / model first</label><button class="btn-primary" onclick="saveNameMode()">Save</button>`;
  main.appendChild(box);
}
function saveNameMode() {
  const mode = document.querySelector('[name="nameMode"]:checked')?.value || 'unit';
  localStorage.setItem('ft_tile_primary', mode);
  toast(mode === 'model' ? 'Year / make / model first' : 'Unit number first');
  if (typeof refreshSelectedLabel === 'function') refreshSelectedLabel();
  showView('garage');
}
function applyFleetNames() {
  const assets = state.assets || [];
  document.querySelectorAll('#main-content .card').forEach((card, i) => {
    const asset = assets[i] || assets.find(a => card.textContent.includes(a.unitNumber));
    if (!asset) return;
    const text = vehicleName(asset);
    const title = card.querySelector('.font-semibold, .font-bold, .font-medium');
    const sub = title?.parentElement?.querySelector('.text-xs');
    if (title && (title.textContent.trim() === asset.unitNumber || title.textContent.trim() === text.title || title.textContent.trim() === text.sub)) {
      title.textContent = text.title;
      title.className = 'font-bold text-xl';
    }
    if (sub) sub.textContent = text.sub;
    card.querySelectorAll('button, h2, .font-semibold').forEach(el => {
      if (el.children.length) return;
      if (el.textContent === asset.unitNumber + ' Settings') el.textContent = text.title + ' Settings';
    });
  });
  document.querySelectorAll('button, h1, h2').forEach(el => {
    if (el.children.length) return;
    assets.forEach(asset => {
      const text = vehicleName(asset);
      if (el.textContent === asset.unitNumber) el.textContent = text.title;
      if (el.textContent === asset.unitNumber + ' Settings') el.textContent = text.title + ' Settings';
      if (el.textContent === asset.unitNumber + ' settings') el.textContent = text.title + ' settings';
    });
  });
}
setInterval(() => { nameSetting(); applyFleetNames(); }, 700);

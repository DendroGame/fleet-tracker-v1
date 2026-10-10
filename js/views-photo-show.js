const tileBlobs = {};
async function fileBlob(key) {
  if (tileBlobs[key]) return tileBlobs[key];
  const headers = {};
  const token = sessionStorage.getItem('ft_token');
  if (token) headers.Authorization = 'Bearer ' + token;
  const paths = ['/api/files/' + key.split('/').map(encodeURIComponent).join('/'), '/api/photos/' + encodeURIComponent(key)];
  for (const path of paths) {
    const res = await fetch(API_BASE + path, { headers });
    if (res.ok) {
      tileBlobs[key] = URL.createObjectURL(await res.blob());
      return tileBlobs[key];
    }
  }
  return '';
}
async function loadGarageFiles() {
  try { return await api('/api/files'); } catch (e) { return []; }
}
function fileKey(row) { return row?.r2_key || row?.key || row?.path || ''; }
function keepPhotoBehind(card, img) {
  card.style.position = 'relative';
  card.style.overflow = 'hidden';
  img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;opacity:.5';
  [...card.children].forEach(child => {
    if (child === img) return;
    child.style.position = 'relative';
    child.style.zIndex = '1';
  });
}
async function paintAllTilePhotos() {
  if (document.getElementById('view-title')?.textContent !== 'Garage') return;
  const files = await loadGarageFiles();
  const cards = document.querySelectorAll('#main-content .card');
  for (let i = 0; i < (state.assets || []).length; i++) {
    const asset = state.assets[i];
    const card = cards[i];
    if (!card) continue;
    const fromNotes = (String(asset.notes || '').match(/__pkey__:([^\n]+)/) || [])[1] || '';
    const mode = (String(asset.notes || '').match(/__pmode__:([^\n]+)/) || [])[1] || 'background';
    const match = files.filter(f => String(f.unit_number || '') === String(asset.unitNumber) && /garage/i.test(f.category || ''));
    const key = fromNotes || fileKey(match[match.length - 1]);
    if (!key || mode === 'off') continue;
    const url = await fileBlob(key);
    if (!url) continue;
    if (mode === 'round') {
      const icon = card.querySelector('.text-2xl') || card.querySelector('.tile-round');
      if (!icon) continue;
      icon.classList.add('tile-round');
      icon.innerHTML = `<img src="${url}" alt="" style="width:40px;height:40px;border-radius:999px;object-fit:cover">`;
      icon.style.position = 'relative';
      icon.style.zIndex = '2';
      card.querySelector('.tile-photo')?.remove();
      continue;
    }
    let img = card.querySelector('.tile-photo');
    if (!img) {
      img = document.createElement('img');
      img.className = 'tile-photo';
      img.alt = '';
      card.prepend(img);
    }
    if (img.dataset.key !== key) { img.dataset.key = key; img.src = url; }
    keepPhotoBehind(card, img);
  }
}
setInterval(paintAllTilePhotos, 2000);

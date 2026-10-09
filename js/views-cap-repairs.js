function hideRepairs() {
  document.querySelectorAll('[data-view="repairs"]').forEach(el => el.remove());
}
function capFirst(text) {
  const t = text.trim();
  if (!t || t !== text.trim()) return text;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function capLabels() {
  document.querySelectorAll('button, label, h1, h2, h3, th, .form-label').forEach(el => {
    if (el.children.length) return;
    const next = capFirst(el.textContent);
    if (next !== el.textContent) el.textContent = next;
  });
  document.querySelectorAll('select option').forEach(opt => {
    const next = capFirst(opt.textContent);
    if (next !== opt.textContent) opt.textContent = next;
  });
}
hideRepairs();
setInterval(() => { hideRepairs(); capLabels(); }, 800);

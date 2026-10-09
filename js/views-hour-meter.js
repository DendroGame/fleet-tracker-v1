function hourAsset(asset) {
  return typeof calcMode === 'function' && calcMode(asset) === 'hour';
}
function labelHourMeter() {
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const hour = hourAsset(asset);
  document.querySelectorAll('label, .form-label, th, h2, p, span, div').forEach(el => {
    if (el.children.length) return;
    const text = el.textContent || '';
    if (hour && /^Odometer\b/.test(text)) el.textContent = text.replace(/^Odometer/, 'Hour meter');
    if (hour && /^Due odometer/.test(text)) el.textContent = text.replace('Due odometer', 'Due hour meter');
    if (hour && /^Odo:/.test(text)) el.textContent = text.replace('Odo:', 'Hours:');
    if (!hour && /^Hour meter/.test(text)) el.textContent = text.replace('Hour meter', 'Odometer');
  });
  if (hour) {
    const fuel = document.querySelector('[data-view="fuel"]');
    if (fuel && /trailer/i.test(asset?.type || '')) fuel.textContent = 'Hour meter';
  }
  (state.assets || []).forEach((a, i) => {
    if (!hourAsset(a)) return;
    const card = document.querySelectorAll('#main-content .card')[i];
    card?.querySelectorAll('span, div, p').forEach(el => {
      if (el.children.length) return;
      if (/^Odo:/.test(el.textContent || '')) el.textContent = el.textContent.replace('Odo:', 'Hours:');
    });
  });
}
setInterval(labelHourMeter, 700);

async function notifyEdit(subject, text) {
  const emails = (localStorage.getItem('ft_emails') || '').split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (!emails.length) return;
  try {
    await api('/api/notify', { method: 'POST', body: JSON.stringify({ subject, text, emails }) });
  } catch (e) {
    toast('Email not sent: ' + e.message, 'err');
  }
}
['saveAsset','saveService','saveFuel','saveReminder','saveSupply','saveTool','saveInspection'].forEach(name => {
  const fn = window[name];
  if (typeof fn !== 'function') return;
  window[name] = async function () {
    const result = await fn.apply(this, arguments);
    notifyEdit('Fleet Tracker edit', name.replace('save', '') + ' was edited');
    return result;
  };
});

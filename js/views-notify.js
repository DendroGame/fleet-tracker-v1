function notifyBox() {
  if (document.getElementById('view-title')?.textContent !== 'General') return;
  const el = document.getElementById('main-content');
  if (!el || el.querySelector('.notify-box')) return;
  const phones = localStorage.getItem('ft_phones') || '';
  const emails = localStorage.getItem('ft_emails') || '';
  const box = document.createElement('div');
  box.className = 'notify-box card mt-4 space-y-3';
  box.innerHTML = `<h2 class="font-semibold">Notifications</h2><label class="form-label">Text these numbers when a reminder is upcoming</label><textarea id="notify-phones" class="form-input" rows="3" placeholder="One number per line">${phones}</textarea><label class="form-label">Email these addresses when a record is edited</label><textarea id="notify-emails" class="form-input" rows="3" placeholder="One email per line">${emails}</textarea><button class="btn-primary" onclick="saveNotify()">Save lists</button><p class="text-xs text-slate-400">Lists are saved. Sending still needs a text and email service connected to the worker.</p>`;
  el.appendChild(box);
}
function saveNotify() {
  localStorage.setItem('ft_phones', document.getElementById('notify-phones').value);
  localStorage.setItem('ft_emails', document.getElementById('notify-emails').value);
  toast('Notification lists saved');
}
setInterval(notifyBox, 600);

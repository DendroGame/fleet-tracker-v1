function notifyBox() {
  const title = document.getElementById('view-title')?.textContent || '';
  const main = document.getElementById('main-content');
  if (!main) return;
  const onGeneral = title === 'General' || (/general/i.test(main.textContent || '') && title === 'Settings');
  if (!onGeneral) return;
  if (main.querySelector('.notify-box')) return;
  const emails = localStorage.getItem('ft_emails') || '';
  const box = document.createElement('div');
  box.className = 'notify-box card mt-4 space-y-3';
  box.innerHTML = `<h2 class="font-semibold">Notifications</h2><label class="form-label">Email these addresses when a record is edited</label><textarea id="notify-emails" class="form-input" rows="3" placeholder="One email per line">${emails}</textarea><button class="btn-primary" onclick="saveNotify()">Save list</button><p class="text-xs text-slate-400">Email is the only contact method. Sending uses the Worker secret.</p>`;
  main.appendChild(box);
}
function saveNotify() {
  localStorage.setItem('ft_emails', document.getElementById('notify-emails').value);
  toast('Email list saved');
}
setInterval(notifyBox, 600);

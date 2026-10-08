const AUTH_KEY = 'ft_token';
function authToken() { return sessionStorage.getItem(AUTH_KEY) || ''; }
async function loadUsernames() {
  try {
    const rows = await api('/api/users');
    return (rows || []).map(u => u.name);
  } catch (e) { return ["Jonathan's Fleet"]; }
}
function showLogin() {
  const root = document.getElementById('app');
  if (root) root.style.visibility = 'hidden';
  let box = document.getElementById('login-screen');
  if (!box) {
    box = document.createElement('div');
    box.id = 'login-screen';
    box.className = 'fixed inset-0 z-[80] flex items-center justify-center bg-slate-950 p-4';
    document.body.appendChild(box);
  }
  box.innerHTML = `
    <form id="login-form" class="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
      <div class="text-lg font-semibold">Fleet Tracker</div>
      <p class="text-sm text-slate-400">Sign in. Records stay in Cloudflare, not on this device.</p>
      <div><label class="form-label">Account</label><select id="login-user" name="name" class="form-select" required></select></div>
      <div><label class="form-label">Password</label><input name="password" type="password" class="form-input" required></div>
      <button class="btn-primary w-full" type="submit">Sign in</button>
      <p id="login-error" class="text-sm text-red-400 hidden"></p>
    </form>`;
  loadUsernames().then(names => {
    const sel = document.getElementById('login-user');
    const list = names.length ? names : ["Jonathan's Fleet"];
    sel.innerHTML = list.map(n => `<option>${n}</option>`).join('');
  });
  document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const err = document.getElementById('login-error');
    try {
      const res = await api('/api/login', { method: 'POST', body: JSON.stringify({ name: fd.get('name'), password: fd.get('password') }) });
      sessionStorage.setItem(AUTH_KEY, res.token);
      sessionStorage.setItem('ft_name', res.name);
      box.remove();
      if (root) root.style.visibility = '';
      location.reload();
    } catch (ex) {
      err.textContent = ex.message || 'Sign in failed';
      err.classList.remove('hidden');
    }
  };
}
function openNewAccountForm() {
  openModal(`<div class="p-5"><h2 class="text-lg font-semibold mb-4">New account</h2>
    <form onsubmit="saveNewAccount(event)" class="space-y-3">
      <div><label class="form-label">Name</label><input name="name" class="form-input" required></div>
      <div><label class="form-label">Password</label><input name="password" type="password" class="form-input" required minlength="6"></div>
      <div class="flex justify-end gap-2"><button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button><button class="btn-primary" type="submit">Create</button></div>
    </form></div>`);
}
async function saveNewAccount(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch(API_BASE + '/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + authToken() }, body: JSON.stringify({ name: fd.get('name'), password: fd.get('password') }) });
  if (!res.ok) { toast('Could not create account', 'err'); return; }
  toast('Account created');
  closeModal();
}
document.addEventListener('DOMContentLoaded', () => {
  if (!authToken()) showLogin();
});

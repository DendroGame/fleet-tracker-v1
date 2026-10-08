function selectedLabel() {
  const a = typeof currentAsset === 'function' ? currentAsset() : null;
  if (!a) return 'None';
  return `${a.unitNumber || 'Unit'} · ${a.year || ''} ${a.make || ''} ${a.model || ''}`.trim();
}

function refreshSelectedLabel() {
  const el = document.getElementById('now-selected');
  if (el) el.textContent = selectedLabel();
}

const _switchAsset = switchAsset;
switchAsset = function (id) {
  _switchAsset(id);
  refreshSelectedLabel();
};

function showSettings(panel) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector(`[data-settings="${panel}"]`);
  if (btn) btn.classList.add('active');
  document.getElementById('view-title').textContent = 'Settings';
  document.getElementById('view-subtitle').textContent = panel;
  const main = document.getElementById('main-content');
  if (panel === 'accounts') renderAccounts(main);
  else if (panel === 'dashboard') renderDashboardSettings(main);
  else renderGeneralSettings(main);
  if (window.innerWidth < 768) closeSidebarMobile();
}

async function renderAccounts(el) {
  el.innerHTML = `<div class="mb-4"><h2 class="text-lg font-semibold">Accounts</h2><p class="text-sm text-slate-400 mt-1">Usernames are listed here. Passwords are stored as hashes, so the current password cannot be shown. You can set a new one.</p></div><div id="account-list" class="text-sm text-slate-300">Loading…</div><button class="btn-primary mt-4" onclick="openNewAccountForm()">New account</button>`;
  try {
    const rows = await api('/api/users');
    document.getElementById('account-list').innerHTML = rows.map(u => `<div class="card mb-2">${u.name}</div>`).join('') || '<p>No accounts</p>';
  } catch (err) {
    document.getElementById('account-list').textContent = err.message;
  }
}

function renderDashboardSettings(el) {
  el.innerHTML = `
    <h2 class="text-lg font-semibold mb-2">Dashboard display</h2>
    <p class="text-sm text-slate-400 mb-4">Next thing we will build. Choose what each dashboard shows.</p>
    <div class="card space-y-2 text-sm">
      <label class="flex items-center gap-2"><input type="checkbox" checked disabled> Service cost</label>
      <label class="flex items-center gap-2"><input type="checkbox" checked disabled> Fuel cost</label>
      <label class="flex items-center gap-2"><input type="checkbox" checked disabled> Average MPG</label>
      <label class="flex items-center gap-2"><input type="checkbox" checked disabled> Open reminders</label>
      <p class="text-xs text-slate-500 pt-2">These switches will be saved in the next pass.</p>
    </div>`;
}

function renderGeneralSettings(el) {
  el.innerHTML = `
    <h2 class="text-lg font-semibold mb-2">General</h2>
    <p class="text-sm text-slate-400">Placeholder for later settings: company name, units (miles or hours), and export options.</p>`;
}

document.addEventListener('DOMContentLoaded', () => setTimeout(refreshSelectedLabel, 800));

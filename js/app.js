/**
 * Fleet Tracker v1.0 — Main Application
 * Connected to Cloudflare Worker + D1 + R2
 */

let state = {
  version: '1.0.0',
  currentAssetId: null,
  assets: [],
  serviceRecords: [],
  fuelRecords: [],
  reminders: [],
  supplies: [],
  tools: [],
  inspections: []
};
let charts = {};

document.addEventListener('DOMContentLoaded', async () => {
  const main = document.getElementById('main-content');
  main.innerHTML = `<div class="empty-state"><p class="text-lg">Loading from Cloudflare…</p></div>`;
  try {
    state = await loadAllData();
    populateAssetSelect();
    showView('garage');
    updateStatusBadge();
    toast('Connected to Cloudflare API');
  } catch (err) {
    main.innerHTML = `<div class="empty-state"><p class="text-lg text-red-400">Failed to load data</p><p class="text-sm mt-2">${err.message}</p></div>`;
    console.error(err);
  }
});

function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const ov = document.getElementById('sidebar-overlay');
  const isOpen = !sb.classList.contains('-translate-x-full');
  if (isOpen) { sb.classList.add('-translate-x-full'); ov.classList.add('hidden'); }
  else { sb.classList.remove('-translate-x-full'); ov.classList.remove('hidden'); }
}
function closeSidebarMobile() {
  if (window.innerWidth < 1024) {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.add('hidden');
  }
}

const VIEW_META = {
  garage: { title: 'Garage', sub: 'Vehicles, machines & trailers' },
  dashboard: { title: 'Dashboard', sub: 'Overview & analytics' },
  service: { title: 'Service Records', sub: 'Service, repairs & upgrades' },
  fuel: { title: 'Fuel Logs', sub: 'Fill-ups & economy tracking' },
  supplies: { title: 'Supplies', sub: 'Parts & fluid inventory' },
  inspections: { title: 'Inspections', sub: 'Checklists & status' },
  reminders: { title: 'Reminders', sub: 'Date, mileage & hour based' },
  tools: { title: 'Tools', sub: 'Equipment inventory' }
};

function showView(name) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const meta = VIEW_META[name] || { title: name, sub: '' };
  document.getElementById('view-title').textContent = meta.title;
  document.getElementById('view-subtitle').textContent = meta.sub;
  closeSidebarMobile();
  const main = document.getElementById('main-content');
  Object.values(charts).forEach(c => c.destroy());
  charts = {};
  switch (name) {
    case 'garage': renderGarage(main); break;
    case 'dashboard': renderDashboard(main); break;
    case 'service': renderService(main); break;
    case 'fuel': renderFuel(main); break;
    case 'supplies': renderSupplies(main); break;
    case 'inspections': renderInspections(main); break;
    case 'reminders': renderReminders(main); break;
    case 'tools': renderTools(main); break;
    default: main.innerHTML = '<p>View not found</p>';
  }
}

function populateAssetSelect() {
  const sel = document.getElementById('asset-select');
  sel.innerHTML = state.assets.map(a => {
    const label = `${a.unitNumber} · ${a.year || ''} ${a.make} ${a.model}`.trim();
    return `<option value="${a.id}" ${a.id === state.currentAssetId ? 'selected' : ''}>${label}</option>`;
  }).join('');
}

function switchAsset(id) {
  state.currentAssetId = id;
  updateStatusBadge();
  const active = document.querySelector('.nav-btn.active');
  if (active) showView(active.dataset.view);
}

function currentAsset() {
  return getAsset(state, state.currentAssetId);
}

function updateStatusBadge() {
  const badge = document.getElementById('asset-status-badge');
  const a = currentAsset();
  if (!a) { badge.classList.add('hidden'); return; }
  badge.classList.remove('hidden', 'status-healthy', 'status-due', 'status-oos');
  if (a.status === 'out-of-service') {
    badge.textContent = 'Out of Service';
    badge.classList.add('status-oos');
  } else if (a.status === 'due-soon') {
    badge.textContent = 'Due Soon';
    badge.classList.add('status-due');
  } else {
    badge.textContent = 'In Service';
    badge.classList.add('status-healthy');
  }
}

function toast(msg, type = 'ok') {
  const el = document.getElementById('toast');
  el.className = `fixed bottom-4 right-4 z-[70] px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
    type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
  }`;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 2800);
}

function openModal(html) {
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-root').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-root').classList.add('hidden');
}

// FULL APP LOGIC - see local vehicle-tracker-v1/js/app.js for complete source
// This version includes bootstrap + API connection. Re-deploy from local files for full UI.
console.log('Fleet Tracker v1.1 loaded - connected to Cloudflare API');

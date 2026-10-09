const CDL_PRETRIP = ['Lights','Tires','Brakes','Steering','Horn','Mirrors','Windshield and wipers','Fuel cap','Coupling','Cargo securement','Emergency equipment','Engine oil and coolant','Air system','Suspension'];
let cdlAnswers = [];
let cdlStep = 0;
function inspectionPreset() {
  return `<div class="card mb-4"><label class="form-label">Inspection preset</label><select class="form-select" onchange="startCdl(this.value)"><option value="">Choose a preset</option><option>CDL pre-trip</option></select><div id="inspect-preview"></div></div>`;
}
function startCdl(name) {
  if (name !== 'CDL pre-trip') { document.getElementById('inspect-preview').innerHTML = ''; return; }
  cdlAnswers = [];
  cdlStep = 0;
  askCdl();
}
function askCdl() {
  const box = document.getElementById('inspect-preview');
  if (cdlStep >= CDL_PRETRIP.length) return askCdlOdo();
  const item = CDL_PRETRIP[cdlStep];
  box.innerHTML = `<p class="text-sm text-slate-400 mt-3">${cdlStep + 1} of ${CDL_PRETRIP.length}</p><h2 class="text-xl font-semibold my-3">${item}</h2><div class="flex flex-wrap gap-2"><button class="btn-primary" onclick="answerCdl('Good')">Good</button><button class="btn-secondary" onclick="answerCdl('Needs maintenance')">Needs maintenance</button><button class="btn-danger" onclick="answerCdl('Fail')">Fail</button></div>`;
}
function answerCdl(result) {
  cdlAnswers.push({ item: CDL_PRETRIP[cdlStep], result });
  cdlStep++;
  askCdl();
}
function askCdlOdo() {
  const asset = currentAsset();
  document.getElementById('inspect-preview').innerHTML = `<h2 class="text-xl font-semibold my-3">Odometer</h2><label class="form-label">Reading required</label><input id="cdl-odo" type="number" class="form-input" value="${asset?.odometer || ''}" required><button class="btn-primary mt-3" onclick="finishCdl()">Save inspection</button>`;
}
async function finishCdl() {
  const asset = currentAsset();
  const odo = Number(document.getElementById('cdl-odo')?.value);
  if (!asset) return toast('Select a vehicle first', 'err');
  if (!odo) return toast('Odometer is required', 'err');
  const worst = cdlAnswers.some(r => r.result === 'Fail') ? 'Fail' : cdlAnswers.some(r => r.result === 'Needs maintenance') ? 'Needs maintenance' : 'Good';
  const status = worst === 'Fail' ? 'Out of service' : worst === 'Needs maintenance' ? 'Inspection pending' : 'In service';
  asset.odometer = odo;
  asset.status = status;
  await api('/api/inspections', { method: 'POST', body: JSON.stringify({ asset_id: asset.id, date: new Date().toISOString().slice(0, 10), template: 'CDL pre-trip', result: worst, notes: 'Odometer: ' + odo + '\n' + cdlAnswers.map(r => r.item + ': ' + r.result).join('\n') }) });
  await updateAsset(asset.id, asset);
  if (typeof loadAll === 'function') await loadAll();
  toast(worst + ' · ' + status);
  showView('dashboard');
}
function yellowPending() {
  document.querySelectorAll('.status-badge, span, div').forEach(el => {
    if (el.children.length) return;
    if (/inspection pending/i.test(el.textContent || '')) {
      el.style.background = '#eab308';
      el.style.color = '#1c1917';
    }
  });
}
const _renderCdlOdo = renderInspections;
renderInspections = function (el) {
  _renderCdlOdo(el);
  if (!document.getElementById('inspect-preview')) el.insertAdjacentHTML('afterbegin', inspectionPreset());
};
setInterval(yellowPending, 700);

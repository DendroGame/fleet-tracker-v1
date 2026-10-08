function addFileField(label) {
  const form = document.querySelector('#modal-content form');
  if (!form || form.querySelector('input[name="attachment"]')) return;
  const row = document.createElement('div');
  row.innerHTML = `<label class="form-label">${label}</label><input name="attachment" type="file" class="form-input">`;
  const actions = form.querySelector('.flex.justify-end');
  if (actions) form.insertBefore(row, actions);
  else form.appendChild(row);
}

async function uploadAttachment(form, category, recordId) {
  const file = form.querySelector('input[name="attachment"]')?.files?.[0];
  if (!file) return null;
  const asset = typeof currentAsset === 'function' ? currentAsset() : null;
  const unit = asset?.unitNumber || 'UNASSIGNED';
  const data = await fileToBase64(file);
  toast('Uploading file…');
  return api('/api/files', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      data,
      unit_number: unit,
      category,
      record_id: recordId || null
    })
  });
}

const _openFuel = openFuelForm;
openFuelForm = function (id) {
  _openFuel(id);
  addFileField('File (saved to Unit#/Fuel/)');
};
const _saveFuel = saveFuel;
saveFuel = async function (e, id) {
  await _saveFuel(e, id);
  try { await uploadAttachment(e.target, 'Fuel', id || null); } catch (err) { toast('File upload failed: ' + err.message, 'err'); }
};

const _openInsp = openInspectionForm;
openInspectionForm = function () {
  _openInsp();
  addFileField('File (saved to Unit#/Inspections/)');
};
const _saveInsp = saveInspection;
saveInspection = async function (e) {
  await _saveInsp(e);
  try { await uploadAttachment(e.target, 'Inspections', null); } catch (err) { toast('File upload failed: ' + err.message, 'err'); }
};

const _openAsset = openAssetForm;
openAssetForm = function (id) {
  _openAsset(id);
  addFileField('File (saved to Unit#/Garage/)');
};
const _saveAsset = saveAsset;
saveAsset = async function (e, id) {
  await _saveAsset(e, id);
  try { await uploadAttachment(e.target, 'Garage', id || null); } catch (err) { toast('File upload failed: ' + err.message, 'err'); }
};

const _openRem = openReminderForm;
openReminderForm = function () {
  _openRem();
  addFileField('File (saved to Unit#/Reminders/)');
};
const _saveRem = saveReminder;
saveReminder = async function (e) {
  await _saveRem(e);
  try { await uploadAttachment(e.target, 'Reminders', null); } catch (err) { toast('File upload failed: ' + err.message, 'err'); }
};

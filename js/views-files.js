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
  const unit = (asset && asset.unitNumber) ? asset.unitNumber : 'Shop';
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

function hookForm(openName, saveName, category, label) {
  const openFn = window[openName];
  const saveFn = window[saveName];
  if (typeof openFn !== 'function' || typeof saveFn !== 'function') return;
  window[openName] = function () {
    openFn.apply(this, arguments);
    addFileField(label);
  };
  window[saveName] = async function (e) {
    await saveFn.apply(this, arguments);
    try { await uploadAttachment(e.target, category, arguments[1] || null); }
    catch (err) { toast('File upload failed: ' + err.message, 'err'); }
  };
}

hookForm('openServiceForm', 'saveService', 'Service', 'File (saved to Unit#/Service/)');
hookForm('openFuelForm', 'saveFuel', 'Fuel', 'File (saved to Unit#/Fuel/)');
hookForm('openSupplyForm', 'saveSupply', 'Supplies', 'File (saved to Unit#/Supplies/)');
hookForm('openInspectionForm', 'saveInspection', 'Inspections', 'File (saved to Unit#/Inspections/)');
hookForm('openToolForm', 'saveTool', 'Tools', 'File (saved to Unit#/Tools/)');

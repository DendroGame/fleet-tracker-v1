/* Every Del removes the row from D1, then from the screen. */
async function hardDelete(path, listName, id, view) {
  if (!confirm('Delete this from Cloudflare? This cannot be undone.')) return;
  await api(path + '/' + id, { method: 'DELETE' });
  state[listName] = (state[listName] || []).filter(r => r.id !== id);
  toast('Deleted from D1');
  if (view) showView(view);
}
function deleteService(id) { return hardDelete('/api/service', 'serviceRecords', id, 'service'); }
function deleteFuel(id) { return hardDelete('/api/fuel', 'fuelRecords', id, 'fuel'); }
function deleteReminder(id) { return hardDelete('/api/reminders', 'reminders', id, 'reminders'); }
function deleteSupply(id) { return hardDelete('/api/supplies', 'supplies', id, 'supplies'); }
function deleteTool(id) { return hardDelete('/api/tools', 'tools', id, 'tools'); }
function deleteInspection(id) { return hardDelete('/api/inspections', 'inspections', id, 'inspections'); }
async function deleteAsset(id) {
  if (!confirm('Delete this asset and its records from D1? This cannot be undone.')) return;
  await deleteAssetApi(id);
  state.assets = state.assets.filter(a => a.id !== id);
  ['serviceRecords', 'fuelRecords', 'reminders', 'inspections'].forEach(k => {
    state[k] = (state[k] || []).filter(r => r.assetId !== id);
  });
  if (state.currentAssetId === id) state.currentAssetId = state.assets[0]?.id || null;
  toast('Asset deleted from D1');
  showView('garage');
}

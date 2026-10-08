if (typeof ASSET_STATES !== 'undefined' && !ASSET_STATES.some(s => s[0] === 'service-needed')) {
  ASSET_STATES.splice(1, 0, ['service-needed', 'Service Needed']);
}

function reminderIsDue(r) {
  if (!r || r.completed) return false;
  if (r.urgency === 'urgent' || r.urgency === 'high') return true;
  if (!r.dueDate) return false;
  return new Date(r.dueDate) <= new Date();
}

async function applyReminderStates() {
  if (!state || !state.assets) return;
  for (const asset of state.assets) {
    if (asset.status === 'sold' || asset.status === 'out-of-service') continue;
    const due = (state.reminders || []).some(r => r.assetId === asset.id && reminderIsDue(r));
    if (due && asset.status !== 'service-needed') {
      asset.status = 'service-needed';
      try { await updateAsset(asset.id, asset); } catch (e) {}
    }
    if (!due && asset.status === 'service-needed') {
      asset.status = 'in-service';
      try { await updateAsset(asset.id, asset); } catch (e) {}
    }
  }
  if (typeof updateStatusBadge === 'function') updateStatusBadge();
}

const _saveReminderState = saveReminder;
saveReminder = async function () {
  await _saveReminderState.apply(this, arguments);
  await applyReminderStates();
};

const _completeReminder = typeof completeReminder === 'function' ? completeReminder : null;
if (_completeReminder) {
  completeReminder = async function () {
    await _completeReminder.apply(this, arguments);
    await applyReminderStates();
  };
}

document.addEventListener('DOMContentLoaded', () => setTimeout(applyReminderStates, 1200));

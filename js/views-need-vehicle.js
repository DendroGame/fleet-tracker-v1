function requireVehicle(openName) {
  const fn = window[openName];
  if (typeof fn !== 'function' || fn.__needsVehicle) return;
  const wrapped = function () {
    const asset = typeof currentAsset === 'function' ? currentAsset() : null;
    if (!asset) {
      toast('Select a vehicle first', 'err');
      showView('garage');
      return;
    }
    return fn.apply(this, arguments);
  };
  wrapped.__needsVehicle = true;
  window[openName] = wrapped;
}
['openServiceForm','openFuelForm','openInspectionForm','openReminderForm','openSupplyForm','openToolForm'].forEach(requireVehicle);
const _goService = typeof goToService === 'function' ? goToService : null;
const _goInspect = typeof goToInspection === 'function' ? goToInspection : null;
if (_goService) goToService = function (id) { switchAsset(id); showView('service'); if (typeof openServiceForm === 'function') openServiceForm(); };
if (_goInspect) goToInspection = function (id) { switchAsset(id); showView('inspections'); if (typeof openInspectionForm === 'function') openInspectionForm(); };

async function offerInspectReminders(asset, date, answers) {
  const problems = answers.filter(r => r.result === 'Fail' || r.result === 'Needs maintenance');
  if (!problems.length) return;
  const names = problems.map(r => r.item + ' (' + r.result + ')').join('\n');
  if (!confirm('Set a reminder for these?\n\n' + names)) return;
  for (const row of problems) {
    await api('/api/reminders', {
      method: 'POST',
      body: JSON.stringify({
        asset_id: asset.id,
        title: row.item + ' ' + row.result.toLowerCase(),
        due_date: date,
        urgency: row.result === 'Fail' ? 'urgent' : 'normal',
        completed: false,
        notes: 'From inspection'
      })
    });
  }
  toast(problems.length + ' reminder' + (problems.length === 1 ? '' : 's') + ' added');
}
const _finishCdl = finishCdl;
finishCdl = async function () {
  const problems = cdlAnswers.filter(r => r.result === 'Fail' || r.result === 'Needs maintenance');
  const date = cdlDate;
  const asset = currentAsset();
  await _finishCdl.apply(this, arguments);
  if (asset) await offerInspectReminders(asset, date, problems);
};

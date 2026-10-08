function removePresetBox() {
  document.querySelectorAll('#main-content .card, #main-content div').forEach(el => {
    const heading = el.querySelector('h2');
    if (heading && heading.textContent.trim() === '3/4 ton vehicle reminders') el.remove();
  });
}
const _renderNoBox = renderReminders;
renderReminders = function (el) {
  _renderNoBox(el);
  removePresetBox();
};
setInterval(removePresetBox, 500);

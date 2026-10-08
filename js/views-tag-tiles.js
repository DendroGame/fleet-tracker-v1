/* Tag the dashboard tiles by the labels on screen. */
const _tagAll = tagDashTiles;
tagDashTiles = function () {
  _tagAll();
  document.querySelectorAll('#main-content .card').forEach(card => {
    const label = (card.textContent || '').toLowerCase();
    if (label.includes('service cost') || label.includes('service spend')) card.dataset.tile = 'service';
    else if (label.includes('fuel spend') || label.includes('fuel cost')) card.dataset.tile = 'fuel';
    else if (label.includes('mpg')) card.dataset.tile = 'mpg';
    else if (label.includes('reminder')) card.dataset.tile = 'reminders';
    else if (label.includes('status')) card.dataset.tile = 'status';
    else if (label.includes('hour')) card.dataset.tile = 'hours';
    else if (label.includes('odometer')) card.dataset.tile = 'odometer';
  });
};

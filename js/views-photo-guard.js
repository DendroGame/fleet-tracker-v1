function clearStrayPhotos() {
  if (document.getElementById('view-title')?.textContent === 'Garage') return;
  document.querySelectorAll('.tile-photo, .tile-scrim').forEach(el => el.remove());
  document.querySelectorAll('#main-content .card').forEach(card => {
    card.style.backgroundImage = '';
  });
}
const _paintGarageOnly = paintAllTilePhotos;
paintAllTilePhotos = async function () {
  if (document.getElementById('view-title')?.textContent !== 'Garage') {
    clearStrayPhotos();
    return;
  }
  return _paintGarageOnly();
};
setInterval(clearStrayPhotos, 500);

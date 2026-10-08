const _drawChartDollars = drawChart;
drawChart = function (id, labels, data, label, color) {
  if (id !== 'chart-fuel') return _drawChartDollars(id, labels, data, label, color);
  const ctx = document.getElementById(id);
  if (!ctx || typeof Chart === 'undefined') return;
  charts[id] = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Fuel cost', data, backgroundColor: color }] },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#cbd5e1' } },
        tooltip: { callbacks: { label: (item) => formatCurrency(item.raw) } }
      },
      scales: {
        x: { ticks: { color: '#94a3b8' } },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8',
            callback: (value) => '$' + Number(value).toLocaleString('en-US')
          }
        }
      }
    }
  });
};

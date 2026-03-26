let barChart = null;
let pieChart = null;
const CHART_COLORS = ['#3b82f6', '#1D9E75', '#EF9F27', '#D85A30', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// init
function populateYearSelect(transactions) {
  const sel = document.getElementById('c-year');
  if (!sel) return;
  const currentYear = new Date().getFullYear().toString();
  const years = [...new Set(transactions.map(t => t.date.split('-')[0]))];
  if (!years.includes(currentYear)) years.push(currentYear);
  
  const savedVal = sel.value;
  sel.innerHTML = years.sort((a,b) => b-a).map(y => `<option value="${y}">${y}</option>`).join('');
  if (savedVal) sel.value = savedVal;
}

// Lọc dữ liệu 
function getChartData(transactions) {
  const year = document.getElementById('c-year').value;
  const month = document.getElementById('c-month').value;
  const type = document.getElementById('c-type').value;

  return transactions.filter(t => {
    const [ty, tm] = t.date.split('-');
    if (year && ty !== year) return false;
    if (month && tm !== month) return false;
    if (type !== 'both' && t.type !== type) return false;
    return true;
  });
}

// control
function renderCharts(transactions) {
  if (typeof Chart === 'undefined') return;
  
  populateYearSelect(transactions);
  const data = getChartData(transactions);
  
  renderBarChart(data);
  renderPieChart(data);
  renderChartSummary(data);
}

// Vẽ biểu đồ cột
function renderBarChart(data) {
  const canvas = document.getElementById('chart-bar');
  const emptyEl = document.getElementById('chart-bar-empty');
  if (barChart) barChart.destroy();

  if (data.length === 0) {
    emptyEl.style.display = 'block';
    canvas.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  canvas.style.display = 'block';

  const month = document.getElementById('c-month').value;
  const type = document.getElementById('c-type').value;
  let labels, datasets = [];

  if (month) {
    const groups = {};
    data.forEach(t => groups[t.category] = (groups[t.category] || 0) + t.amount);
    labels = Object.keys(groups);
    datasets.push({
      label: 'Số tiền',
      data: Object.values(groups),
      backgroundColor: CHART_COLORS.map(c => c + 'bb')
    });
  } else {
    labels = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
    const inc = Array(12).fill(0), exp = Array(12).fill(0);
    data.forEach(t => {
      const m = parseInt(t.date.split('-')[1]) - 1;
      if (t.type === 'income') inc[m] += t.amount; else exp[m] += t.amount;
    });
    if (type === 'income' || type === 'both') datasets.push({ label: 'Thu', data: inc, backgroundColor: '#1D9E75bb' });
    if (type === 'expense' || type === 'both') datasets.push({ label: 'Chi', data: exp, backgroundColor: '#D85A30bb' });
  }

  barChart = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

// Vẽ biểu đồ tròn
function renderPieChart(data) {
  const canvas = document.getElementById('chart-pie');
  const emptyEl = document.getElementById('chart-pie-empty');
  const legendEl = document.getElementById('pie-legend');

  if (pieChart) pieChart.destroy();
  if (data.length === 0) {
    emptyEl.style.display = 'block';
    canvas.style.display = 'none';
    legendEl.innerHTML = '';
    return;
  }

  emptyEl.style.display = 'none';
  canvas.style.display = 'block';

  const groups = {};
  data.forEach(t => groups[t.category] = (groups[t.category] || 0) + t.amount);
  const labels = Object.keys(groups);
  const values = Object.values(groups);

  pieChart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{ data: values, backgroundColor: CHART_COLORS }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  });

  legendEl.innerHTML = labels.map((l, i) => `
    <div class="pie-legend-item">
      <span class="pie-dot" style="background:${CHART_COLORS[i % CHART_COLORS.length]}"></span>
      <span>${l}: ${new Intl.NumberFormat('vi-VN').format(values[i])} ₫</span>
    </div>`).join('');
}

function renderChartSummary(data) {
  const el = document.getElementById('chart-summary');
  const inc = data.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = data.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const fmt = (v) => new Intl.NumberFormat('vi-VN').format(v) + ' ₫';
  el.innerHTML = `
    <div class="summary-chips">
      <div class="chip income">Thu: ${fmt(inc)}</div>
      <div class="chip expense">Chi: ${fmt(exp)}</div>
      <div class="chip">Dư: ${fmt(inc - exp)}</div>
    </div>`;
}

function switchTab(tab) {
  document.getElementById('tab-bar').classList.toggle('active', tab === 'bar');
  document.getElementById('tab-pie').classList.toggle('active', tab === 'pie');
  document.getElementById('chart-bar-wrap').style.display = tab === 'bar' ? 'block' : 'none';
  document.getElementById('chart-pie-wrap').style.display = tab === 'pie' ? 'block' : 'none';
}
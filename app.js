const STORAGE_KEY = 'finance_tracker_v2';
const BUDGET_KEY  = 'finance_tracker_budgets';

let transactions = [];
let budgets = {}; 

const categoryIcons = {
  'Ăn uống':  '🍜',
  'Học tập':  '📚',
  'Đi lại':   '🚌',
  'Giải trí': '🎮',
  'Tiền nhà': '🏠',
  'Lương':    '💼',
  'Học bổng': '🎓',
  'Khác':     '📌'
};

// Local Storage

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  localStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
  showSaveBar();
}

function load() {
  const rawTx = localStorage.getItem(STORAGE_KEY);
  const rawBg = localStorage.getItem(BUDGET_KEY);
  if (rawTx) transactions = JSON.parse(rawTx);
  if (rawBg) budgets = JSON.parse(rawBg);
}

function showSaveBar() {
  const el = document.getElementById('save-bar');
  el.textContent = 'Đã thêm';
  el.className = 'save-bar ok';
  setTimeout(() => {
    el.textContent = '';
    el.className = 'save-bar';
  }, 500);
}

function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// tổng chi
function getSpentByCategory() {
  const now = new Date();
  const thisMonth = String(now.getMonth() + 1).padStart(2, '0'); // "03"
  const thisYear = String(now.getFullYear());                    // "2025"

  const spent = {};

  transactions.forEach(t => {
    if (t.type !== 'expense') return;
    const [year, month] = t.date.split('-');
    if (year === thisYear && month === thisMonth) spent[t.category] = (spent[t.category] || 0) + t.amount;
  });
  return spent;
}

// Thêm hạn mức
function addBudget() {
  const cat = document.getElementById('b-cat').value;
  const amount = parseFloat(document.getElementById('b-amount').value);

  if (!amount || amount <= 0) {
    alert('Vui lòng nhập hạn mức hợp lệ (lớn hơn 0)!');
    document.getElementById('b-amount').focus();
    return;
  }

  budgets[cat] = amount;  // Lưu vào object budgets (ghi đè nếu đã tồn tại)

  document.getElementById('b-amount').value = '';
  save();
  renderBudget();
  renderAlerts();
}

// Xóa dữ liệu
function deleteBudget(cat) {
  if (!confirm('Xóa hạn mức của "' + cat + '"?')) return;
  delete budgets[cat];
  renderBudget();
  renderAlerts();
}

function deleteTransaction(id) {
  if (!confirm('Xóa giao dịch này?')) return;
  transactions = transactions.filter(t => t.id !== id);
  render();
}

function clearAll() {
  if (!confirm('Xóa TẤT CẢ giao dịch? Hạn mức vẫn được giữ lại.')) return;
  transactions = [];
  render();
}

// Cập nhập hạn mức
function renderBudget() {
  const el = document.getElementById('budget-list');
  if (!el) return;
  const cats = Object.keys(budgets);

  if (cats.length === 0) {
    el.innerHTML = '<div class="empty-state">Chưa có hạn mức nào. Thêm hạn mức bên dưới!</div>';
    return;
  }

  const spent = getSpentByCategory();

  const html = cats.map(cat => {
    const limit = budgets[cat];
    const spentAmt = spent[cat] || 0;
    const pct = Math.min((spentAmt / limit) * 100, 100);
    const remain = limit - spentAmt;

    // Xác định trạng thái
    let statusClass, statusText;
    if (spentAmt > limit) {
      statusClass = 'over';
      statusText = 'Vượt ' + formatMoney(spentAmt - limit);
    } else if (pct >= 80) {
      statusClass = 'warn';
      statusText = 'Còn ' + formatMoney(remain) + ' (' + Math.round(100 - pct) + '%)';
    } else {
      statusClass = 'safe';
      statusText = 'Còn ' + formatMoney(remain) + ' (' + Math.round(100 - pct) + '%)';
    }

    return `
      <div class="budget-item">
        <div class="budget-item-top">
          <div class="budget-cat">${categoryIcons[cat] || '📌'} ${cat}</div>
          <button class="btn-del-budget" onclick="deleteBudget('${cat}')" title="Xóa hạn mức">×</button>
        </div>
        <div class="budget-amounts">
          Đã chi: <span class="spent">${formatMoney(spentAmt)}</span>
          / Hạn mức: <span class="limit">${formatMoney(limit)}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${statusClass}" style="width: ${pct.toFixed(1)}%"></div>
        </div>
        <div class="budget-status ${statusClass}">${statusText}</div>
      </div>
    `;
  }).join('');

  el.innerHTML = '<div class="budget-grid">' + html + '</div>';
}

// Cảnh báo vượt hạn mức
function renderAlerts() {
  const spent = getSpentByCategory();
  const overItems = [];
  const warnItems = [];

  Object.keys(budgets).forEach(cat => {
    const limit = budgets[cat];
    const spentAmt = spent[cat] || 0;
    const pct = (spentAmt / limit) * 100;

    if (spentAmt > limit) {
      // Đã vượt hạn mức
      overItems.push(
        `<li> ${categoryIcons[cat] || '📌'} <strong>${cat}</strong>: đã chi ${formatMoney(spentAmt)}, vượt ${formatMoney(spentAmt - limit)}</li>`
      );
    } else if (pct >= 80) {
      // Gần đạt hạn mức (> 80%)
      warnItems.push(
        `<li> ${categoryIcons[cat] || '📌'} <strong>${cat}</strong>: đã dùng ${Math.round(pct)}% hạn mức</li>`
      );
    }
  });

  // cảnh báo vượt hạn mức
  const overBox = document.getElementById('alert-over');
  const overList = document.getElementById('alert-over-list');
  overBox.style.display = overItems.length > 0 ? 'block' : 'none';
  overList.innerHTML = overItems.join('');

  // cảnh báo gần đạt
  const warnBox = document.getElementById('alert-warn');
  const warnList = document.getElementById('alert-warn-list');
  warnBox.style.display = warnItems.length > 0 ? 'block' : 'none';
  warnList.innerHTML = warnItems.join('');
}

// Thêm giao dịch
function addTransaction() {
  const name = document.getElementById('tx-name').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const type = document.getElementById('tx-type').value;
  const category = document.getElementById('tx-cat').value;
  const date = document.getElementById('tx-date').value;

  if (!name) {
    alert('Vui lòng nhập tên giao dịch!');
    document.getElementById('tx-name').focus();
    return;
  }
  if (!amount || amount <= 0) {
    alert('Vui lòng nhập số tiền hợp lệ (lớn hơn 0)!');
    document.getElementById('tx-amount').focus();
    return;
  }
  if (!date) {
    alert('Vui lòng chọn ngày!');
    return;
  }

  transactions.push({ id: generateId(), name, amount, type, category, date });
  document.getElementById('tx-name').value = '';
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-name').focus();

  save();
  render();
}

// Bộ lọc
function getFiltered() {
  const month = document.getElementById('f-month').value;
  const cat = document.getElementById('f-cat').value;
  const type = document.getElementById('f-type').value;

  return transactions.filter(t => {
    if (month && t.date.split('-')[1] !== month) return false;
    if (cat && t.category !== cat) return false;
    if (type && t.type !== type) return false;
    return true;
  });
}
// Xóa tất cả bộ lọc
function resetFilter() {
  document.getElementById('f-month').value = '';
  document.getElementById('f-cat').value = '';
  document.getElementById('f-type').value = '';
  render();
}

// Thống kê
function updateStats(filtered) {
  let totalIncome = 0;
  let totalExpense = 0;

  filtered.forEach(t => {
    if (t.type === 'income') totalIncome  += t.amount;
    else totalExpense += t.amount;
  });

  const balance = totalIncome - totalExpense;

  document.getElementById('s-income').textContent  = formatMoney(totalIncome);
  document.getElementById('s-expense').textContent = formatMoney(totalExpense);

  const balEl = document.getElementById('s-balance');
  balEl.textContent = formatMoney(balance);
  balEl.style.color = balance >= 0 ? '#1D9E75' : '#D85A30';
}

// ===========================
// Ds giao dịch
function renderList(filtered) {
  const metaEl = document.getElementById('list-meta');
  if (metaEl) metaEl.textContent = filtered.length + ' / ' + transactions.length + ' giao dịch';

  const el = document.getElementById('tx-list');
  if (!el) return;

  if (filtered.length === 0) {
    el.innerHTML = '<div class="empty-state">Không có giao dịch nào phù hợp bộ lọc.</div>';
    return;
  }

  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  el.innerHTML = sorted.map(t => {
    const icon = categoryIcons[t.category] || '📌';
    const dateStr = new Date(t.date + 'T00:00:00').toLocaleDateString('vi-VN');
    const sign = t.type === 'income' ? '+' : '-';

    return `
      <div class="tx-item">
        <div class="tx-icon ${t.type}">${icon}</div>
        <div class="tx-info">
          <div class="tx-name">
            ${escapeHtml(t.name)}
            <span class="badge ${t.type}">${t.category}</span>
          </div>
          <div class="tx-meta">${dateStr}</div>
        </div>
        <div class="tx-amount ${t.type}">${sign}${formatMoney(t.amount)}</div>
        <button class="tx-del" onclick="deleteTransaction('${t.id}')" title="Xóa">×</button>
      </div>
    `;
  }).join('');
}

// Cập nhập
function render() {
  const filtered = getFiltered();
  updateStats(filtered);    // Cập nhật 3 thẻ thống kê
  renderList(filtered);     // Cập nhật danh sách giao dịch
  renderBudget();           // Cập nhật thanh hạn mức
  renderAlerts();           // Cập nhật cảnh báo
  renderCharts();           // Cập nhật biểu đồ thống kê
}

// Dữ liệu mẫu
function addSample() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const prevDate = new Date(y, now.getMonth() - 1, 1);
  const py = prevDate.getFullYear();
  const pm = String(prevDate.getMonth() + 1).padStart(2, '0');

  const samples = [
    {name: 'Học bổng', amount: 1500000, type: 'income',  category: 'Học bổng', date: `${py}-${pm}-01`},
    {name: 'Tiền nhà',  amount: 1200000, type: 'expense', category: 'Tiền nhà', date: `${py}-${pm}-02`},
    {name: 'Ăn sáng + trưa', amount: 85000, type: 'expense', category: 'Ăn uống', date: `${py}-${pm}-05`},
    {name: 'Sách giáo trình', amount: 320000, type: 'expense', category: 'Học tập', date: `${py}-${pm}-06`},
    {name: 'Đi xe buýt', amount: 40000, type: 'expense', category: 'Đi lại', date: `${py}-${pm}-07`},
    {name: 'Làm thêm cuối tuần', amount: 500000, type: 'income', category: 'Lương', date: `${py}-${pm}-08`},
    {name: 'Cà phê bạn bè', amount: 65000, type: 'expense', category: 'Giải trí', date: `${py}-${pm}-10`},
    {name: 'Học bổng', amount: 1500000, type: 'income',  category: 'Học bổng', date: `${y}-${m}-01`},
    {name: 'Tiền nhà',  amount: 1200000, type: 'expense', category: 'Tiền nhà', date: `${y}-${m}-02`},
    {name: 'Ăn uống tuần 1', amount: 210000, type: 'expense', category: 'Ăn uống', date: `${y}-${m}-05`},
    {name: 'Vé xem phim', amount: 90000, type: 'expense', category: 'Giải trí', date: `${y}-${m}-06`},
    {name: 'Làm thêm', amount: 600000, type: 'income', category: 'Lương', date: `${y}-${m}-12`},
  ];

  // Thêm hạn mức mẫu
  budgets['Ăn uống'] = budgets['Ăn uống'] || 500000;
  budgets['Giải trí'] = budgets['Giải trí'] || 300000;
  budgets['Học tập'] = budgets['Học tập'] || 400000;
  budgets['Đi lại'] = budgets['Đi lại'] || 200000;

  samples.forEach(s => {
    transactions.push({
      id: generateId(),
      name: s.name,
      amount: s.amount,
      type: s.type,
      category: s.category,
      date: s.date
    });
  });

  save();
  render();
}

// tự động gọi render() -> danh sách lọc lại ngay
document.getElementById('f-month').addEventListener('change', render);
document.getElementById('f-cat').addEventListener('change', render);
document.getElementById('f-type').addEventListener('change', render);

document.getElementById('tx-amount').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTransaction();
});

document.getElementById('b-amount').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addBudget();
});

// KHỞI TẠO KHI TẢI TRANG
document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
load();  
render(); 

window.addEventListener('load', function() {
  renderCharts();
});

function render() {
  const filtered = getFiltered();
  updateStats(filtered);
  renderList(filtered);
  renderBudget();
  renderAlerts();
  
  // Gọi hàm từ file chart.js
  if (typeof renderCharts === 'function') {
    renderCharts(transactions); 
  }
}

document.addEventListener('DOMContentLoaded', () => {
  ['c-year', 'c-month', 'c-type'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => renderCharts(transactions));
  });

  load();
  render();
});

document.getElementById('c-year').addEventListener('change', renderCharts);
document.getElementById('c-month').addEventListener('change', renderCharts);
document.getElementById('c-type').addEventListener('change', renderCharts);

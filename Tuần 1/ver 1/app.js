// ===========================
// Personal Finance Tracker
// Vòng lặp 1 - Logic cơ bản
// ===========================

// Mảng lưu danh sách giao dịch
let transactions = [];

// Icon theo danh mục
const categoryIcons = {
  'Ăn uống': '🍜',
  'Học tập': '📚',
  'Đi lại': '🚌',
  'Giải trí': '🎮',
  'Tiền nhà': '🏠',
  'Lương': '💼',
  'Học bổng': '🎓',
  'Khác': '📌'
};

// ===========================
// Khởi tạo khi tải trang
// ===========================
document.addEventListener('DOMContentLoaded', function () {
  setTodayDate();
  updateStats();
  renderList();
});

// Tự động điền ngày hôm nay vào form
function setTodayDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('tx-date').value = today;
}

// ===========================
// Định dạng tiền tệ VNĐ
// ===========================
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
}

// ===========================
// Tạo ID duy nhất cho giao dịch
// ===========================
function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

// ===========================
// Thêm giao dịch mới
// ===========================
function addTransaction() {
  // Lấy dữ liệu từ form
  const name = document.getElementById('tx-name').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const type = document.getElementById('tx-type').value;
  const category = document.getElementById('tx-category').value;
  const date = document.getElementById('tx-date').value;

  // Validate dữ liệu
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
    alert('Vui lòng chọn ngày thực hiện!');
    return;
  }

  // Tạo object giao dịch mới
  const newTransaction = {
    id: generateId(),
    name: name,
    amount: amount,
    type: type,       // 'income' hoặc 'expense'
    category: category,
    date: date
  };

  // Thêm vào mảng
  transactions.push(newTransaction);

  // Reset form (giữ lại loại, danh mục, ngày để tiện nhập liên tục)
  document.getElementById('tx-name').value = '';
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-name').focus();

  // Cập nhật giao diện
  updateStats();
  renderList();
}

// ===========================
// Xóa giao dịch theo ID
// ===========================
function deleteTransaction(id) {
  if (!confirm('Bạn có chắc muốn xóa giao dịch này không?')) return;

  // Lọc bỏ giao dịch có id tương ứng
  transactions = transactions.filter(function (t) {
    return t.id !== id;
  });

  // Cập nhật giao diện
  updateStats();
  renderList();
}

// ===========================
// Cập nhật thống kê tổng quan
// ===========================
function updateStats() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(function (t) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }
  });

  const balance = totalIncome - totalExpense;

  // Hiển thị lên giao diện
  document.getElementById('total-income').textContent = formatMoney(totalIncome);
  document.getElementById('total-expense').textContent = formatMoney(totalExpense);

  const balanceEl = document.getElementById('balance');
  balanceEl.textContent = formatMoney(balance);

  // Đổi màu số dư: xanh nếu dương, đỏ nếu âm
  if (balance >= 0) {
    balanceEl.style.color = '#1D9E75';
  } else {
    balanceEl.style.color = '#D85A30';
  }
}

// ===========================
// Render danh sách giao dịch
// ===========================
function renderList() {
  const listEl = document.getElementById('tx-list');
  const countEl = document.getElementById('tx-count');

  // Cập nhật số lượng
  if (transactions.length > 0) {
    countEl.textContent = '(' + transactions.length + ' giao dịch)';
  } else {
    countEl.textContent = '';
  }

  // Nếu chưa có giao dịch nào
  if (transactions.length === 0) {
    listEl.innerHTML = '<div class="empty">Chưa có giao dịch nào. Hãy thêm giao dịch đầu tiên!</div>';
    return;
  }

  // Sắp xếp mới nhất lên đầu
  const sorted = [...transactions].sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

  // Tạo HTML cho từng giao dịch
  const html = sorted.map(function (t) {
    const icon = categoryIcons[t.category] || '📌';
    const dateStr = new Date(t.date).toLocaleDateString('vi-VN');
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
        <button class="tx-del" onclick="deleteTransaction('${t.id}')" title="Xóa giao dịch">×</button>
      </div>
    `;
  }).join('');

  listEl.innerHTML = html;
}

// ===========================
// Tránh XSS khi render HTML
// ===========================
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===========================
// Thêm dữ liệu mẫu để test
// ===========================
function addSample() {
  const sampleData = [
    { name: 'Học bổng tháng 3', amount: 1500000, type: 'income',  category: 'Học bổng', date: '2025-03-01' },
    { name: 'Tiền nhà tháng 3', amount: 1200000, type: 'expense', category: 'Tiền nhà', date: '2025-03-02' },
    { name: 'Ăn sáng + trưa',   amount: 85000,   type: 'expense', category: 'Ăn uống',  date: '2025-03-05' },
    { name: 'Sách giáo trình',  amount: 320000,  type: 'expense', category: 'Học tập',  date: '2025-03-06' },
    { name: 'Đi xe buýt tuần',  amount: 40000,   type: 'expense', category: 'Đi lại',   date: '2025-03-07' },
    { name: 'Làm thêm cuối tuần', amount: 500000, type: 'income', category: 'Lương',    date: '2025-03-08' },
  ];

  sampleData.forEach(function (s) {
    transactions.push({
      id: generateId(),
      name: s.name,
      amount: s.amount,
      type: s.type,
      category: s.category,
      date: s.date
    });
  });

  updateStats();
  renderList();
}

// ===========================
// Cho phép nhấn Enter để thêm
// ===========================
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target.id === 'tx-amount') {
    addTransaction();
  }
});

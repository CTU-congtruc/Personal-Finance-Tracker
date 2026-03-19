// Vòng lặp 2 – localStorage + Bộ lọc

const STORAGE_KEY = 'finance_tracker_v2'; // Key lưu trong localStorage
let transactions = []; // Mảng lưu tất cả giao dịch

// Icon theo danh mục
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

// ===========================
// LOCALSTORAGE – LƯU & TẢI DỮ LIỆU

// Lưu mảng transactions vào localStorage
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  showSaveBar();
}

// Tải dữ liệu từ localStorage khi mở trang
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    transactions = JSON.parse(raw);
  }
}

// Hiển thị thông báo "Đã lưu" trong 2.5 giây
function showSaveBar() {
  const el = document.getElementById('save-bar');
  el.textContent = '✓ Đã lưu tự động vào localStorage';
  el.className = 'save-bar ok';
  setTimeout(() => {
    el.textContent = '';
    el.className = 'save-bar';
  }, 2500);
}

// ===========================
// TIỆN ÍCH

// Định dạng tiền VNĐ
function formatMoney(amount) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + '₫';
}

// Tạo ID ngẫu nhiên
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// Escape HTML để tránh lỗi XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===========================
// THÊM GIAO DỊCH
function addTransaction() {
  const name = document.getElementById('tx-name').value.trim();
  const amount = parseFloat(document.getElementById('tx-amount').value);
  const type = document.getElementById('tx-type').value;
  const category = document.getElementById('tx-cat').value;
  const date = document.getElementById('tx-date').value;

  // Validate
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
  // Tạo giao dịch mới
  const newTx = {
    id: generateId(),
    name,
    amount,
    type, // 'income' hoặc 'expense'
    category,
    date
  };
  transactions.push(newTx);

  // Reset form
  document.getElementById('tx-name').value = '';
  document.getElementById('tx-amount').value = '';
  document.getElementById('tx-name').focus();

  // Lưu và cập nhật giao diện
  saveToStorage();
  render();
}

// ===========================
// XÓA GIAO DỊCH
function deleteTransaction(id) {
  if (!confirm('Bạn có chắc muốn xóa giao dịch này không?')) return;
  transactions = transactions.filter(t => t.id !== id);
  saveToStorage();
  render();
}

// ===========================
// XÓA TẤT CẢ
function clearAll() {
  if (!confirm('Xóa TẤT CẢ giao dịch? Hành động này không thể hoàn tác!')) return;
  transactions = [];
  saveToStorage();
  render();
}

// ===========================
// BỘ LỌC

// Lọc transactions theo tháng, danh mục, loại
function getFiltered() {
  const month = document.getElementById('f-month').value;   // vd: "03"
  const cat   = document.getElementById('f-cat').value;     // vd: "Ăn uống"
  const type  = document.getElementById('f-type').value;    // vd: "expense"

  return transactions.filter(t => {
    // Lọc theo tháng: lấy phần "MM" từ date "YYYY-MM-DD"
    if (month) {
      const txMonth = t.date.split('-')[1]; // "2025-03-05" → "03"
      if (txMonth !== month) return false;
    }
    
    if (cat && t.category !== cat) return false; // Lọc theo danh mục
    if (type && t.type !== type) return false; // Lọc theo loại thu/chi
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

// ===========================
// CẬP NHẬT THỐNG KÊ
function updateStats(filtered) {
  let totalIncome = 0;
  let totalExpense = 0;

  filtered.forEach(t => {
    if (t.type === 'income') totalIncome += t.amount;
    else totalExpense += t.amount;
  });
  const balance = totalIncome - totalExpense;

  document.getElementById('s-income').textContent = formatMoney(totalIncome);
  document.getElementById('s-expense').textContent = formatMoney(totalExpense);

  const balEl = document.getElementById('s-balance');
  balEl.textContent = formatMoney(balance);
  balEl.style.color = balance >= 0 ? '#1D9E75' : '#D85A30';
}

// ===========================
// RENDER DANH SÁCH
function render() {
  const filtered = getFiltered();

  // Cập nhật thống kê theo dữ liệu đang lọc
  updateStats(filtered);

  // Hiển thị "X / Y giao dịch"
  document.getElementById('list-meta').textContent = filtered.length + '/' + transactions.length + 'giao dịch';

  const listEl = document.getElementById('tx-list');

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="empty">Không có giao dịch nào phù hợp bộ lọc.</div>';
    return;
  }

  // Sắp xếp mới nhất lên đầu
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  listEl.innerHTML = sorted.map(t => {
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

// ===========================
// DỮ LIỆU MẪU
function addSample() {
  const samples = [
    {name: 'Học bổng tháng 3', amount: 1500000, type: 'income',  category: 'Học bổng', date: '2025-03-01'},
    {name: 'Tiền nhà tháng 3', amount: 1200000, type: 'expense', category: 'Tiền nhà', date: '2025-03-02' },
    {name: 'Ăn sáng + trưa', amount: 85000, type: 'expense', category: 'Ăn uống', date: '2025-03-05' },
    {name: 'Sách giáo trình', amount: 320000, type: 'expense', category: 'Học tập', date: '2025-03-06' },
    {name: 'Đi xe buýt tuần 1', amount: 40000, type: 'expense', category: 'Đi lại', date: '2025-03-07' },
    {name: 'Làm thêm cuối tuần', amount: 500000, type: 'income',  category: 'Lương', date: '2025-03-08' },
    {name: 'Cà phê bạn bè', amount: 65000, type: 'expense', category: 'Giải trí', date: '2025-03-10' },
    {name: 'Học bổng tháng 4', amount: 1500000, type: 'income',  category: 'Học bổng', date: '2025-04-01' },
    {name: 'Tiền nhà tháng 4', amount: 1200000, type: 'expense', category: 'Tiền nhà', date: '2025-04-02' },
    {name: 'Ăn uống tuần 1', amount: 210000, type: 'expense', category: 'Ăn uống', date: '2025-04-05' },
    {name: 'Vé xem phim', amount: 90000, type: 'expense', category: 'Giải trí', date: '2025-04-06' },
    {name: 'Làm thêm tháng 4', amount: 600000, type: 'income',  category: 'Lương', date: '2025-04-12' },
  ];

  samples.forEach(s => {
    transactions.push({ ...s, id: generateId() });
  });

  saveToStorage();
  render();
}

// ===========================
// tự động gọi render() -> danh sách lọc lại ngay
document.getElementById('f-month').addEventListener('change', render);
document.getElementById('f-cat').addEventListener('change', render);
document.getElementById('f-type').addEventListener('change', render);

// Nhấn Enter để số tiền tăng lên nhanh
document.getElementById('tx-amount').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTransaction();
});
// ===========================
// KHỞI TẠO KHI TẢI TRANG
document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
loadFromStorage(); // Tải dữ liệu từ localStorage
render();          // Hiển thị giao diện

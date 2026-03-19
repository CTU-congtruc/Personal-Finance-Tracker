# Personal Finance Tracker – v2.0

Ứng dụng web quản lý chi tiêu cá nhân dành cho sinh viên.  
Dự án 4 – Môn Nhập môn Lập trình | Trường Đại học Cần Thơ

---

## Tính năng

### Vòng lặp 1 (v1.0)
- Thêm giao dịch thu / chi
- Hiển thị danh sách, sắp xếp mới nhất lên đầu
- Xóa từng giao dịch
- Tính tổng thu, tổng chi, số dư tự động

### Vòng lặp 2 (v2.0) – Mới
- Lưu dữ liệu tự động vào `localStorage` (không mất khi F5)
- Tải lại dữ liệu khi mở trang
- Lọc giao dịch theo **tháng**
- Lọc giao dịch theo **danh mục**
- Lọc giao dịch theo **loại** (thu/chi)
- Thống kê cập nhật theo bộ lọc đang chọn
- Xóa tất cả dữ liệu

---

## Cách chạy

Mở file `index.html` bằng trình duyệt — không cần cài đặt gì thêm.

---

## Cấu trúc file

```
finance-tracker-v2/
├── index.html    # Giao diện chính
├── style.css     # CSS + responsive
├── app.js        # Logic JS + localStorage
└── README.md
```

---

## Công nghệ sử dụng

- HTML5, CSS3, JavaScript thuần (ES6+)
- Web Storage API (`localStorage`)
- `JSON.stringify` / `JSON.parse`
- `Array.filter()`, `Array.sort()`, `Array.forEach()`

---

## Commit history

```
feat: setup project structure
feat: add transaction form UI
feat: display transaction list
feat: calculate total balance
feat: add category system
feat: filter by month and category
feat: save data to localStorage
feat: load data on startup
feat: delete transaction with confirmation
style: improve responsive layout
docs: update README
```
# To‑Do List – Pengembangan Aplikasi **Kedai WONTONESIA**

Berikut langkah‑langkah terstruktur yang dapat diikuti untuk membangun aplikasi sesuai dengan blueprint pada `tech-stack.md`. Checklist ini dirancang agar setiap fase dapat dipantau kemajuannya secara jelas.

## ✅ Persiapan & Infrastruktur
- [ ] **Inisialisasi Project** – Buat repository Git, inisialisasi Vite + React + Tailwind.
- [ ] **Setup Supabase** – Buat proyek Supabase, aktifkan Auth, Database (PostgreSQL), dan Storage.
- [ ] **Konfigurasi Supabase di Frontend** – Tambahkan SDK Supabase, konfigurasi env variables.

## 🔐 Autentikasi & Keamanan
- [ ] **Login Google** – Implementasikan login menggunakan Supabase Auth.
- [ ] **Proteksi Route Admin** – Batasi akses dashboard hanya untuk email admin yang di‑whitelist.
- [ ] **Row‑Level Security (RLS)** – Atur kebijakan keamanan pada tabel Supabase.

## 📂 Skema Database
- [ ] **Tabel `users`** – uid, name, email, avatar_url, role.
- [ ] **Tabel `menus`** – id, name, price, category, image, description.
- [ ] **Tabel `orders`** – id, user_id, items[], total, status, type (dine‑in/delivery/pickup), table_no, address, pickup_time, shipping_fee.
- [ ] **Tabel `expenses`** – id, date, amount, description, category.
- [ ] **Tabel `inventory`** – id, item_name, current_stock, unit, last_update.

## 🎨 UI / Frontend
- [ ] **Landing & Login Page** – Halaman awal dengan tombol “Login with Google”.
- [ ] **Menu List** – Filter kategori, kartu menu responsive, integrasi Zustand untuk keranjang.
- [ ] **Keranjang & Checkout** – Pilihan Dine‑in, Delivery, Pickup; formulir alamat/meja/waktu pickup.
- [ ] **Order Confirmation** – Generate link WhatsApp dengan format pesan.
- [ ] **My Orders Page** – Real‑time tracking status order (Pending → Diproses → Dikirim/Saji → Selesai).

## 🛠️ Admin & POS
- [ ] **Dashboard Admin** – Tabel order masuk, filter status, edit shipping_fee, ubah status.
- [ ] **POS Kasir** – Input manual order walk‑in.
- [ ] **Manajemen Menu** – CRUD menu (tambah/edit/hapus) dengan gambar storage.
- [ ] **Manajemen Stok (Opname)** – Form input sisa stok harian.
- [ ] **Manajemen Keuangan** – CRUD expenses, laporan profit/loss dengan Recharts.
- [ ] **Manajemen Kurir** – Assign kurir ke order delivery.

## 📊 Reporting & Analytics
- [ ] **Laporan Keuangan** – Dashboard grafik penjualan, pengeluaran, profit.
- [ ] **Analytics** – Optional integrasi Google Analytics atau Supabase Analytics.

## 🧪 Testing & Quality Assurance
- [ ] **Unit Tests** – Jest + React Testing Library.
- [ ] **E2E Tests** – Cypress untuk alur checkout dan admin.
- [ ] **Linting & Formatting** – ESLint + Prettier.

## 🚀 CI / CD & Deployment
- [ ] **GitHub Actions** – Lint, test, build, deploy otomatis.
- [ ] **Deploy** – Vercel / Netlify / Supabase Edge Functions (untuk API).

## 📦 Optimisasi Produksi
- [ ] **Lazy Loading** – Split kode komponen.
- [ ] **Caching & CDN** – Vite‑plugin‑pwa + Cloudflare CDN.
- [ ] **Error Monitoring** – Sentry atau LogRocket.
- [ ] **Feature Flags** – Toggle fitur pickup via Supabase KV.

## 📁 Struktur Folder (Referensi)
```
/src
  /api          # Supabase config & edge functions
  /components   # UI components (Navbar, Button, MenuCard)
  /context      # Global state (AuthContext)
  /store        # Zustand store (CartStore)
  /pages
    /public     # Login, Landing Page
    /user       # Menu, MyOrders, Profile
    /admin      # Dashboard, Inventory, Finance, POS
  /utils        # Helpers (FormatRupiah, WhatsAppLink, DateUtils)
```

---

> **Catatan:** Checklist di atas dapat disesuaikan seiring dengan perkembangan proyek. Tandai setiap item setelah selesai untuk memantau kemajuan secara real‑time.
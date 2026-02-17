Kedai WONTONESIA – Blueprint lengkap untuk aplikasi PWA Kedai Makanan Anda. Dengan memilih input stok manual setiap sore, sistem Anda menjadi lebih sederhana namun tetap akurat untuk memantau selisih (discrepancy) antara penjualan dan stok fisik.
Tech Stack Lengkap (The "Modern Web" Stack)
| Komponen | Teknologi | Alasan |
|---|---|---|
| Frontend | React.js (Vite) | Cepat, ringan, dan ekosistem web modern. |
| Styling | Tailwind CSS | Mempercepat pembuatan UI yang responsive di mobile & desktop. |
| Icons | Lucide React | Ikon minimalis dan ringan. |
| Database | Supabase (PostgreSQL) | Database real‑time dengan kemampuan SQL dan sync. |
| Auth | Supabase Auth | Login Google Mail yang aman dan cepat melalui Supabase. |
| Storage | Supabase Storage | Untuk menyimpan foto menu makanan. |
| State Mgmt | Zustand | Lebih ringan dari Redux untuk mengelola Keranjang & Session User. |
| Charts | Recharts | Visualisasi grafik keuntungan & penjualan di Dashboard Admin. |
Fitur Utama Aplikasi (Detail & Spesifik)
A. Sisi Pelanggan
Login Google: Akses cepat, menyimpan riwayat order, dan alamat delivery.
Menu Multi‑Kategori: Filter kategori (Makanan, Minuman, Snack).
Hybrid Checkout:
* Dine‑in: Input nomor meja.
* Delivery: Input alamat lengkap & share loc link.
* Pickup (Ambil di Kedai): Pilih “Pickup”, pilih waktu pengambilan, dan sistem akan menyiapkan pesanan untuk diambil.
Direct WhatsApp Order: Tombol kirim pesanan yang memformat teks otomatis:
Halo Admin, saya [Nama]. Order: 2 Nasi Goreng (Rp30rb). Total: Rp30rb. Metode: Delivery. Alamat: [Link Maps/Teks].
WhatsApp: +6281250070876
Order Tracking: Bar status pesanan (Pending → Diproses → Dikirim/Saji → Selesai).
B. Sisi Admin & POS (Dashboard Terproteksi)
POS Kasir: Input pesanan walk‑in (pelanggan datang langsung) ke database.
Order Management: Tombol ubah status pesanan dan Input Ongkir Manual setelah diskusi di WA.
Manajemen Menu: Tambah/Edit/Hapus menu dan harga.
Manajemen Stok (Opname Sore): Form input sisa stok bahan baku setiap sore untuk melihat pemakaian harian.
Manajemen Keuangan: * Pencatatan pengeluaran (belanja bahan, listrik, gaji).
Laporan Profit/Loss (Penjualan - Pengeluaran).
Manajemen Kurir: Assign kurir ke pesanan delivery tertentu.
Tahapan Development (Step‑by‑Step)
Tahap 1: Setup & Authentication
Inisialisasi Project Vite + React + Tailwind.
Setup Supabase Project di Console.
Implementasi Login Google menggunakan Supabase Auth.
Proteksi Route (Halaman Admin hanya bisa diakses email tertentu).
Tahap 2: Database & Menu (Frontend Pelanggan)
Membuat tabel menus di Supabase.
Membuat UI daftar menu dengan kategori dan fitur Keranjang (Cart).
Membuat logika Checkout untuk menghasilkan format pesan WhatsApp.
Tahap 3: Order Flow & Status Pesanan
Menyimpan data pesanan ke tabel orders di Supabase.
Membuat halaman "Pesanan Saya" untuk pelanggan memantau status secara real‑time.
Tahap 4: Dashboard Admin & POS
Membuat tabel pesanan masuk untuk Admin.
Fitur edit nominal (untuk input ongkir manual) dan update status.
Membuat form POS sederhana untuk input pesanan manual dari kasir.
Tahap 5: Keuangan & Stok (ERP Mini)
Membuat tabel expenses untuk mencatat pengeluaran.
Membuat tabel inventory untuk input stok manual setiap sore.
Membuat halaman Laporan Keuangan dengan grafik (Recharts).
Struktur Database Supabase (Data Schema)
users: uid, name, email, avatar_url, role (admin/user)
menus: id, name, price, category, image, description
orders: id, user_id, items[], total, status, type (dine‑in/delivery/pickup), table_no, address, pickup_time, shipping_fee
expenses: id, date, amount, description, category
inventory: id, item_name, current_stock, unit (kg/pcs), last_update
Ide Perbaikan Arsitektur untuk Simplicity & Production‑Readiness
- **TypeScript**: Migrasi seluruh kode ke TypeScript untuk safety dan autocompletion.
- **Serverless Functions (Supabase Edge Functions)**: Tangani logika bisnis (mis. perhitungan ongkir, notifikasi) di sisi server tanpa mengelola server.
- **CI/CD Pipeline**: Gunakan GitHub Actions untuk linting, testing, dan deployment otomatis ke Vercel/Netlify atau Firebase Hosting.
- **Caching & CDN**: Manfaatkan Vite‑plugin‑pwa + Cloudflare CDN untuk asset static dan API response caching.
- **Error Monitoring**: Integrasikan Sentry atau LogRocket untuk pelacakan error di produksi.
- **Feature Flags**: Implementasikan toggle (mis. untuk fitur pickup) menggunakan Supabase KV atau environment variables.
- **Testing**: Tambahkan unit test dengan Jest/React Testing Library dan e2e test dengan Cypress.
- **Security**: Aktifkan RLS (Row‑Level Security) di Supabase, gunakan HTTPS, dan sanitasi semua input.
- **Performance**: Lazy‑load komponen, gunakan React.memo, dan optimalkan gambar dengan next‑image‑like loader.
Struktur Folder Project yang Disarankan
/src
/api # Supabase config & edge functions
/components # UI Components (Navbar, Button, MenuCard)
/context # Global State (AuthContext)
/store # Zustand Store (CartStore)
/pages
/public # Login, Landing Page
/user # Menu, MyOrders, Profile
/admin # Dashboard, Inventory, Finance, POS
/utils # Helper (FormatRupiah, WhatsAppLink, DateUtils)
Pertanyaan Tambahan untuk Anda:
Proteksi Admin: Apakah Anda ingin membatasi akses Admin berdasarkan Email Address spesifik (misal: hanya email Anda yang bisa buka Dashboard)
Foto Menu: buatkan placeholder dulu di kode nanti.
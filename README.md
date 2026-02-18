# Kedai WONTONESIA

Aplikasi modern untuk mengelola kedai makanan dengan fitur lengkap mulai dari pesanan pelanggan hingga manajemen keuangan.

## Tech Stack

- **Frontend**: React.js (Vite) + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **State Management**: Zustand
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library

## Fitur Utama

### Sisi Pelanggan
- 🔐 Login dengan Google
- 📱 Menu multi-kategori dengan filter
- 🛒 Keranjang belanja
- 💳 Checkout (Dine-in, Delivery, Pickup)
- 📱 Direct WhatsApp Order
- 📊 Real-time order tracking

### Sisi Admin & POS
- 📊 Dashboard dengan statistik penjualan
- 🏪 POS Kasir untuk input pesanan manual
- 📋 Manajemen menu (CRUD)
- 📦 Manajemen stok harian
- 💰 Manajemen keuangan & laporan
- 👥 Manajemen kurir

## Instalasi

1. Clone repository:
```bash
git clone https://github.com/axaindopratama/Kedai-WONTONESIA-R1.git
cd Kedai-WONTONESIA-R1
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` dengan konfigurasi Supabase Anda:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=admin@kedaiwontonesia.com
```

5. Setup Supabase:
   - Buat project di [Supabase Dashboard](https://app.supabase.com)
   - Aktifkan Authentication (Google OAuth)
   - Buat tabel sesuai schema di `src/supabase/types.ts`
   - Setup Storage untuk gambar menu

6. Jalankan development server:
```bash
npm run dev
```

## Struktur Folder

```
src/
├── api/           # Supabase config & edge functions
├── components/    # UI Components
├── context/       # Global state (Auth)
├── pages/         # Halaman aplikasi
│   ├── public/    # Landing, Login
│   ├── user/      # Menu, Orders
│   └── admin/     # Dashboard, POS, Menu, Inventory, Finance
├── store/         # Zustand stores
├── supabase/      # Database types & client
└── utils/         # Helper functions
```

## Database Schema

### users
- `uid` (string)
- `name` (string)
- `email` (string)
- `avatar_url` (string, nullable)
- `role` ('admin' | 'user')

### menus
- `id` (string)
- `name` (string)
- `price` (number)
- `category` (string)
- `image` (string, nullable)
- `description` (string, nullable)

### orders
- `id` (string)
- `user_id` (string)
- `items` (OrderItem[])
- `total` (number)
- `status` ('pending' | 'processing' | 'shipped' | 'delivered' | 'completed')
- `type` ('dine-in' | 'delivery' | 'pickup')
- `table_no` (string, nullable)
- `address` (string, nullable)
- `pickup_time` (string, nullable)
- `shipping_fee` (number, nullable)

### expenses
- `id` (string)
- `date` (string)
- `amount` (number)
- `description` (string)
- `category` (string)

### inventory
- `id` (string)
- `item_name` (string)
- `current_stock` (number)
- `unit` (string)
- `last_update` (string)

## Scripts

- `npm run dev` - Development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Kontribusi

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Lisensi

MIT License - lihat [LICENSE](LICENSE) file untuk detail.
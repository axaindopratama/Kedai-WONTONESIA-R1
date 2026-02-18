# Kedai WONTONESIA - Setup Guide

This guide will help you set up the complete application with Supabase database, including inventory management integration.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (https://supabase.com)
- Git

## 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
cd Kedai-WONTONESIA-R1

# Install dependencies
npm install
```

## 2. Set Up Supabase Project

### 2.1 Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter project details:
   - Name: `kedai-wontonesia`
   - Database Password: (choose a strong password)
   - Region: Select closest to your location
4. Wait for the project to be created

### 2.2 Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - `URL` (e.g., `https://abcde.supabase.co`)
   - `anon` `public` key

## 3. Configure Environment Variables

### 3.1 Copy Environment Example

```bash
cp .env.example .env
```

### 3.2 Update `.env` File

Open `.env` and update with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Admin Email (for admin route protection)
VITE_ADMIN_EMAIL=admin@kedaiwontonesia.com
```

**Important:** Replace `your-project.supabase.co` and `your-anon-key-here` with your actual Supabase credentials.

## 4. Set Up Database Schema

### 4.1 Open SQL Editor

1. In your Supabase project dashboard, go to **SQL** → **Editor**
2. You should see a blank editor

### 4.2 Run Database Migration

Copy the entire contents of `supabase/schema.sql` and paste it into the SQL editor, then click **Run**.

Alternatively, you can run migrations one by one:

```sql
-- Run the full schema
[Paste contents of supabase/schema.sql here]
```

### 4.3 Verify Tables Created

After running the schema, verify these tables exist:
- `users` (extends auth.users)
- `menus`
- `inventory`
- `menu_ingredients`
- `orders`
- `expenses`

Also verify these functions exist:
- `deduct_inventory_for_order(JSONB)`
- `get_daily_sales(DATE)`
- `get_monthly_sales(INTEGER, INTEGER)`
- `get_total_expenses(DATE, DATE)`

## 5. Set Up Row Level Security (RLS)

The schema.sql already includes RLS policies. Verify they're enabled:

1. Go to **Authentication** → **Policies**
2. Check that policies are created for each table
3. Ensure "Enabled" toggle is ON for all policies

## 6. Enable Google OAuth Provider

### 6.1 Enable Google in Supabase

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and toggle it to **ENABLE**

### 6.2 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Add a name (e.g., "Kedai WONTONESIA")
7. **Authorized redirect URIs**: Add:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
   Replace with your actual Supabase URL
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**
10. Paste these into the Supabase Google provider settings
11. Save the provider configuration

### 6.3 Configure Allowed Email Domains (Optional)

If you want to restrict login to specific email domains:
1. In the Google provider settings in Supabase
2. Under **Allowed email domains**, you can add domains (e.g., `gmail.com`)
3. Leave blank to allow any Google account

## 7. Create Admin User

### 7.1 Sign Up a User

1. Open your application in the browser (run `npm run dev`)
2. Click "Sign Up" and create an account with your email
3. Verify your email if required

### 7.2 Set User as Admin

1. Go to your Supabase project dashboard
2. Go to **SQL** → **Editor**
3. Run the following SQL (replace `your-email@example.com` with your admin email):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

4. Verify the update:

```sql
SELECT uid, email, role FROM users WHERE email = 'your-email@example.com';
```

You should see `role = 'admin'`.

## 8. Configure URL Settings

### 8.1 Development (localhost)

1. Go to Supabase dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `http://localhost:3000`
3. In **Redirect URLs**, add: `http://localhost:3000`
4. Click **Save**

### 8.2 Production (Vercel)

After deploying to Vercel (see section 12):
1. Set **Site URL** to: `https://your-app.vercel.app`
2. In **Redirect URLs**, add: `https://your-app.vercel.app`
3. Optionally add wildcard: `https://*.vercel.app`
4. Click **Save**

## 9. Configure Admin Email (Optional)

Update `.env` with your admin email:

```env
VITE_ADMIN_EMAIL=admin@kedaiwontonesia.com
```

Change `admin@kedaiwontonesia.com` to your actual admin email address.

## 10. Seed Sample Data (Optional)

### 10.1 Add Inventory Items

1. Log in as admin
2. Go to **Inventory** page
3. Click "Tambah Item" and add inventory items, for example:
   - Daging Sapi: 10 kg
   - Bumbu Rujak: 5 kg
   - Mie Instan: 100 pcs
   - Minuman Bersoda: 50 botol

### 10.2 Add Menu Items

1. Go to **Menu** (admin) page
2. Add menu items with prices and categories

### 10.3 Link Menu to Ingredients (CRITICAL for inventory deduction)

To enable automatic inventory deduction when orders are placed, you need to link each menu item to its ingredients:

1. Go to **SQL Editor** in Supabase
2. Insert menu_ingredients records. Example for "Mie Aceh Goreng":

```sql
-- First, get the menu_id and inventory_item_id
-- Replace these UUIDs with actual IDs from your database

INSERT INTO menu_ingredients (menu_id, inventory_item_id, quantity_used, unit)
VALUES (
  'menu-uuid-here',           -- UUID from menus table for "Mie Aceh Goreng"
  'inventory-uuid-here',      -- UUID from inventory table for "Mie Instan"
  1,                          -- 1 pack of mie per order
  'pcs'                       -- unit matches inventory unit
);
```

3. Repeat for all ingredients needed for each menu item

**Example Setup:**
If "Mie Aceh Goreng" uses:
- 1 pack of Mie Instan
- 0.5 kg of Daging Sapi
- 0.2 kg of Bumbu Rujak

You would create 3 records in `menu_ingredients` linking the menu to each inventory item with respective quantities.

## 11. Test the Application

### 11.1 Start Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`

### 11.2 Test Admin POS Flow

1. Log in as admin
2. Go to **POS Kasir** page
3. Add items to cart
4. Enter table number
5. Click "Buat Pesanan"
6. Verify:
   - Order is created in `orders` table
   - Inventory is deducted (check `inventory.current_stock`)
   - Cart is cleared
   - Success toast appears

### 11.3 Test User Checkout Flow

1. Log out and log in as a regular user
2. Browse menu and add items to cart
3. Go to checkout
4. Select delivery type and fill required fields
5. Click "Pesan Sekarang"
6. Verify:
   - WhatsApp message is generated
   - Order is created in `orders` table
   - Inventory is deducted
   - Cart is cleared
   - Redirected to My Orders page

### 11.4 Test Inventory Insufficiency

1. As admin, reduce inventory stock of an item to a low amount (e.g., 2 pcs)
2. Try to order 5 of a menu item that uses that inventory item
3. Should see error: "Stok tidak mencukupi untuk item: [menu name]"
4. Order should NOT be created
5. Inventory should NOT be deducted

## 12. Verify Database Functions

Check that the stored functions work correctly:

```sql
-- Test deduct_inventory_for_order function
SELECT deduct_inventory_for_order(
  '[{"menu_id": "menu-uuid", "quantity": 2}]'::JSONB
);
```

## 13. Common Issues and Troubleshooting

### Issue: "Unsupported provider: provider is not enabled"

**Solution:** Google OAuth provider is not enabled in Supabase. Go to **Authentication** → **Providers** and enable Google. Also make sure you've added the Client ID and Client Secret from Google Cloud Console.

### Issue: "Function deduct_inventory_for_order does not exist"

**Solution:** Make sure you ran `supabase/schema.sql` in the SQL editor. The function must be created in the database.

### Issue: Inventory not deducting

**Solutions:**
1. Check that `menu_ingredients` table has entries linking menu items to inventory
2. Verify that the `items` being sent to `deduct_inventory_for_order` are in the correct format
3. Check browser console and Supabase logs for errors
4. Ensure menu items have menu_id field (not just id)

### Issue: RLS Policy Errors

**Solution:**
1. Go to Supabase → Authentication → Policies
2. Ensure all policies are enabled
3. If needed, temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### Issue: Admin pages not accessible

**Solution:**
1. Verify user role in `users` table is set to `'admin'`
2. Check that `VITE_ADMIN_EMAIL` in `.env` matches your admin email
3. The ProtectedRoute checks both the custom `users` table role AND the admin email

### Issue: Redirect URL mismatch after Google login

**Solution:**
1. Check that your app URL is in **Authentication** → **URL Configuration** → **Redirect URLs**
2. Ensure Google OAuth redirect URI in Google Cloud Console matches
3. If using Vercel, add `https://*.vercel.app` to Redirect URLs

## 14. Deploy to Vercel (Production)

### 14.1 Build the Application

```bash
npm run build
```

This creates a `dist/` folder with the production-ready static files.

### 14.2 Deploy on Vercel

Vercel is the easiest platform for deploying Vite/React applications.

#### Step 1: Push Code to GitHub

1. Create a new repository on GitHub (if you haven't already)
2. Push your code:
```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

#### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your GitHub repository
4. Vercel will automatically detect it's a Vite project
5. Framework Preset should be **"Vite"**
6. Build Command: `npm run build` (auto-filled)
7. Output Directory: `dist` (auto-filled)
8. Click **Deploy**

#### Step 3: Configure Environment Variables

After deployment starts or in project settings:
1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these environment variables:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `VITE_ADMIN_EMAIL` = your admin email (e.g., admin@yourdomain.com)
4. **Important**: Select **"Production"** and **"Preview"** environments if you want both to use the same variables
5. Click **Save**
6. **Redeploy** to apply the environment variables

#### Step 4: Get Your Production URL

After deployment completes, you'll get a URL like:
- `https://kedai-wontonesia.vercel.app`
- Or custom domain if configured

#### Step 5: Update Auth Configuration

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Set **Site URL** to your Vercel production URL
4. In **Redirect URLs**, add:
   - Your Vercel production URL
   - Your Vercel preview URLs (for pull request previews)
   - Or use wildcard: `https://*.vercel.app`
5. Click **Save**

#### Step 6: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID and click **Edit**
4. Add your production redirect URI:
   ```
   https://<your-vercel-app>.vercel.app
   ```
   (Supabase handles the callback internally at `/auth/callback`)
5. Save changes

#### Step 7: Test Production

1. Visit your Vercel production URL
2. Test login with Google
3. Test all core features (POS, Checkout, Admin pages)
4. Confirm everything works as expected

## 15. Maintenance

### 15.1 Regular Tasks

- **Daily:** Check inventory levels in Admin → Inventory
- **Weekly:** Review financial reports in Admin → Finance
- **Monthly:** Reconcile expenses and sales

### 15.2 Restocking

When inventory is low:
1. Admin → Inventory page shows low stock items in red
2. Update `current_stock` with new stock levels
3. Optionally, adjust `menu_ingredients` if recipe changes

## 16. Security Checklist

- [ ] Supabase `anon` key is kept secret (only in `.env`, not committed)
- [ ] RLS policies are enabled on all tables
- [ ] Admin role properly assigned only to trusted users
- [ ] Database backups are configured in Supabase
- [ ] CORS is configured correctly in Supabase (Settings → API → Project Settings → CORS)
- [ ] Google OAuth allowed domains include your production domain (if restricted)
- [ ] Environment variables are set in Vercel, not in code

## 17. Performance Optimization

For better performance on Vercel:

1. Enable **Vercel Analytics** to monitor usage
2. Use **Vercel Edge Functions** if you need API routes in the future
3. Optimize images (your app uses image URLs, ensure they are optimized)
4. Enable **Gzip/Brotli compression** (enabled by default on Vercel)
5. Set proper cache headers for static assets (handled by Vercel)

## 18. Domain Configuration (Optional)

To use a custom domain:

1. In Vercel: **Domains** → **Add Domain**
2. Follow the DNS configuration instructions
3. Update **Site URL** in Supabase to your custom domain
4. Update Google OAuth redirect URIs with your custom domain
5. Update Vercel environment variables if needed

## 19. Monitoring and Logs

- **Supabase Logs**: Database → Logs (query logs, auth logs)
- **Vercel Analytics**: Dashboard → Analytics
- **Error Tracking**: Consider adding Sentry or similar service
- **Uptime Monitoring**: Use UptimeRobot or similar to monitor your site

## 20. Backup and Recovery

1. **Database Backups**: Enable automatic backups in Supabase
   - Go to **Database** → **Backups**
   - Schedule daily or weekly backups
   - Download periodic manual backups

2. **Code Backup**: Already handled by Git/GitHub

3. **Environment Variables**: Keep a secure copy (password manager) of all production env vars

## 21. Scaling Considerations

As your business grows:

1. **Database**: Upgrade Supabase plan if needed (more storage, higher limits)
2. **Images**: Use a CDN for menu images instead of storing in Supabase storage
3. **API Routes**: Consider adding server-side functions for heavy computations
4. **Caching**: Implement Redis or similar for frequently accessed data
5. **Queue System**: For high-order volumes, use a queue (e.g., Supabase Queue, RabbitMQ)

## 22. Technical Reference

### Project Structure
```
kedai-wontonesia/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React contexts (AuthContext)
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin pages
│   │   ├── public/      # Public pages (Login)
│   │   └── user/        # User pages
│   ├── store/           # Zustand stores
│   ├── supabase/        # Supabase client and types
│   └── utils/           # Utility functions
├── supabase/
│   ├── schema.sql       # Full database schema
│   └── migrations/      # Migration files
├── .env                 # Environment variables (not committed)
├── .env.example         # Example env file
├── vercel.json          # Vercel deployment configuration
└── package.json         # Dependencies and scripts
```

### Key Technologies
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Google OAuth)
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Icons**: Lucide React
- **Toasts**: React Hot Toast
- **Deployment**: Vercel

### Environment Variables

| Variable | Description | Required | Source |
|----------|-------------|----------|--------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes | Supabase Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes | Supabase Settings → API |
| `VITE_ADMIN_EMAIL` | Admin email for route protection | No (but recommended) | Your email |

### API Routes
This is a static SPA, so no custom API routes are needed. All database interactions happen directly from the client via Supabase SDK.

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs (Database → Logs)
3. Check Vercel deployment logs
4. Review this setup guide carefully
5. Open an issue in the GitHub repository

---

**Last Updated:** February 2025
**Version:** 1.0.0
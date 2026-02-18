-- Kedai WONTONESIA Database Schema
-- Run this script in your Supabase SQL editor to set up the complete database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  uid UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = uid);
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid() = uid);
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- MENUS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS menus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Makanan', 'Minuman', 'Snack')),
  image TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menus_category ON menus(category);
CREATE INDEX IF NOT EXISTS idx_menus_created_at ON menus(created_at DESC);

-- RLS
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Menus are publicly readable" ON menus
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert menus" ON menus
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admins can update menus" ON menus
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can delete menus" ON menus
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- INVENTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_name TEXT NOT NULL UNIQUE,
  current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL CHECK (unit IN ('pcs', 'kg', 'liter', 'box', 'pack')),
  last_update TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_item_name ON inventory(item_name);
CREATE INDEX IF NOT EXISTS idx_inventory_last_update ON inventory(last_update DESC);

-- RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Inventory is publicly readable" ON inventory
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON inventory
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- MENU_INGREDIENTS TABLE (Linking menus to inventory)
-- ============================================
CREATE TABLE IF NOT EXISTS menu_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_used DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(menu_id, inventory_item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_menu_ingredients_menu_id ON menu_ingredients(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_ingredients_inventory_item_id ON menu_ingredients(inventory_item_id);

-- RLS
ALTER TABLE menu_ingredients ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Menu ingredients are publicly readable" ON menu_ingredients
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu ingredients" ON menu_ingredients
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_menu_ingredients_updated_at 
  BEFORE UPDATE ON menu_ingredients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed')) DEFAULT 'pending',
  type TEXT CHECK (type IN ('dine-in', 'delivery', 'pickup')) NOT NULL,
  table_no TEXT,
  address TEXT,
  pickup_time TIMESTAMP WITH TIME ZONE,
  shipping_fee DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Users can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- Trigger for updated_at on orders
CREATE OR REPLACE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- EXPENSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage expenses" ON expenses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- STORED FUNCTIONS
-- ============================================

-- Function to deduct inventory atomically
CREATE OR REPLACE FUNCTION deduct_inventory_for_order(
  p_order_items JSONB
)
RETURNS VOID AS $$
DECLARE
  item JSONB;
  menu_id UUID;
  quantity INTEGER;
  ingredient_record RECORD;
  current_stock DECIMAL(10, 2);
  required_quantity DECIMAL(10, 2);
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_order_items)
  LOOP
    menu_id := item->>'menu_id';
    quantity := (item->>'quantity')::INTEGER;
    
    -- Get all ingredients for this menu item
    FOR ingredient_record IN 
      SELECT mi.inventory_item_id, mi.quantity_used, i.unit 
      FROM menu_ingredients mi
      JOIN inventory i ON mi.inventory_item_id = i.id
      WHERE mi.menu_id = menu_id
    LOOP
      required_quantity := ingredient_record.quantity_used * quantity;
      
      -- Check current stock with FOR UPDATE to lock the row
      SELECT current_stock INTO current_stock
      FROM inventory 
      WHERE id = ingredient_record.inventory_item_id
      FOR UPDATE;
      
      IF current_stock < required_quantity THEN
        RAISE EXCEPTION 'Stok tidak mencukupi untuk item: % (diperlukan: % %, tersedia: % %)', 
          (SELECT name FROM menus WHERE id = menu_id),
          required_quantity,
          ingredient_record.unit,
          current_stock,
          ingredient_record.unit;
      END IF;
      
      -- Deduct the inventory
      UPDATE inventory
      SET current_stock = current_stock - required_quantity,
          last_update = NOW()
      WHERE id = ingredient_record.inventory_item_id;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION deduct_inventory_for_order(JSONB) TO authenticated;

-- ============================================
-- FUNCTIONS FOR FINANCIAL DASHBOARD
-- ============================================

-- Get daily sales
CREATE OR REPLACE FUNCTION get_daily_sales(p_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  total_sales DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(total), 0) INTO total_sales
  FROM orders
  WHERE DATE(created_at) = p_date
    AND status IN ('delivered', 'completed');
    
  RETURN total_sales;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_daily_sales(DATE) TO authenticated;

-- Get monthly sales
CREATE OR REPLACE FUNCTION get_monthly_sales(p_year INTEGER, p_month INTEGER)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  total_sales DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(total), 0) INTO total_sales
  FROM orders
  WHERE EXTRACT(YEAR FROM created_at) = p_year
    AND EXTRACT(MONTH FROM created_at) = p_month
    AND status IN ('delivered', 'completed');
    
  RETURN total_sales;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_monthly_sales(INTEGER, INTEGER) TO authenticated;

-- Get total expenses for a period
CREATE OR REPLACE FUNCTION get_total_expenses(p_start_date DATE, p_end_date DATE)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  total_expenses DECIMAL(10, 2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM expenses
  WHERE date BETWEEN p_start_date AND p_end_date;
  
  RETURN total_expenses;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_total_expenses(DATE, DATE) TO authenticated;

-- ============================================
-- INITIAL DATA (Optional)
-- ============================================
-- Insert sample inventory items (uncomment if needed)
-- INSERT INTO inventory (item_name, current_stock, unit) VALUES
--   ('Daging Sapi', 10, 'kg'),
--   ('Bumbu Rujak', 5, 'kg'),
--   ('Mie Instan', 100, 'pcs'),
--   ('Minuman Bersoda', 50, 'botol')
-- ON CONFLICT (item_name) DO NOTHING;

-- Insert sample menus (uncomment if needed)
-- INSERT INTO menus (name, price, category, description) VALUES
--   ('Mie Aceh Goreng', 25000, 'Makanan', 'Mie aceh dengan bumbu rujak dan seafood'),
--   ('Es Teh Manis', 5000, 'Minuman', 'Teh manis es'),
--   ('Pisang Goreng', 15000, 'Snack', 'Pisang goreng crispy')
-- ON CONFLICT DO NOTHING;

COMMIT;
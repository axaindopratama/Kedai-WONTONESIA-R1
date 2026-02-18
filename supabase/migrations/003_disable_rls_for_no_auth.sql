-- Migration: Disable Row Level Security to allow access without authentication
-- This migration disables RLS on all tables and grants execute on functions to anon role
-- Use this if you want the application to work without requiring user authentication

-- Disable RLS on all tables
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS menu_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS expenses DISABLE ROW LEVEL SECURITY;

-- Grant execute on stored functions to anon role (so unauthenticated users can use them)
GRANT EXECUTE ON FUNCTION deduct_inventory_for_order(JSONB) TO anon;
GRANT EXECUTE ON FUNCTION get_daily_sales(DATE) TO anon;
GRANT EXECUTE ON FUNCTION get_monthly_sales(INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_total_expenses(DATE, DATE) TO anon;

-- Also ensure anon has basic table access (SELECT, INSERT, UPDATE, DELETE as needed)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon;
GRANT SELECT ON menus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory TO anon;
GRANT SELECT ON menu_ingredients TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO anon;

COMMENT ON TABLE users IS 'Row Level Security DISABLED - accessible without authentication';
COMMENT ON TABLE orders IS 'Row Level Security DISABLED - accessible without authentication';
COMMENT ON TABLE expenses IS 'Row Level Security DISABLED - accessible without authentication';

COMMIT;
-- Create menu_ingredients table to link menu items with their ingredients
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_menu_ingredients_menu_id ON menu_ingredients(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_ingredients_inventory_item_id ON menu_ingredients(inventory_item_id);

-- Enable Row Level Security
ALTER TABLE menu_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_ingredients
CREATE POLICY "Allow public read access to menu_ingredients" ON menu_ingredients
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert menu_ingredients" ON menu_ingredients
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update menu_ingredients" ON menu_ingredients
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete menu_ingredients" ON menu_ingredients
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create a trigger to update the updated_at timestamp
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

-- Create a stored function to deduct inventory atomically
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION deduct_inventory_for_order(JSONB) TO authenticated;
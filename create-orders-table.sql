  -- Create orders table for T4U (Tees for You)
  -- Run this in your Supabase SQL Editor

  -- Create orders table
  CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 5.99,
    total DECIMAL(10,2) NOT NULL,
    
    -- Shipping address (snapshot at time of order)
    shipping_street TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_zip_code TEXT NOT NULL,
    shipping_country TEXT NOT NULL,
    
    -- Payment info (minimal, secure)
    payment_method_last4 TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    shipped_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE
  );

  -- Create order_items table for individual items in each order
  CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    shirt_id UUID REFERENCES shirts(id) ON DELETE SET NULL,
    
    -- Snapshot of shirt data at time of order (in case original is deleted/modified)
    shirt_title TEXT NOT NULL,
    shirt_description TEXT,
    shirt_price DECIMAL(10,2) NOT NULL,
    shirt_color TEXT,
    shirt_designs JSONB,
    shirt_preview_front_url TEXT,
    shirt_preview_back_url TEXT,
    
    size TEXT NOT NULL CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    item_total DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Set up Row Level Security policies for orders
  CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

  -- Set up Row Level Security policies for order_items
  CREATE POLICY "Users can view own order items" ON order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

  CREATE POLICY "Users can insert own order items" ON order_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

  -- Enable RLS on orders tables
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

  -- Add triggers to update updated_at automatically
  CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  -- Function to generate unique order numbers
  CREATE OR REPLACE FUNCTION generate_order_number()
  RETURNS TEXT AS $$
  DECLARE
      order_num TEXT;
      counter INTEGER := 0;
  BEGIN
      LOOP
          -- Generate order number: T4U + YYYYMMDD + random 4 digits
          order_num := 'T4U' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD((RANDOM() * 9999)::INTEGER::TEXT, 4, '0');
          
          -- Check if this order number already exists
          IF NOT EXISTS (SELECT 1 FROM orders WHERE order_number = order_num) THEN
              RETURN order_num;
          END IF;
          
          counter := counter + 1;
          -- Prevent infinite loop (should never happen with random generation)
          IF counter > 100 THEN
              -- Fallback with timestamp
              order_num := 'T4U' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD((RANDOM() * 99)::INTEGER::TEXT, 2, '0');
              RETURN order_num;
          END IF;
      END LOOP;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Function to create an order from cart items
  CREATE OR REPLACE FUNCTION create_order(
    p_user_id UUID,
    p_cart_items JSONB,
    p_shipping_address JSONB,
    p_payment_method_last4 TEXT DEFAULT NULL
  )
  RETURNS UUID AS $$
  DECLARE
    order_id UUID;
    order_num TEXT;
    item JSONB;
    subtotal_amount DECIMAL(10,2) := 0;
    shipping_amount DECIMAL(10,2) := 5.99;
    total_amount DECIMAL(10,2);
  BEGIN
    -- Generate unique order number
    order_num := generate_order_number();
    
    -- Calculate subtotal from cart items
    FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
      subtotal_amount := subtotal_amount + ((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER);
    END LOOP;
    
    total_amount := subtotal_amount + shipping_amount;
    
    -- Create the order
    INSERT INTO orders (
      user_id, 
      order_number, 
      subtotal, 
      shipping_cost, 
      total,
      shipping_street,
      shipping_city,
      shipping_state,
      shipping_zip_code,
      shipping_country,
      shipping_phone,
      payment_method_last4
    )
    VALUES (
      p_user_id,
      order_num,
      subtotal_amount,
      shipping_amount,
      total_amount,
      p_shipping_address->>'street',
      p_shipping_address->>'city',
      p_shipping_address->>'state',
      p_shipping_address->>'zip_code',
      p_shipping_address->>'country',
      p_shipping_address->>'phone',
      p_payment_method_last4
    )
    RETURNING id INTO order_id;
    
    -- Create order items
    FOR item IN SELECT * FROM jsonb_array_elements(p_cart_items)
    LOOP
      INSERT INTO order_items (
        order_id,
        shirt_id,
        shirt_title,
        shirt_description,
        shirt_price,
        shirt_color,
        shirt_designs,
        shirt_preview_front_url,
        shirt_preview_back_url,
        size,
        quantity,
        item_total
      )
      VALUES (
        order_id,
        (item->>'shirt_id')::UUID,
        item->>'title',
        item->>'description',
        (item->>'price')::DECIMAL,
        item->>'color',
        (item->>'designs')::JSONB,
        item->>'preview_front_url',
        item->>'preview_back_url',
        item->>'size',
        (item->>'quantity')::INTEGER,
        ((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER)
      );
    END LOOP;
    
    RETURN order_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Grant execute permission to authenticated users
  GRANT EXECUTE ON FUNCTION create_order TO authenticated;
  GRANT EXECUTE ON FUNCTION generate_order_number TO authenticated;

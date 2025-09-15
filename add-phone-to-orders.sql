-- Add phone number field to orders table for shipping labels
-- Run this in your Supabase SQL Editor

-- Add phone number to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_phone TEXT;

-- Update the create_order function to include phone number
DROP FUNCTION IF EXISTS create_order(UUID, JSONB, JSONB, TEXT);

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

-- Fix the create_order function to properly handle JSONB and include shipping_phone
CREATE OR REPLACE FUNCTION create_order(
  p_user_id UUID,
  p_cart_items JSONB,
  p_shipping_address JSONB,
  p_payment_method_last4 TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  order_id UUID;
  order_num TEXT;
  subtotal_amount DECIMAL(10,2) := 0;
  shipping_amount DECIMAL(10,2) := 5.99;
  total_amount DECIMAL(10,2);
  item_data JSONB;
BEGIN
  -- Generate order number
  SELECT generate_order_number() INTO order_num;
  
  -- Calculate subtotal from cart items
  FOR item_data IN SELECT jsonb_array_elements(p_cart_items)
  LOOP
    subtotal_amount := subtotal_amount + ((item_data->>'price')::DECIMAL * (item_data->>'quantity')::INTEGER);
  END LOOP;
  
  total_amount := subtotal_amount + shipping_amount;
  
  -- Create the order (now including shipping_phone)
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
  FOR item_data IN SELECT jsonb_array_elements(p_cart_items)
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
      (item_data->>'shirt_id')::UUID,
      item_data->>'title',
      item_data->>'description',
      (item_data->>'price')::DECIMAL,
      item_data->>'color',
      (item_data->>'designs')::JSONB,
      item_data->>'preview_front_url',
      item_data->>'preview_back_url',
      item_data->>'size',
      (item_data->>'quantity')::INTEGER,
      ((item_data->>'price')::DECIMAL * (item_data->>'quantity')::INTEGER)
    );
  END LOOP;
  
  RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

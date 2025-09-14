-- T4U (Tees for You) Database Schema
-- Run this in your Supabase SQL Editor

-- Note: auth.users table already has RLS enabled by default

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create addresses table
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  street TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_number_last4 TEXT NOT NULL, -- Only store last 4 digits for security
  cardholder_name TEXT NOT NULL,
  expiry_date TEXT NOT NULL, -- Format: MM/YY
  card_type TEXT, -- visa, mastercard, etc.
  billing_street TEXT,
  billing_city TEXT,
  billing_state TEXT,
  billing_zip_code TEXT,
  billing_country TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shirts table
CREATE TABLE shirts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Set up Row Level Security policies for addresses
CREATE POLICY "Users can view own address" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own address" ON addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own address" ON addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own address" ON addresses FOR DELETE USING (auth.uid() = user_id);

-- Set up Row Level Security policies for payment_methods
CREATE POLICY "Users can view own payment methods" ON payment_methods FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own payment methods" ON payment_methods FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment methods" ON payment_methods FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment methods" ON payment_methods FOR DELETE USING (auth.uid() = user_id);

-- Set up Row Level Security policies for shirts
CREATE POLICY "Users can view own shirts" ON shirts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own shirts" ON shirts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shirts" ON shirts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own shirts" ON shirts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view shirts" ON shirts FOR SELECT USING (true);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shirts ENABLE ROW LEVEL SECURITY;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update updated_at automatically
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shirts_updated_at BEFORE UPDATE ON shirts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('vendor', 'wholesaler');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create vendor_inventory_needs table
CREATE TABLE public.vendor_inventory_needs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.vendor_inventory_needs ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_inventory_needs
CREATE POLICY "Vendors can view their own inventory needs"
  ON public.vendor_inventory_needs
  FOR SELECT
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own inventory needs"
  ON public.vendor_inventory_needs
  FOR INSERT
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own inventory needs"
  ON public.vendor_inventory_needs
  FOR UPDATE
  USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own inventory needs"
  ON public.vendor_inventory_needs
  FOR DELETE
  USING (auth.uid() = vendor_id);

-- Wholesalers can view all inventory needs
CREATE POLICY "Wholesalers can view all inventory needs"
  ON public.vendor_inventory_needs
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'wholesaler');

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_vendor_inventory_needs_updated_at
  BEFORE UPDATE ON public.vendor_inventory_needs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create vendor_preferences table for location
CREATE TABLE public.vendor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location TEXT DEFAULT 'London' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.vendor_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_preferences
CREATE POLICY "Users can view their own preferences"
  ON public.vendor_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.vendor_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.vendor_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_vendor_preferences_updated_at
  BEFORE UPDATE ON public.vendor_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
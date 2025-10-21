-- Create wholesaler products table
CREATE TABLE public.wholesaler_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wholesaler_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor orders table
CREATE TABLE public.vendor_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  wholesaler_id UUID NOT NULL,
  product_id UUID NOT NULL REFERENCES public.wholesaler_products(id),
  quantity NUMERIC NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wholesaler_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_orders ENABLE ROW LEVEL SECURITY;

-- Wholesaler products policies
CREATE POLICY "Everyone can view wholesaler products"
ON public.wholesaler_products
FOR SELECT
USING (true);

CREATE POLICY "Wholesalers can insert their own products"
ON public.wholesaler_products
FOR INSERT
WITH CHECK (auth.uid() = wholesaler_id AND get_user_role(auth.uid()) = 'wholesaler'::user_role);

CREATE POLICY "Wholesalers can update their own products"
ON public.wholesaler_products
FOR UPDATE
USING (auth.uid() = wholesaler_id AND get_user_role(auth.uid()) = 'wholesaler'::user_role);

CREATE POLICY "Wholesalers can delete their own products"
ON public.wholesaler_products
FOR DELETE
USING (auth.uid() = wholesaler_id AND get_user_role(auth.uid()) = 'wholesaler'::user_role);

-- Vendor orders policies
CREATE POLICY "Vendors can view their own orders"
ON public.vendor_orders
FOR SELECT
USING (auth.uid() = vendor_id);

CREATE POLICY "Wholesalers can view orders for their products"
ON public.vendor_orders
FOR SELECT
USING (auth.uid() = wholesaler_id);

CREATE POLICY "Vendors can create orders"
ON public.vendor_orders
FOR INSERT
WITH CHECK (auth.uid() = vendor_id AND get_user_role(auth.uid()) = 'vendor'::user_role);

CREATE POLICY "Vendors can update their own pending orders"
ON public.vendor_orders
FOR UPDATE
USING (auth.uid() = vendor_id AND status = 'pending');

CREATE POLICY "Wholesalers can update order status"
ON public.vendor_orders
FOR UPDATE
USING (auth.uid() = wholesaler_id);

-- Add triggers for timestamps
CREATE TRIGGER update_wholesaler_products_updated_at
BEFORE UPDATE ON public.wholesaler_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vendor_orders_updated_at
BEFORE UPDATE ON public.vendor_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
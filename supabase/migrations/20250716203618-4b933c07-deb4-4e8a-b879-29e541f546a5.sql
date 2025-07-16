-- Create table for logging calculations
CREATE TABLE public.calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  product_cost DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  referral_fee DECIMAL(10,2),
  fba_fee DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  ppc_budget DECIMAL(10,2),
  other_fees DECIMAL(10,2),
  net_profit DECIMAL(10,2),
  profit_margin DECIMAL(5,2),
  break_even_units INTEGER,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (since this is a public utility)
CREATE POLICY "Allow all operations on calculations" 
ON public.calculations 
FOR ALL 
USING (true) 
WITH CHECK (true);
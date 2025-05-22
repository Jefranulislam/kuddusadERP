/*
  # Billboard Management System Schema

  1. New Tables
    - billboards
    - clients
    - rentals
    - expenses
    - partners
    - payments
    - tax_deductions
    - yearly_tax_reports
    - partner_billboard_shares

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Relationships
    - Many-to-many between billboards and partners through partner_billboard_shares
    - One-to-many between billboards and rentals
    - One-to-many between clients and rentals
    - One-to-many between rentals and payments
    - One-to-one between rentals and tax_deductions
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Billboards table
CREATE TABLE IF NOT EXISTS billboards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  location text NOT NULL,
  image_url text,
  size text NOT NULL,
  type text NOT NULL,
  structure_installation_cost decimal(10,2) NOT NULL,
  installation_date date NOT NULL,
  current_status text NOT NULL DEFAULT 'Available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_phone text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Partner Billboard Shares (junction table)
CREATE TABLE IF NOT EXISTS partner_billboard_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE,
  billboard_id uuid REFERENCES billboards(id) ON DELETE CASCADE,
  share_percentage decimal(5,2) NOT NULL CHECK (share_percentage >= 0 AND share_percentage <= 100),
  created_at timestamptz DEFAULT now(),
  UNIQUE(partner_id, billboard_id)
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name text NOT NULL,
  industry text,
  contact_person text,
  contact_email text,
  contact_phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Rentals table
CREATE TABLE IF NOT EXISTS rentals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT,
  billboard_id uuid REFERENCES billboards(id) ON DELETE RESTRICT,
  rental_start_date date NOT NULL,
  rental_end_date date NOT NULL,
  total_rent_amount decimal(10,2) NOT NULL,
  payment_mode text NOT NULL,
  paid_status text NOT NULL DEFAULT 'Unpaid',
  po_document_url text,
  pvc_cost decimal(10,2) NOT NULL DEFAULT 0,
  fitting_cost decimal(10,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (rental_end_date >= rental_start_date)
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  billboard_id uuid REFERENCES billboards(id) ON DELETE RESTRICT,
  expense_type text NOT NULL,
  description text,
  expense_date date NOT NULL,
  amount decimal(10,2) NOT NULL,
  paid_by text NOT NULL,
  partner_deducted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id uuid REFERENCES rentals(id) ON DELETE RESTRICT,
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT,
  amount_paid decimal(10,2) NOT NULL,
  payment_date date NOT NULL,
  payment_mode text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Tax Deductions table
CREATE TABLE IF NOT EXISTS tax_deductions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  rental_id uuid REFERENCES rentals(id) ON DELETE RESTRICT,
  ait_percentage decimal(5,2) NOT NULL,
  vat_percentage decimal(5,2) NOT NULL,
  deducted_on date NOT NULL,
  ait_receipt_url text,
  remarks text,
  created_at timestamptz DEFAULT now()
);

-- Yearly Tax Reports table
CREATE TABLE IF NOT EXISTS yearly_tax_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  year integer NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE RESTRICT,
  total_rent_collected decimal(10,2) NOT NULL,
  total_ait_deducted decimal(10,2) NOT NULL,
  total_vat_deducted decimal(10,2) NOT NULL,
  ait_receipts_submitted boolean DEFAULT false,
  summary_report_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(year, client_id)
);

-- Enable Row Level Security
ALTER TABLE billboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_billboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_deductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_tax_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read access" ON billboards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON partners
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON partner_billboard_shares
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON rentals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON payments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON tax_deductions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON yearly_tax_reports
  FOR SELECT TO authenticated USING (true);

-- Create views for common queries
CREATE OR REPLACE VIEW billboard_profitability AS
WITH rental_income AS (
  SELECT 
    billboard_id,
    SUM(total_rent_amount) as total_rent,
    COUNT(*) as total_rentals
  FROM rentals
  GROUP BY billboard_id
),
billboard_expenses AS (
  SELECT 
    billboard_id,
    SUM(amount) as total_expenses
  FROM expenses
  GROUP BY billboard_id
)
SELECT 
  b.id,
  b.location,
  COALESCE(ri.total_rent, 0) as total_revenue,
  COALESCE(be.total_expenses, 0) as total_expenses,
  COALESCE(ri.total_rent, 0) - COALESCE(be.total_expenses, 0) as net_profit,
  COALESCE(ri.total_rentals, 0) as rental_count
FROM billboards b
LEFT JOIN rental_income ri ON b.id = ri.billboard_id
LEFT JOIN billboard_expenses be ON b.id = be.billboard_id;

-- Create function to calculate partner earnings
CREATE OR REPLACE FUNCTION calculate_partner_earnings(
  partner_id uuid,
  start_date date,
  end_date date
)
RETURNS TABLE (
  total_earnings decimal(10,2),
  total_deductions decimal(10,2),
  net_profit decimal(10,2)
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH partner_rentals AS (
    SELECT 
      r.id as rental_id,
      r.total_rent_amount,
      pbs.share_percentage
    FROM rentals r
    JOIN partner_billboard_shares pbs ON r.billboard_id = pbs.billboard_id
    WHERE pbs.partner_id = calculate_partner_earnings.partner_id
    AND r.rental_start_date >= calculate_partner_earnings.start_date
    AND r.rental_end_date <= calculate_partner_earnings.end_date
  ),
  partner_expenses AS (
    SELECT 
      COALESCE(SUM(amount), 0) as total_expenses
    FROM expenses e
    JOIN partner_billboard_shares pbs ON e.billboard_id = pbs.billboard_id
    WHERE pbs.partner_id = calculate_partner_earnings.partner_id
    AND e.expense_date BETWEEN calculate_partner_earnings.start_date AND calculate_partner_earnings.end_date
    AND e.partner_deducted = true
  )
  SELECT 
    COALESCE(SUM((pr.total_rent_amount * pr.share_percentage) / 100), 0) as total_earnings,
    COALESCE((SELECT total_expenses FROM partner_expenses), 0) as total_deductions,
    COALESCE(SUM((pr.total_rent_amount * pr.share_percentage) / 100), 0) - 
    COALESCE((SELECT total_expenses FROM partner_expenses), 0) as net_profit
  FROM partner_rentals pr;
END;
$$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rentals_billboard_id ON rentals(billboard_id);
CREATE INDEX IF NOT EXISTS idx_rentals_client_id ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_billboard_id ON expenses(billboard_id);
CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON payments(rental_id);
CREATE INDEX IF NOT EXISTS idx_partner_shares_billboard_id ON partner_billboard_shares(billboard_id);
CREATE INDEX IF NOT EXISTS idx_partner_shares_partner_id ON partner_billboard_shares(partner_id);
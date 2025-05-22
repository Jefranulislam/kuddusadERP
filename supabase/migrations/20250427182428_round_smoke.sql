/*
  # Add DELETE policies for all tables

  1. Security Changes
    - Add policies to allow authenticated users to delete records
    - Ensures data integrity while maintaining security
*/

-- Add DELETE policies for all tables
CREATE POLICY "Allow authenticated delete access" ON clients
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON billboards
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON partners
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON rentals
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON expenses
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON payments
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON tax_deductions
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON yearly_tax_reports
FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete access" ON partner_billboard_shares
FOR DELETE TO authenticated USING (true);

-- Add UPDATE policies for all tables
CREATE POLICY "Allow authenticated update access" ON clients
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON billboards
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON partners
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON rentals
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON expenses
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON payments
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON tax_deductions
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON yearly_tax_reports
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update access" ON partner_billboard_shares
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- Add INSERT policies for all tables
CREATE POLICY "Allow authenticated insert access" ON billboards
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON partners
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON rentals
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON expenses
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON payments
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON tax_deductions
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON yearly_tax_reports
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON partner_billboard_shares
FOR INSERT TO authenticated WITH CHECK (true);
/*
  # Fix Billboard RLS Policies

  1. Changes
    - Drop existing RLS policies for billboards table
    - Create new, properly configured RLS policies for:
      - INSERT: Allow authenticated users to create billboards
      - SELECT: Allow authenticated users to read all billboards
      - UPDATE: Allow authenticated users to update any billboard
      - DELETE: Allow authenticated users to delete any billboard
  
  2. Security
    - Maintains RLS enabled on billboards table
    - Ensures authenticated users have proper access
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated delete access" ON billboards;
  DROP POLICY IF EXISTS "Allow authenticated insert access" ON billboards;
  DROP POLICY IF EXISTS "Allow authenticated read access" ON billboards;
  DROP POLICY IF EXISTS "Allow authenticated update access" ON billboards;
END $$;

-- Create new policies with proper security rules
CREATE POLICY "Enable read access for authenticated users" 
ON billboards FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable insert access for authenticated users" 
ON billboards FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" 
ON billboards FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" 
ON billboards FOR DELETE 
TO authenticated 
USING (true);
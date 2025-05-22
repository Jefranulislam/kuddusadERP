/*
  # Add INSERT policy for clients table

  1. Security Changes
    - Add policy to allow authenticated users to insert new client records
    - This complements the existing SELECT policy
    - Ensures data integrity while maintaining security

  Note: The policy allows any authenticated user to create new clients, which is 
  appropriate for this business application where all authenticated users should 
  have the ability to add new clients.
*/

CREATE POLICY "Allow authenticated create access" 
ON clients 
FOR INSERT 
TO authenticated 
WITH CHECK (true);
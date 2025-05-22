/*
  # Add reporting functions

  1. New Functions
    - calculate_billboard_performance
    - calculate_partner_investment_returns
    - calculate_client_payment_status
*/

-- Function to calculate billboard performance
CREATE OR REPLACE FUNCTION calculate_billboard_performance(
  billboard_id uuid,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE (
  total_revenue decimal(10,2),
  total_expenses decimal(10,2),
  net_profit decimal(10,2),
  occupancy_rate decimal(5,2),
  average_rental_rate decimal(10,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH rental_data AS (
    SELECT 
      COALESCE(SUM(total_rent_amount), 0) as total_rent,
      COUNT(*) as rental_count,
      AVG(total_rent_amount) as avg_rent,
      SUM(
        LEAST(
          GREATEST(
            CASE 
              WHEN start_date IS NULL THEN 0
              ELSE DATE_PART('day', LEAST(rental_end_date, COALESCE(end_date, CURRENT_DATE)) - 
                   GREATEST(rental_start_date, COALESCE(start_date, rental_start_date)))
            END, 0
          ), 
          DATE_PART('day', COALESCE(end_date, CURRENT_DATE) - COALESCE(start_date, rental_start_date))
        )
      ) as occupied_days,
      DATE_PART('day', COALESCE(end_date, CURRENT_DATE) - COALESCE(start_date, MIN(rental_start_date))) as total_days
    FROM rentals
    WHERE rentals.billboard_id = calculate_billboard_performance.billboard_id
    AND (start_date IS NULL OR rental_start_date >= start_date)
    AND (end_date IS NULL OR rental_end_date <= end_date)
  ),
  expense_data AS (
    SELECT COALESCE(SUM(amount), 0) as total_expenses
    FROM expenses
    WHERE expenses.billboard_id = calculate_billboard_performance.billboard_id
    AND (start_date IS NULL OR expense_date >= start_date)
    AND (end_date IS NULL OR expense_date <= end_date)
  )
  SELECT 
    rd.total_rent,
    ed.total_expenses,
    rd.total_rent - ed.total_expenses,
    CASE 
      WHEN rd.total_days > 0 THEN (rd.occupied_days / rd.total_days * 100)
      ELSE 0
    END,
    COALESCE(rd.avg_rent, 0)
  FROM rental_data rd
  CROSS JOIN expense_data ed;
END;
$$;

-- Function to calculate partner investment returns
CREATE OR REPLACE FUNCTION calculate_partner_investment_returns(
  partner_id uuid,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE (
  billboard_id uuid,
  location text,
  investment_amount decimal(10,2),
  share_percentage decimal(5,2),
  total_revenue decimal(10,2),
  total_expenses decimal(10,2),
  net_profit decimal(10,2),
  roi decimal(5,2)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH partner_investments AS (
    SELECT 
      pbs.billboard_id,
      b.location,
      b.structure_installation_cost * (pbs.share_percentage / 100) as investment,
      pbs.share_percentage
    FROM partner_billboard_shares pbs
    JOIN billboards b ON b.id = pbs.billboard_id
    WHERE pbs.partner_id = calculate_partner_investment_returns.partner_id
  ),
  revenue_data AS (
    SELECT 
      pi.billboard_id,
      COALESCE(SUM(r.total_rent_amount * (pi.share_percentage / 100)), 0) as revenue
    FROM partner_investments pi
    LEFT JOIN rentals r ON r.billboard_id = pi.billboard_id
    WHERE (start_date IS NULL OR r.rental_start_date >= start_date)
    AND (end_date IS NULL OR r.rental_end_date <= end_date)
    GROUP BY pi.billboard_id
  ),
  expense_data AS (
    SELECT 
      pi.billboard_id,
      COALESCE(SUM(e.amount * (pi.share_percentage / 100)), 0) as expenses
    FROM partner_investments pi
    LEFT JOIN expenses e ON e.billboard_id = pi.billboard_id
    WHERE (start_date IS NULL OR e.expense_date >= start_date)
    AND (end_date IS NULL OR e.expense_date <= end_date)
    GROUP BY pi.billboard_id
  )
  SELECT 
    pi.billboard_id,
    pi.location,
    pi.investment,
    pi.share_percentage,
    rd.revenue,
    ed.expenses,
    rd.revenue - ed.expenses as net_profit,
    CASE 
      WHEN pi.investment > 0 THEN ((rd.revenue - ed.expenses) / pi.investment * 100)
      ELSE 0
    END as roi
  FROM partner_investments pi
  LEFT JOIN revenue_data rd ON rd.billboard_id = pi.billboard_id
  LEFT JOIN expense_data ed ON ed.billboard_id = pi.billboard_id;
END;
$$;

-- Function to calculate client payment status
CREATE OR REPLACE FUNCTION calculate_client_payment_status(
  client_id uuid,
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL
)
RETURNS TABLE (
  rental_id uuid,
  billboard_location text,
  total_amount decimal(10,2),
  amount_paid decimal(10,2),
  amount_pending decimal(10,2),
  payment_status text,
  last_payment_date date
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH payment_data AS (
    SELECT 
      r.id as rental_id,
      b.location as billboard_location,
      r.total_rent_amount,
      COALESCE(SUM(p.amount_paid), 0) as paid_amount,
      MAX(p.payment_date) as last_payment
    FROM rentals r
    JOIN billboards b ON b.id = r.billboard_id
    LEFT JOIN payments p ON p.rental_id = r.id
    WHERE r.client_id = calculate_client_payment_status.client_id
    AND (start_date IS NULL OR r.rental_start_date >= start_date)
    AND (end_date IS NULL OR r.rental_end_date <= end_date)
    GROUP BY r.id, b.location, r.total_rent_amount
  )
  SELECT 
    pd.rental_id,
    pd.billboard_location,
    pd.total_rent_amount,
    pd.paid_amount,
    pd.total_rent_amount - pd.paid_amount as pending_amount,
    CASE 
      WHEN pd.paid_amount >= pd.total_rent_amount THEN 'Paid'
      WHEN pd.paid_amount > 0 THEN 'Partial'
      ELSE 'Unpaid'
    END as status,
    pd.last_payment
  FROM payment_data pd;
END;
$$;
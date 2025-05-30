-- Create increment function for counters
CREATE OR REPLACE FUNCTION increment(x integer) RETURNS integer AS $$
  BEGIN
    RETURN x + 1;
  END;
$$ LANGUAGE plpgsql;

-- Create function to sum view counts
CREATE OR REPLACE FUNCTION sum_view_counts() RETURNS integer AS $$
  DECLARE
    total integer;
  BEGIN
    SELECT COALESCE(SUM(view_count), 0) INTO total FROM affirmations;
    RETURN total;
  END;
$$ LANGUAGE plpgsql;

-- Create function to sum favorite counts
CREATE OR REPLACE FUNCTION sum_favorite_counts() RETURNS integer AS $$
  DECLARE
    total integer;
  BEGIN
    SELECT COALESCE(SUM(favorite_count), 0) INTO total FROM affirmations;
    RETURN total;
  END;
$$ LANGUAGE plpgsql;

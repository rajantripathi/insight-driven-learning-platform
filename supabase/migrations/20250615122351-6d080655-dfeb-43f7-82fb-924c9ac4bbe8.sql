
-- Create table for tracking OpenAI usage
CREATE TABLE public.openai_usage (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens INT NOT NULL,
  ts TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.openai_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view their own usage" 
  ON public.openai_usage 
  FOR SELECT 
  USING (auth.uid() = uid);

-- Users can insert their own usage records
CREATE POLICY "Users can insert their own usage" 
  ON public.openai_usage 
  FOR INSERT 
  WITH CHECK (auth.uid() = uid);

-- Create helper function to get tokens used in the last minute
CREATE OR REPLACE FUNCTION public.get_tokens_last_minute(user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_tokens INT;
BEGIN
  SELECT COALESCE(SUM(tokens), 0)
  INTO total_tokens
  FROM public.openai_usage
  WHERE uid = user_id
    AND ts > NOW() - INTERVAL '1 minute';
    
  RETURN total_tokens;
END;
$$;

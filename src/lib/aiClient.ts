
import { Database } from '@/integrations/supabase/types'
import { createClient } from '@supabase/supabase-js'
import { toast } from '@/hooks/use-toast'

// Runtime check for required environment variables
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Supabase env vars missing');
  toast({ 
    title: 'Config error', 
    description: 'Supabase keys not set', 
    variant: 'destructive' 
  });
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (data.error === 'rate_limit') {
    toast({
      title: "Rate limit hit – wait 1 minute",
      variant: "destructive",
    });
    throw new Error('rate_limit');
  }
  
  return data;
};

export const generateLesson = async (payload: any) => {
  const response = await fetch('/functions/v1/generate-lesson', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload) 
  });
  return handleResponse(response);
};

export const generateQuiz = async (payload: any) => {
  const response = await fetch('/functions/v1/generate-quiz', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify(payload) 
  });
  return handleResponse(response);
};

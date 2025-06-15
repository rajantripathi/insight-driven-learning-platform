
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
}

const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || 'https://ubzitwkzwzmjztybnpsn.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieml0d2t6d3ptanp0eWJucHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Nzk0NDUsImV4cCI6MjA2NTU1NTQ0NX0.qLnRe3UoYgbSH3cvMGFVM7tyw20z-yd8A9darHFCp-8'
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

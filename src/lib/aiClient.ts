
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ubzitwkzwzmjztybnpsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieml0d2t6d3ptanp0eWJucHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Nzk0NDUsImV4cCI6MjA2NTU1NTQ0NX0.qLnRe3UoYgbSH3cvMGFVM7tyw20z-yd8A9darHFCp-8'
)

export const generateLesson = async (payload: unknown) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-lesson', {
      body: payload
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Lesson generation failed');
  }
};

export const generateQuiz = async (payload: unknown) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: payload
    });
    
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    
    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Quiz generation failed');
  }
};

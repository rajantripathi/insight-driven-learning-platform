
import { createClient } from '@supabase/supabase-js'
import { toast } from '@/hooks/use-toast'

const supabase = createClient(
  'https://ubzitwkzwzmjztybnpsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieml0d2t6d3ptanp0eWJucHNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5Nzk0NDUsImV4cCI6MjA2NTU1NTQ0NX0.qLnRe3UoYgbSH3cvMGFVM7tyw20z-yd8A9darHFCp-8'
)

// Helper function to announce toast messages for accessibility
const announceToast = (message: string) => {
  const announcer = document.getElementById('toast-announcer');
  if (announcer) {
    announcer.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
};

export const generateLesson = async (payload: unknown) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-lesson', {
      body: payload
    });
    
    if (error) {
      if (error.message === 'rate_limit') {
        const message = 'Rate limit reached. Please wait a minute before trying again.';
        toast({
          title: "Rate Limit",
          description: message,
          variant: "destructive",
        });
        announceToast(message);
      } else {
        const message = error.message || 'Lesson generation failed';
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        announceToast(`Error: ${message}`);
      }
      throw error;
    }
    
    if (data?.error) {
      if (data.error === 'rate_limit') {
        const message = 'Rate limit reached. Please wait a minute before trying again.';
        toast({
          title: "Rate Limit",
          description: message,
          variant: "destructive",
        });
        announceToast(message);
      } else {
        const message = data.error || 'Lesson generation failed';
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        announceToast(`Error: ${message}`);
      }
      throw new Error(data.error);
    }
    
    return data;
  } catch (error: any) {
    // Handle HTTP status errors (400+)
    if (error.status && error.status >= 400) {
      const message = error.message || `HTTP ${error.status}: Request failed`;
      toast({
        title: "Request Failed",
        description: message,
        variant: "destructive",
      });
      announceToast(`Request failed: ${message}`);
    }
    throw new Error(error.message || 'Lesson generation failed');
  }
};

export const generateQuiz = async (payload: unknown) => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: payload
    });
    
    if (error) {
      if (error.message === 'rate_limit') {
        const message = 'Rate limit reached. Please wait a minute before trying again.';
        toast({
          title: "Rate Limit",
          description: message,
          variant: "destructive",
        });
        announceToast(message);
      } else {
        const message = error.message || 'Quiz generation failed';
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        announceToast(`Error: ${message}`);
      }
      throw error;
    }
    
    if (data?.error) {
      if (data.error === 'rate_limit') {
        const message = 'Rate limit reached. Please wait a minute before trying again.';
        toast({
          title: "Rate Limit",
          description: message,
          variant: "destructive",
        });
        announceToast(message);
      } else {
        const message = data.error || 'Quiz generation failed';
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        announceToast(`Error: ${message}`);
      }
      throw new Error(data.error);
    }
    
    return data;
  } catch (error: any) {
    // Handle HTTP status errors (400+)
    if (error.status && error.status >= 400) {
      const message = error.message || `HTTP ${error.status}: Request failed`;
      toast({
        title: "Request Failed",
        description: message,
        variant: "destructive",
      });
      announceToast(`Request failed: ${message}`);
    }
    throw new Error(error.message || 'Quiz generation failed');
  }
};

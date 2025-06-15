
import { supabase } from '@/integrations/supabase/client';

export interface SessionGenerationRequest {
  courseTitle: string;
  courseDescription: string;
  numberOfSessions: number;
  topics: string;
  sessionDuration: string;
}

export interface SessionPlan {
  sessionNo: number;
  title: string;
  objectives: string[];
  estimatedDuration: string;
}

export const generateSessionPlan = async (request: SessionGenerationRequest): Promise<SessionPlan[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-session-plan', {
      body: request,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to generate session plan');
    }

    return data.sessions || [];
  } catch (error) {
    console.error('Error generating session plan:', error);
    throw error;
  }
};

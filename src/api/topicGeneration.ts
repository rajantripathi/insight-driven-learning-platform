
import { supabase } from '@/integrations/supabase/client';

export interface TopicGenerationRequest {
  courseTitle: string;
  courseDescription?: string;
  numberOfSessions: number;
  sessionDuration: string;
  courseLevel?: string;
  courseCategory?: string;
}

export const generateCourseTopics = async (request: TopicGenerationRequest): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-course-topics', {
      body: request,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to generate course topics');
    }

    return data.topics || '';
  } catch (error) {
    console.error('Error generating course topics:', error);
    throw error;
  }
};

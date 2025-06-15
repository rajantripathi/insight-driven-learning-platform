
import { supabase } from '@/integrations/supabase/client';

export interface LessonGenerationRequest {
  courseId: string;
  cloId?: string;
  sessionNo: number;
  topic: string;
  learningOutcomes?: string[];
}

export interface LessonGenerationResponse {
  id: string;
  title: string;
  estimatedDuration: string;
  learningObjectives: string[];
  resources: Array<{
    id?: string;
    type: string;
    title: string;
    description?: string;
    url: string;
    duration?: string;
  }>;
  activities: Array<{
    id?: string;
    type: string;
    title: string;
    description?: string;
    estimatedTime: string;
  }>;
}

export const generateLesson = async (request: LessonGenerationRequest): Promise<LessonGenerationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-lesson', {
      body: request,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to generate lesson');
    }

    return data;
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw error;
  }
};

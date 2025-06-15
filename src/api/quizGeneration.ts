
import { supabase } from '@/integrations/supabase/client';

export interface QuizGenerationRequest {
  lessonId: string;
  questionCount: number;
  bloomsLevels: string[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id?: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  bloomsLevel: string;
  explanation: string;
}

export interface QuizGenerationResponse {
  id: string;
  title: string;
  lessonId: string;
  estimatedDuration: string;
  questions: QuizQuestion[];
  totalPoints: number;
}

export const generateQuiz = async (request: QuizGenerationRequest): Promise<QuizGenerationResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: request,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to generate quiz');
    }

    return data;
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};

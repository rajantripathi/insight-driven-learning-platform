
import { supabase } from '@/integrations/supabase/client';

export interface VoiceAssistantRequest {
  message: string;
  context?: string;
  lessonContent?: string;
  assessmentMode?: boolean;
}

export interface AssessmentFeedback {
  understoodConcept: boolean;
  engagementLevel: 'low' | 'medium' | 'high';
  needsMorePractice: boolean;
}

export interface VoiceAssistantResponse {
  response: string;
  assessment?: AssessmentFeedback;
}

export const sendVoiceMessage = async (request: VoiceAssistantRequest): Promise<VoiceAssistantResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-voice-assistant', {
      body: request,
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to get AI response');
    }

    return data;
  } catch (error) {
    console.error('Error sending voice message:', error);
    throw error;
  }
};

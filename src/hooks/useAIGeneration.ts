
import { useState } from 'react';
import { generateLesson, generateQuiz } from '@/lib/aiClient';
import { useToast } from '@/hooks/use-toast';

export const useAIGeneration = () => {
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const { toast } = useToast();

  const handleGenerateLesson = async (payload: any) => {
    setIsGeneratingLesson(true);
    try {
      const result = await generateLesson(payload);
      toast({
        title: "Success",
        description: "Lesson generated successfully!",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate lesson",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const handleGenerateQuiz = async (payload: any) => {
    setIsGeneratingQuiz(true);
    try {
      const result = await generateQuiz(payload);
      toast({
        title: "Success",
        description: "Quiz generated successfully!",
      });
      return result;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate quiz",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return {
    handleGenerateLesson,
    handleGenerateQuiz,
    isGeneratingLesson,
    isGeneratingQuiz
  };
};

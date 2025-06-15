
import { sampleQuizData } from '../data/sampleData';

export interface QuizGenerationRequest {
  lessonId: string;
  questionCount: number;
  bloomsLevels: string[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
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

// Stub API function that returns static quiz JSON
export const generateQuiz = async (request: QuizGenerationRequest): Promise<QuizGenerationResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate questions based on request parameters
  const questions: QuizQuestion[] = [];
  
  // Sample question bank
  const questionBank = [
    {
      id: 'q1',
      type: 'multiple-choice' as const,
      question: 'What is the primary goal of supervised learning?',
      options: [
        'To find hidden patterns in data',
        'To predict outcomes based on labeled training data',
        'To reduce dimensionality of datasets',
        'To cluster similar data points'
      ],
      correctAnswer: 1,
      bloomsLevel: 'Knowledge',
      explanation: 'Supervised learning uses labeled training data to learn patterns and make predictions on new, unseen data.'
    },
    {
      id: 'q2',
      type: 'multiple-choice' as const,
      question: 'Which algorithm is best suited for classification tasks?',
      options: [
        'K-Means Clustering',
        'Principal Component Analysis',
        'Random Forest',
        'Linear Regression'
      ],
      correctAnswer: 2,
      bloomsLevel: 'Application',
      explanation: 'Random Forest is a powerful ensemble method specifically designed for classification tasks.'
    },
    {
      id: 'q3',
      type: 'true-false' as const,
      question: 'Overfitting occurs when a model performs well on training data but poorly on test data.',
      correctAnswer: 'true',
      bloomsLevel: 'Comprehension',
      explanation: 'Overfitting is exactly this phenomenon - the model memorizes the training data but fails to generalize.'
    },
    {
      id: 'q4',
      type: 'short-answer' as const,
      question: 'Explain the bias-variance tradeoff in machine learning.',
      correctAnswer: 'The bias-variance tradeoff describes the relationship between model complexity and prediction error.',
      bloomsLevel: 'Analysis',
      explanation: 'This concept helps understand how to balance model complexity to minimize both bias and variance.'
    }
  ];
  
  // Select questions based on request
  const selectedQuestions = questionBank
    .filter(q => request.bloomsLevels.includes(q.bloomsLevel))
    .slice(0, request.questionCount);
  
  return {
    id: `quiz-${Date.now()}`,
    title: `Auto-generated Quiz for Lesson ${request.lessonId}`,
    lessonId: request.lessonId,
    estimatedDuration: `${Math.ceil(request.questionCount * 2)} minutes`,
    questions: selectedQuestions,
    totalPoints: selectedQuestions.length * 5
  };
};

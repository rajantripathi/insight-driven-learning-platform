
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!openAIApiKey) {
      // Fallback to static data if no API key
      const fallbackData = {
        id: `quiz-${Date.now()}`,
        title: "Machine Learning Basics Quiz",
        estimatedDuration: "15 minutes",
        totalPoints: 25,
        questions: [
          {
            type: "multiple-choice",
            question: "What is the primary goal of supervised learning?",
            options: [
              "To find hidden patterns in data",
              "To predict outcomes based on labeled training data",
              "To reduce dimensionality of datasets",
              "To cluster similar data points"
            ],
            correctAnswer: "1",
            bloomsLevel: "Knowledge",
            explanation: "Supervised learning uses labeled training data to learn patterns and make predictions."
          }
        ]
      };
      
      return new Response(JSON.stringify(fallbackData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { lessonId, questionCount, bloomsLevels, difficultyLevel } = await req.json();

    const prompt = `Generate a quiz with ${questionCount} multiple-choice questions for a university-level lesson.

Requirements:
- Bloom's Taxonomy levels: ${bloomsLevels.join(', ')}
- Difficulty: ${difficultyLevel}
- Question types: multiple-choice, true-false
- Each question should have 4 options for multiple-choice
- Include explanations for correct answers

Please generate the quiz in JSON format:
{
  "title": "Quiz title",
  "estimatedDuration": "15 minutes",
  "questions": [
    {
      "type": "multiple-choice",
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "0",
      "bloomsLevel": "Knowledge|Comprehension|Application|Analysis|Synthesis|Evaluation",
      "explanation": "Explanation of the correct answer"
    },
    {
      "type": "true-false",
      "question": "True/false question text",
      "correctAnswer": "true",
      "bloomsLevel": "Knowledge|Comprehension|Application|Analysis|Synthesis|Evaluation",
      "explanation": "Explanation of the correct answer"
    }
  ]
}

Make questions challenging and educationally valuable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert educational assessment designer. Create high-quality quiz questions that test student understanding. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let quizData;
    
    try {
      quizData = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Save to Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        lesson_id: lessonId,
        title: quizData.title,
        estimated_duration: quizData.estimatedDuration,
        total_points: quizData.questions.length * 5,
      })
      .select()
      .single();

    if (assessmentError) throw assessmentError;

    // Save questions
    if (quizData.questions?.length > 0) {
      const questions = quizData.questions.map((question: any, index: number) => ({
        assessment_id: assessment.id,
        type: question.type,
        question_text: question.question,
        options: question.options ? JSON.stringify(question.options) : null,
        correct_answer: question.correctAnswer,
        bloom_level: question.bloomsLevel,
        explanation: question.explanation,
        points: 5,
        order_index: index,
      }));

      await supabase.from('questions').insert(questions);
    }

    return new Response(JSON.stringify({ 
      ...quizData, 
      id: assessment.id,
      lessonId,
      totalPoints: quizData.questions.length * 5 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-quiz function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

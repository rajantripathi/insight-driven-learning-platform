import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_TOKENS_PER_MIN = 10000;

// Simple token estimation function
const estimateTokens = (text: string): number => {
  // Rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
};

const getTokensLastMinute = async (supabase: any, uid: string): Promise<number> => {
  const { data, error } = await supabase.rpc('get_tokens_last_minute', { user_id: uid });
  if (error) {
    console.error('Error getting tokens last minute:', error);
    return 0;
  }
  return data || 0;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

Make questions challenging and educationally valuable. Return STRICT VALID JSON. Do not wrap in markdown. If unsure, respond with the word ERROR.`;

    // Rate limiting check
    const projectedTokens = estimateTokens(prompt);
    const tokensLastMinute = await getTokensLastMinute(supabase, user.id);
    
    if (tokensLastMinute + projectedTokens > MAX_TOKENS_PER_MIN) {
      return new Response(JSON.stringify({ error: 'rate_limit' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert educational assessment designer. Create high-quality quiz questions that test student understanding. Always respond with valid JSON only. Return STRICT VALID JSON. Do not wrap in markdown. If unsure, respond with the word ERROR.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Check if AI responded with ERROR
    if (aiResponse.trim() === 'ERROR') {
      // Fallback to static data if AI response is ERROR
      const fallbackData = {
        title: `Assessment Quiz`,
        estimatedDuration: "15 minutes",
        questions: [
          {
            type: "multiple-choice",
            question: "What is the most important aspect of effective learning?",
            options: [
              "Memorization of facts",
              "Understanding concepts and applying them",
              "Speed of completion",
              "Perfect recall"
            ],
            correctAnswer: "1",
            bloomsLevel: "Comprehension",
            explanation: "Effective learning focuses on understanding and application rather than mere memorization."
          }
        ]
      };
      
      // Save fallback to Supabase
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          lesson_id: lessonId,
          title: fallbackData.title,
          estimated_duration: fallbackData.estimatedDuration,
          total_points: fallbackData.questions.length * 5,
        })
        .select()
        .single();

      if (!assessmentError) {
        return new Response(JSON.stringify({ 
          ...fallbackData, 
          id: assessment.id,
          lessonId,
          totalPoints: fallbackData.questions.length * 5 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    let quizData;
    try {
      quizData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Record token usage
    const actualTokens = data.usage?.total_tokens || projectedTokens;
    await supabase.from('openai_usage').insert({
      uid: user.id,
      tokens: actualTokens,
    });

    // Save to Supabase
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

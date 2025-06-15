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
        id: `lesson-${Date.now()}`,
        title: "Introduction to Machine Learning",
        estimatedDuration: "2 hours",
        learningObjectives: [
          "Understand the basic concepts of machine learning",
          "Differentiate between supervised and unsupervised learning",
          "Identify real-world applications of machine learning"
        ],
        resources: [
          {
            id: "res1",
            type: "video",
            title: "What is Machine Learning?",
            url: "https://example.com/video1",
            duration: "15 min"
          }
        ],
        activities: [
          {
            id: "act1",
            type: "reading",
            title: "Read Chapter 1: Introduction to ML",
            estimatedTime: "30 min"
          }
        ]
      };
      
      return new Response(JSON.stringify(fallbackData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseId, cloId, sessionNo, topic, learningOutcomes } = await req.json();

    const prompt = `Generate a comprehensive lesson plan for a university-level course with the following details:
    
Topic: ${topic}
Learning Outcomes: ${learningOutcomes?.join(', ') || 'General understanding of the topic'}
Session Number: ${sessionNo}

Please generate a lesson plan in JSON format with the following structure:
{
  "title": "Lesson title",
  "estimatedDuration": "2 hours",
  "learningObjectives": ["objective1", "objective2", "objective3"],
  "resources": [
    {
      "type": "video|pdf|reading|external",
      "title": "Resource title",
      "description": "Brief description",
      "url": "https://example.com",
      "duration": "15 min"
    }
  ],
  "activities": [
    {
      "type": "reading|video-watch|lab-exercise|discussion|quiz",
      "title": "Activity title",
      "description": "Activity description",
      "estimatedTime": "30 min"
    }
  ]
}

Make the lesson engaging, practical, and aligned with university-level learning standards. Return STRICT VALID JSON. Do not wrap in markdown. If unsure, respond with the word ERROR.`;

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
          { role: 'system', content: 'You are an expert educational designer who creates comprehensive lesson plans for university courses. Always respond with valid JSON only. Return STRICT VALID JSON. Do not wrap in markdown. If unsure, respond with the word ERROR.' },
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
      const fallbackData = {
        title: `${topic} - Lesson ${sessionNo}`,
        estimatedDuration: "2 hours",
        learningObjectives: [
          `Understand the fundamentals of ${topic}`,
          `Apply concepts of ${topic} in practical scenarios`,
          `Analyze real-world applications of ${topic}`
        ],
        resources: [
          {
            type: "reading",
            title: `Introduction to ${topic}`,
            description: `Comprehensive overview of ${topic} concepts`,
            url: "https://example.com/reading",
            duration: "30 min"
          }
        ],
        activities: [
          {
            type: "discussion",
            title: `Group Discussion on ${topic}`,
            description: `Interactive discussion about key concepts in ${topic}`,
            estimatedTime: "45 min"
          }
        ]
      };
      
      // Save fallback to Supabase
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          course_id: courseId,
          clo_id: cloId,
          title: fallbackData.title,
          session_no: sessionNo,
          estimated_duration: fallbackData.estimatedDuration,
          learning_objectives: fallbackData.learningObjectives,
        })
        .select()
        .single();

      if (!lessonError) {
        return new Response(JSON.stringify({ ...fallbackData, id: lesson.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    let lessonData;
    try {
      lessonData = JSON.parse(aiResponse);
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

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        clo_id: cloId,
        title: lessonData.title,
        session_no: sessionNo,
        estimated_duration: lessonData.estimatedDuration,
        learning_objectives: lessonData.learningObjectives,
      })
      .select()
      .single();

    if (lessonError) throw lessonError;

    // Save resources
    if (lessonData.resources?.length > 0) {
      const resources = lessonData.resources.map((resource: any, index: number) => ({
        lesson_id: lesson.id,
        type: resource.type,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        duration: resource.duration,
        order_index: index,
      }));

      await supabase.from('resources').insert(resources);
    }

    // Save activities
    if (lessonData.activities?.length > 0) {
      const activities = lessonData.activities.map((activity: any, index: number) => ({
        lesson_id: lesson.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        estimated_time: activity.estimatedTime,
        order_index: index,
      }));

      await supabase.from('activities').insert(activities);
    }

    return new Response(JSON.stringify({ ...lessonData, id: lesson.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-lesson function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

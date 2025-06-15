
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!openAIApiKey) {
      // Fallback topics if no API key
      const { numberOfSessions, courseLevel } = await req.json();
      
      const fallbackTopics = `Topic 1: Introduction and Fundamentals
Topic 2: Core Concepts and Principles
Topic 3: Basic Applications and Examples
Topic 4: Intermediate Techniques and Methods
Topic 5: Advanced Concepts and Theory
Topic 6: Practical Implementation and Case Studies
Topic 7: Real-world Applications and Projects
Topic 8: Assessment and Review

Note: These are sample topics. For customized, AI-generated topics based on your specific course requirements, please add an OpenAI API key to your project settings.`;
      
      return new Response(JSON.stringify({ topics: fallbackTopics }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseTitle, courseDescription, numberOfSessions, sessionDuration, courseLevel, courseCategory } = await req.json();

    const prompt = `You are an expert curriculum designer. Generate a comprehensive course outline and topic list for a university course with the following details:

Course Title: ${courseTitle}
Course Description: ${courseDescription || 'No description provided'}
Number of Sessions: ${numberOfSessions}
Session Duration: ${sessionDuration}
Course Level: ${courseLevel || 'Intermediate'}
Course Category: ${courseCategory || 'General'}

Create a detailed outline of topics and modules that should be covered in this course. The topics should:

1. Be logically sequenced from basic to advanced concepts
2. Cover all essential areas of the subject
3. Be appropriate for ${numberOfSessions} sessions of ${sessionDuration} each
4. Include both theoretical and practical components
5. Be suitable for ${courseLevel} level students
6. Include assessment opportunities and hands-on activities
7. Follow current best practices in the field

Format your response as a clear, organized list of topics with brief descriptions. Include main topics and relevant subtopics. Make it comprehensive enough to guide the entire course structure.

Provide topics that will naturally flow into ${numberOfSessions} sessions when later broken down into individual lessons.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert curriculum designer who creates comprehensive course outlines for educational institutions. Provide detailed, well-structured topic lists that follow pedagogical best practices.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const generatedTopics = data.choices[0].message.content;

    return new Response(JSON.stringify({ topics: generatedTopics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-course-topics function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

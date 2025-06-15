
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
      // Fallback to static data if no API key
      const { numberOfSessions, sessionDuration } = await req.json();
      
      const fallbackSessions = Array.from({ length: numberOfSessions }, (_, i) => ({
        sessionNo: i + 1,
        title: `Session ${i + 1}: Introduction to Topic ${i + 1}`,
        objectives: [
          `Understand the basics of topic ${i + 1}`,
          `Apply concepts learned in previous sessions`,
          `Prepare for upcoming advanced topics`
        ],
        estimatedDuration: sessionDuration
      }));
      
      return new Response(JSON.stringify({ sessions: fallbackSessions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { courseTitle, courseDescription, numberOfSessions, topics, sessionDuration } = await req.json();

    const prompt = `You are an expert educational designer. Create a comprehensive session plan for a university-level course with the following details:

Course Title: ${courseTitle}
Course Description: ${courseDescription}
Number of Sessions: ${numberOfSessions}
Session Duration: ${sessionDuration}
Topics to Cover: ${topics}

Generate a detailed session plan that:
1. Distributes the topics logically across all ${numberOfSessions} sessions
2. Creates engaging session titles that build upon each other
3. Provides 3-4 specific learning objectives per session
4. Ensures proper progression from basic to advanced concepts
5. Balances theory and practical application

Return ONLY a JSON object with this exact structure:
{
  "sessions": [
    {
      "sessionNo": 1,
      "title": "Session title",
      "objectives": ["objective1", "objective2", "objective3"],
      "estimatedDuration": "${sessionDuration}"
    }
  ]
}

Make sure each session title is engaging and descriptive. Learning objectives should be specific, measurable, and appropriate for university-level students. Ensure the sessions flow logically and build upon previous knowledge.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert educational designer who creates comprehensive session plans for university courses. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let sessionData;
    
    try {
      sessionData = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    // Validate the response structure
    if (!sessionData.sessions || !Array.isArray(sessionData.sessions)) {
      throw new Error('Invalid session plan format');
    }

    // Ensure we have the correct number of sessions
    if (sessionData.sessions.length !== numberOfSessions) {
      console.warn(`Expected ${numberOfSessions} sessions, got ${sessionData.sessions.length}`);
    }

    return new Response(JSON.stringify(sessionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-session-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

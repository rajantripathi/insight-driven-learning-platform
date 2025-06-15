
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
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'I need an OpenAI API key to help you with voice interactions. Please configure it in your project settings.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, lessonContent, assessmentMode } = await req.json();

    let systemPrompt = `You are an AI learning assistant helping a student understand their course material. You should:

1. Be encouraging and supportive
2. Explain concepts clearly and simply
3. Ask follow-up questions to check understanding
4. Provide examples and analogies when helpful
5. Guide students to discover answers rather than just giving them
6. Keep responses conversational and engaging for voice interaction

Current lesson context: ${context || 'General learning session'}
Lesson content: ${lessonContent || 'No specific content provided'}`;

    if (assessmentMode) {
      systemPrompt += `

ASSESSMENT MODE: You are also evaluating the student's understanding. After each interaction:
- Assess if the student demonstrates understanding of the concept
- Note any misconceptions or gaps in knowledge
- Suggest areas that need more practice
- Provide a brief assessment summary when appropriate

Keep your responses natural and conversational while subtly evaluating comprehension.`;
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
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Simple assessment logic based on keywords and response patterns
    let assessmentFeedback = null;
    if (assessmentMode) {
      assessmentFeedback = {
        understoodConcept: message.length > 20 && !message.toLowerCase().includes('i don\'t know'),
        engagementLevel: message.split(' ').length > 5 ? 'high' : 'medium',
        needsMorePractice: message.toLowerCase().includes('confused') || message.toLowerCase().includes('difficult'),
      };
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      assessment: assessmentFeedback
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-voice-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

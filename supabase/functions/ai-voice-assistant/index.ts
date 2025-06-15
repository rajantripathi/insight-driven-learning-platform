
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
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'I need an OpenAI API key to help you with voice interactions. Please configure it in your project settings.'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, context, lessonContent, assessmentMode } = await req.json();

    console.log('Voice assistant request:', {
      message: message?.substring(0, 100),
      context,
      hasLessonContent: !!lessonContent,
      assessmentMode
    });

    let systemPrompt = `You are an expert AI learning assistant helping a student understand their course material. Your role is to:

1. **Be encouraging and supportive** - Create a positive learning environment
2. **Explain concepts clearly** - Use simple language and relatable examples
3. **Ask probing questions** - Check understanding through strategic questioning
4. **Provide analogies and examples** - Make abstract concepts concrete
5. **Guide discovery** - Help students find answers rather than just giving them
6. **Keep responses conversational** - Optimized for voice interaction (concise but complete)
7. **Adapt to student level** - Match explanations to their understanding

**Current Learning Context:**
- Topic: ${context || 'General learning session'}
- Lesson Content: ${lessonContent || 'No specific content provided'}

**Voice Interaction Guidelines:**
- Keep responses under 100 words when possible
- Use natural, conversational language
- Ask one question at a time
- Pause for student responses
- Acknowledge student input before providing new information`;

    if (assessmentMode) {
      systemPrompt += `

**ASSESSMENT MODE ACTIVE:**
You are continuously evaluating the student's learning progress. For each interaction, assess:

1. **Conceptual Understanding**: Does the student demonstrate grasp of key concepts?
2. **Knowledge Gaps**: What misconceptions or missing information do you detect?
3. **Engagement Level**: How actively is the student participating?
4. **Learning Needs**: What areas need more practice or different approaches?

**Assessment Indicators:**
- Understanding: Look for correct usage of terminology, logical connections, ability to explain concepts
- Engagement: Length and depth of responses, questions asked, enthusiasm in voice
- Confusion: Incorrect statements, hesitation, requests for clarification
- Progress: Building on previous knowledge, making connections, applying concepts

Provide natural, encouraging feedback while subtly guiding them toward better understanding.`;
    }

    console.log('Sending request to OpenAI...');

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
        max_tokens: 300, // Shorter responses for voice interaction
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    // Enhanced assessment logic for better learning evaluation
    let assessmentFeedback = null;
    if (assessmentMode) {
      console.log('Generating assessment feedback...');
      
      // Analyze student response characteristics
      const messageLength = message.length;
      const wordCount = message.split(' ').length;
      const hasQuestions = message.includes('?');
      const showsConfusion = /confused|don't understand|difficult|hard|lost/i.test(message);
      const showsConfidence = /understand|get it|makes sense|clear|easy/i.test(message);
      const usesTerminology = lessonContent ? 
        lessonContent.split(' ').slice(0, 20).some(word => 
          message.toLowerCase().includes(word.toLowerCase())
        ) : false;

      // Determine understanding level
      let understoodConcept = false;
      if (showsConfidence && messageLength > 20 && !showsConfusion) {
        understoodConcept = true;
      } else if (usesTerminology && wordCount > 5 && !showsConfusion) {
        understoodConcept = true;
      }

      // Determine engagement level
      let engagementLevel: 'low' | 'medium' | 'high' = 'medium';
      if (wordCount > 15 || hasQuestions || showsConfidence) {
        engagementLevel = 'high';
      } else if (wordCount < 5 || messageLength < 15) {
        engagementLevel = 'low';
      }

      // Determine if more practice is needed
      const needsMorePractice = showsConfusion || 
        !understoodConcept || 
        messageLength < 20;

      assessmentFeedback = {
        understoodConcept,
        engagementLevel,
        needsMorePractice,
      };

      console.log('Assessment feedback generated:', assessmentFeedback);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      assessment: assessmentFeedback
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-voice-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'I apologize, but I encountered an error processing your request. Please try again or check your connection.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

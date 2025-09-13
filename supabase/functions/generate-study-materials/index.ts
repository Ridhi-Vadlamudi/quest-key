import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  content: string;
  title: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { content, title }: RequestBody = await req.json();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Content is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Generate summary
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert study assistant. Create concise, well-structured summaries that help students understand and remember key concepts. Focus on the most important information and organize it clearly.'
          },
          {
            role: 'user',
            content: `Please create a comprehensive summary of the following study material titled "${title}":\n\n${content}`
          }
        ],
        max_completion_tokens: 1500,
      }),
    });

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0].message.content;

    // Generate flashcards
    const flashcardsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating effective flashcards for studying. Create clear, concise questions with comprehensive answers. Return ONLY a valid JSON array of objects with "question" and "answer" fields.'
          },
          {
            role: 'user',
            content: `Create 8-12 flashcards from this content:\n\n${content}`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const flashcardsData = await flashcardsResponse.json();
    let flashcards;
    try {
      flashcards = JSON.parse(flashcardsData.choices[0].message.content);
    } catch {
      // Fallback if JSON parsing fails
      flashcards = [
        { question: "What are the main topics covered?", answer: "Please review the content manually as flashcard generation encountered an error." }
      ];
    }

    // Generate practice questions
    const practiceResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating multiple choice practice questions. Create challenging but fair questions with 4 options each. Return ONLY a valid JSON array of objects with "question", "options" (array of 4 strings), "correctAnswer" (the exact text of the correct option), and "explanation" fields.'
          },
          {
            role: 'user',
            content: `Create 5-8 multiple choice practice questions from this content:\n\n${content}`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const practiceData = await practiceResponse.json();
    let practiceQuestions;
    try {
      practiceQuestions = JSON.parse(practiceData.choices[0].message.content);
    } catch {
      // Fallback if JSON parsing fails
      practiceQuestions = [
        { 
          question: "Practice questions will be available once content is properly processed",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: "Please review the content manually as practice question generation encountered an error."
        }
      ];
    }

    return new Response(JSON.stringify({
      summary,
      flashcards,
      practiceQuestions
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in generate-study-materials function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
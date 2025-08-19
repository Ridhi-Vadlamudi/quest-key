import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, content } = await req.json();

    if (!documentId || !content) {
      throw new Error('Document ID and content are required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Processing document:', documentId);

    // Generate summary
    const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating comprehensive, well-structured summaries of study materials. Create a clear, organized summary that captures all key concepts, important details, and main points. Use bullet points and headers where appropriate to make it easy to study from.'
          },
          {
            role: 'user',
            content: `Please create a comprehensive study summary of the following content:\n\n${content}`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0].message.content;

    // Save summary
    const { error: summaryError } = await supabase
      .from('summaries')
      .insert({
        document_id: documentId,
        content: summary,
      });

    if (summaryError) throw summaryError;

    // Generate flashcards
    const flashcardsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating effective study flashcards. Create 8-12 flashcards that test the most important concepts from the material. Each flashcard should have a clear, concise question and a detailed answer. Format your response as a JSON array with objects containing "question" and "answer" fields.'
          },
          {
            role: 'user',
            content: `Create flashcards from this content:\n\n${content}`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const flashcardsData = await flashcardsResponse.json();
    let flashcards;
    
    try {
      flashcards = JSON.parse(flashcardsData.choices[0].message.content);
    } catch (e) {
      // Fallback: try to extract from markdown format
      const flashcardText = flashcardsData.choices[0].message.content;
      const lines = flashcardText.split('\n');
      flashcards = [];
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('Q:') || lines[i].includes('Question:')) {
          const question = lines[i].replace(/Q:|Question:/, '').trim();
          const answer = lines[i + 1] ? lines[i + 1].replace(/A:|Answer:/, '').trim() : '';
          if (question && answer) {
            flashcards.push({ question, answer });
          }
        }
      }
    }

    // Save flashcards
    if (flashcards && Array.isArray(flashcards)) {
      const flashcardInserts = flashcards.map((card: any) => ({
        document_id: documentId,
        question: card.question,
        answer: card.answer,
      }));

      const { error: flashcardsError } = await supabase
        .from('flashcards')
        .insert(flashcardInserts);

      if (flashcardsError) throw flashcardsError;
    }

    // Generate practice questions
    const questionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating practice questions for study materials. Create 5-8 multiple choice questions that test understanding of key concepts. Format your response as a JSON array with objects containing "question", "options" (array of 4 choices), "correct_answer", and "explanation" fields.'
          },
          {
            role: 'user',
            content: `Create practice questions from this content:\n\n${content}`
          }
        ],
        max_completion_tokens: 2000,
      }),
    });

    const questionsData = await questionsResponse.json();
    let questions;
    
    try {
      questions = JSON.parse(questionsData.choices[0].message.content);
    } catch (e) {
      console.log('Failed to parse questions JSON, skipping questions generation');
      questions = [];
    }

    // Save practice questions
    if (questions && Array.isArray(questions)) {
      const questionInserts = questions.map((q: any) => ({
        document_id: documentId,
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      }));

      const { error: questionsError } = await supabase
        .from('practice_questions')
        .insert(questionInserts);

      if (questionsError) throw questionsError;
    }

    console.log('Document processing completed successfully');

    return new Response(JSON.stringify({ 
      success: true,
      summary: summary,
      flashcards_count: flashcards?.length || 0,
      questions_count: questions?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing document:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
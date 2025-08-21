-- Add session_id column and make user_id nullable in documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS session_id text,
ALTER COLUMN user_id DROP NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view flashcards of their documents" ON public.flashcards;
DROP POLICY IF EXISTS "Users can create flashcards for their documents" ON public.flashcards;
DROP POLICY IF EXISTS "Users can update flashcards of their documents" ON public.flashcards;

DROP POLICY IF EXISTS "Users can view summaries of their documents" ON public.summaries;
DROP POLICY IF EXISTS "Users can create summaries for their documents" ON public.summaries;

DROP POLICY IF EXISTS "Users can view practice questions of their documents" ON public.practice_questions;
DROP POLICY IF EXISTS "Users can create practice questions for their documents" ON public.practice_questions;

-- Create new RLS policies allowing anonymous access
CREATE POLICY "Anyone can view documents" ON public.documents FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can create documents" ON public.documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can update documents" ON public.documents FOR UPDATE TO anon USING (true);
CREATE POLICY "Anyone can delete documents" ON public.documents FOR DELETE TO anon USING (true);

CREATE POLICY "Anyone can view flashcards" ON public.flashcards FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can create flashcards" ON public.flashcards FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can update flashcards" ON public.flashcards FOR UPDATE TO anon USING (true);
CREATE POLICY "Anyone can delete flashcards" ON public.flashcards FOR DELETE TO anon USING (true);

CREATE POLICY "Anyone can view summaries" ON public.summaries FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can create summaries" ON public.summaries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can update summaries" ON public.summaries FOR UPDATE TO anon USING (true);
CREATE POLICY "Anyone can delete summaries" ON public.summaries FOR DELETE TO anon USING (true);

CREATE POLICY "Anyone can view practice questions" ON public.practice_questions FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone can create practice questions" ON public.practice_questions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can update practice questions" ON public.practice_questions FOR UPDATE TO anon USING (true);
CREATE POLICY "Anyone can delete practice questions" ON public.practice_questions FOR DELETE TO anon USING (true);
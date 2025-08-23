-- Drop all existing insecure RLS policies
DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can create documents" ON public.documents;  
DROP POLICY IF EXISTS "Anyone can update documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.documents;

DROP POLICY IF EXISTS "Anyone can view flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Anyone can create flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Anyone can update flashcards" ON public.flashcards;
DROP POLICY IF EXISTS "Anyone can delete flashcards" ON public.flashcards;

DROP POLICY IF EXISTS "Anyone can view summaries" ON public.summaries;
DROP POLICY IF EXISTS "Anyone can create summaries" ON public.summaries;
DROP POLICY IF EXISTS "Anyone can update summaries" ON public.summaries;
DROP POLICY IF EXISTS "Anyone can delete summaries" ON public.summaries;

DROP POLICY IF EXISTS "Anyone can view practice questions" ON public.practice_questions;
DROP POLICY IF EXISTS "Anyone can create practice questions" ON public.practice_questions;
DROP POLICY IF EXISTS "Anyone can update practice questions" ON public.practice_questions;
DROP POLICY IF EXISTS "Anyone can delete practice questions" ON public.practice_questions;

-- Create secure user-specific policies for documents
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own documents" 
ON public.documents 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- Create secure policies for flashcards (via document ownership)
CREATE POLICY "Users can view flashcards from their documents" 
ON public.flashcards 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = flashcards.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can create flashcards for their documents" 
ON public.flashcards 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = flashcards.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can update flashcards from their documents" 
ON public.flashcards 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = flashcards.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can delete flashcards from their documents" 
ON public.flashcards 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = flashcards.document_id 
  AND documents.user_id = auth.uid()
));

-- Create secure policies for summaries (via document ownership)
CREATE POLICY "Users can view summaries from their documents" 
ON public.summaries 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = summaries.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can create summaries for their documents" 
ON public.summaries 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = summaries.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can update summaries from their documents" 
ON public.summaries 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = summaries.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can delete summaries from their documents" 
ON public.summaries 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = summaries.document_id 
  AND documents.user_id = auth.uid()
));

-- Create secure policies for practice questions (via document ownership)
CREATE POLICY "Users can view practice questions from their documents" 
ON public.practice_questions 
FOR SELECT 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = practice_questions.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can create practice questions for their documents" 
ON public.practice_questions 
FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = practice_questions.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can update practice questions from their documents" 
ON public.practice_questions 
FOR UPDATE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = practice_questions.document_id 
  AND documents.user_id = auth.uid()
));

CREATE POLICY "Users can delete practice questions from their documents" 
ON public.practice_questions 
FOR DELETE 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.documents 
  WHERE documents.id = practice_questions.document_id 
  AND documents.user_id = auth.uid()
));
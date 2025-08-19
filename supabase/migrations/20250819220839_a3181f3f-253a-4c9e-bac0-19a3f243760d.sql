-- Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_name TEXT,
  file_path TEXT,
  file_type TEXT,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create summaries table
CREATE TABLE public.summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create flashcards table
CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty INTEGER DEFAULT 1,
  next_review TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create practice_questions table
CREATE TABLE public.practice_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for documents
CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for summaries
CREATE POLICY "Users can view summaries of their documents" ON public.summaries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = summaries.document_id AND documents.user_id = auth.uid())
);
CREATE POLICY "Users can create summaries for their documents" ON public.summaries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = summaries.document_id AND documents.user_id = auth.uid())
);

-- Create RLS policies for flashcards
CREATE POLICY "Users can view flashcards of their documents" ON public.flashcards FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = flashcards.document_id AND documents.user_id = auth.uid())
);
CREATE POLICY "Users can create flashcards for their documents" ON public.flashcards FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = flashcards.document_id AND documents.user_id = auth.uid())
);
CREATE POLICY "Users can update flashcards of their documents" ON public.flashcards FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = flashcards.document_id AND documents.user_id = auth.uid())
);

-- Create RLS policies for practice questions
CREATE POLICY "Users can view practice questions of their documents" ON public.practice_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = practice_questions.document_id AND documents.user_id = auth.uid())
);
CREATE POLICY "Users can create practice questions for their documents" ON public.practice_questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.documents WHERE documents.id = practice_questions.document_id AND documents.user_id = auth.uid())
);

-- Create storage policies for documents
CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects FOR DELETE USING (
  bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
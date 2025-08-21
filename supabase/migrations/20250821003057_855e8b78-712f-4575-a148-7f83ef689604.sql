-- Create storage policies for anonymous file uploads
CREATE POLICY "Anyone can upload to documents bucket" 
ON storage.objects 
FOR INSERT 
TO anon 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can view files in documents bucket" 
ON storage.objects 
FOR SELECT 
TO anon 
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can update files in documents bucket" 
ON storage.objects 
FOR UPDATE 
TO anon 
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can delete files in documents bucket" 
ON storage.objects 
FOR DELETE 
TO anon 
USING (bucket_id = 'documents');
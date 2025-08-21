import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2 } from "lucide-react";

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileName = `anonymous/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Read file content for text files
      let content = "";
      if (file.type === "text/plain") {
        content = await file.text();
      } else if (file.type === "application/pdf") {
        // For PDF files, we'll read as array buffer and let the backend process it
        const arrayBuffer = await file.arrayBuffer();
        content = `PDF_BINARY_DATA:${Array.from(new Uint8Array(arrayBuffer)).join(',')}`;
      } else if (file.name.toLowerCase().endsWith('.docx')) {
        content = `[DOCX Content - ${file.name}]\nDOCX file uploaded - content will be extracted server-side.`;
      } else {
        content = await file.text(); // Try to read as text for other formats
      }

      // Create document record without user_id
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          title: title || file.name,
          file_name: file.name,
          file_path: uploadData.path,
          file_type: file.type,
          content: content,
        })
        .select()
        .single();

      if (docError) throw docError;

      // Process document with AI
      await processDocument(docData.id, content);

      toast({
        title: "Success!",
        description: "Your document has been uploaded and processed. Check the other tabs to see your generated content!",
      });

      // Reset form
      setTitle("");
      setTextContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Trigger a page refresh to show new content
      window.location.reload();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return;

    setProcessing(true);

    try {
      // Create document record for text
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          title: title || "Text Document",
          content: textContent,
          file_type: "text/plain",
        })
        .select()
        .single();

      if (docError) throw docError;

      // Process document with AI
      await processDocument(docData.id, textContent);

      toast({
        title: "Success!",
        description: "Your text has been processed and study materials created. Check the other tabs to see your generated content!",
      });

      // Reset form
      setTitle("");
      setTextContent("");

      // Trigger a page refresh to show new content
      window.location.reload();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const processDocument = async (documentId: string, content: string) => {
    console.log('Starting document processing for:', documentId);
    
    const { data, error } = await supabase.functions.invoke("process-document", {
      body: { documentId, content },
    });

    console.log('Process document response:', { data, error });
    
    if (error) {
      console.error('Process document error:', error);
      throw error;
    }
    
    return data;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your document..."
              />
            </div>

            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: PDF, DOCX, TXT files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt"
                className="hidden"
                disabled={uploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="mt-4"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Choose Files to Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-muted-foreground">
        <p>or</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label htmlFor="text-content">Paste Your Text</Label>
            <Textarea
              id="text-content"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your study material here..."
              rows={8}
            />
            <Button
              onClick={handleTextSubmit}
              disabled={!textContent.trim() || processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Study Materials"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
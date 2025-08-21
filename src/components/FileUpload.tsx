import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain } from "lucide-react";

const FileUpload = () => {
  const [processing, setProcessing] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [title, setTitle] = useState("");
  const { toast } = useToast();

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
        description: "Your content has been processed and study materials created. Check the other tabs to see your generated content!",
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
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your study material..."
              />
            </div>

            <div>
              <Label htmlFor="text-content">Paste Your Study Material</Label>
              <Textarea
                id="text-content"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your PDF content, DOCX text, syllabus, notes, or any study material here..."
                rows={12}
                className="min-h-[300px]"
              />
            </div>
            
            <Button
              onClick={handleTextSubmit}
              disabled={!textContent.trim() || processing}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Study Materials...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Summary, Flashcards & Practice Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FileUpload;
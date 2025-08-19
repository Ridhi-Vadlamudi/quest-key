import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const FileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Read file content for text files
      let content = "";
      if (file.type === "text/plain") {
        content = await file.text();
      } else if (file.type === "application/pdf") {
        // For PDF, we'll store the file path and process it server-side
        // In a real implementation, you'd use PDF.js or similar
        content = `[PDF Content - ${file.name}]\nThis is a PDF file that needs to be processed.`;
      }

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
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
        description: "Your document has been uploaded and processed.",
      });

      // Reset form
      setTitle("");
      setTextContent("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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
    if (!textContent.trim() || !user) return;

    setProcessing(true);

    try {
      // Create document record for text
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
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
        description: "Your text has been processed and study materials created.",
      });

      // Reset form
      setTitle("");
      setTextContent("");

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
    const { error } = await supabase.functions.invoke("process-document", {
      body: { documentId, content },
    });

    if (error) throw error;
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please sign in to upload documents.</p>
        </CardContent>
      </Card>
    );
  }

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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, CreditCard, BookOpen, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FlashcardStudy from "./FlashcardStudy";
import { useNavigate } from "react-router-dom";

interface GeneratedContent {
  title: string;
  summary: string;
  flashcards: Array<{ question: string; answer: string }>;
  practiceQuestions: Array<{ question: string; options: string[]; correctAnswer: string; explanation: string }>;
}

const GuestStudyGenerator = () => {
  const [processing, setProcessing] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [title, setTitle] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [studyMode, setStudyMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return;

    setProcessing(true);

    try {
      // Call Supabase edge function for guest users without saving to database
      const response = await fetch(`https://agsarxzqbvkdcoqjtifk.supabase.co/functions/v1/generate-study-materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: textContent, 
          title: title || "Study Material" 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate study materials');
      }

      const data = await response.json();
      
      setGeneratedContent({
        title: title || "Study Material",
        summary: data.summary,
        flashcards: data.flashcards,
        practiceQuestions: data.practiceQuestions
      });

      toast({
        title: "Success!",
        description: "Your study materials have been generated! Check the tabs below to view them.",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate study materials",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveContent = () => {
    // Prompt user to sign up to save their content
    if (generatedContent) {
      localStorage.setItem('pendingStudyContent', JSON.stringify(generatedContent));
      toast({
        title: "Sign up to save your content",
        description: "Your study materials will be saved after you create an account.",
      });
      navigate('/auth');
    }
  };

  if (studyMode && generatedContent) {
    return (
      <FlashcardStudy
        flashcards={generatedContent.flashcards.map((card, index) => ({
          id: `temp-${index}`,
          question: card.question,
          answer: card.answer,
          document_id: 'temp'
        }))}
        documentTitle={generatedContent.title}
        onClose={() => setStudyMode(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Input Section */}
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

      {/* Generated Content Section */}
      {generatedContent && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Study Materials</CardTitle>
              <Button onClick={handleSaveContent} variant="outline">
                <Save className="mr-2 h-4 w-4" />
                Save & Sign Up
              </Button>
            </CardHeader>
          </Card>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">
                <BookOpen className="mr-2 h-4 w-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="flashcards">
                <CreditCard className="mr-2 h-4 w-4" />
                Flashcards ({generatedContent.flashcards.length})
              </TabsTrigger>
              <TabsTrigger value="practice">
                <Brain className="mr-2 h-4 w-4" />
                Practice Questions ({generatedContent.practiceQuestions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{generatedContent.title} - Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                      {generatedContent.summary}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Flashcards</h3>
                <Button onClick={() => setStudyMode(true)}>
                  Start Studying
                </Button>
              </div>
              <div className="grid gap-4">
                {generatedContent.flashcards.map((card, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="font-medium text-sm">Q{index + 1}: {card.question}</div>
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                          A: {card.answer}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="practice" className="space-y-4">
              <div className="grid gap-4">
                {generatedContent.practiceQuestions.map((question, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="font-medium">Q{index + 1}: {question.question}</div>
                        <div className="space-y-1">
                          {question.options.map((option, optionIndex) => (
                            <div 
                              key={optionIndex} 
                              className={`p-2 rounded text-sm ${
                                option === question.correctAnswer 
                                  ? 'bg-green-50 border border-green-200 text-green-800' 
                                  : 'bg-muted/50'
                              }`}
                            >
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </div>
                          ))}
                        </div>
                        {question.explanation && (
                          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-200">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default GuestStudyGenerator;
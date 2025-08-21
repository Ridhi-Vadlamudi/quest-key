
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { FileText, Brain, CreditCard, Play, Plus, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import FlashcardStudy from "@/components/FlashcardStudy";

interface Document {
  id: string;
  title: string;
  created_at: string;
  file_type?: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  document_id: string;
}

interface Summary {
  id: string;
  content: string;
  document_id: string;
}

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [studyMode, setStudyMode] = useState<{flashcards: Flashcard[], documentTitle: string} | null>(null);
  const [openDocuments, setOpenDocuments] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "add-content");
  const { toast } = useToast();

  // All useEffect hooks must be at the top, before any conditional returns
  useEffect(() => {
    fetchUserData();
  }, []);

  // Update activeTab when URL changes
  useEffect(() => {
    const tab = searchParams.get("tab") || "add-content";
    setActiveTab(tab);
  }, [searchParams]);

  const toggleDocumentOpen = (docId: string) => {
    setOpenDocuments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docId)) {
        newSet.delete(docId);
      } else {
        newSet.add(docId);
      }
      return newSet;
    });
  };

  const switchToTab = (tabName: string, docId?: string) => {
    console.log('Switching to tab:', tabName, 'for document:', docId);
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
    
    // If a document ID is provided, scroll to it after a short delay
    if (docId) {
      setTimeout(() => {
        const element = document.getElementById(`doc-${docId}`);
        console.log('Looking for element:', `doc-${docId}`, 'Found:', !!element);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight effect
          element.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
          }, 2000);
        }
      }, 100);
    }
  };

  const deleteDocument = async (docId: string, docTitle: string) => {
    try {
      // Delete all related content first
      await Promise.all([
        supabase.from('summaries').delete().eq('document_id', docId),
        supabase.from('flashcards').delete().eq('document_id', docId),
        supabase.from('practice_questions').delete().eq('document_id', docId),
      ]);

      // Then delete the document
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      setSummaries(prev => prev.filter(summary => summary.document_id !== docId));
      setFlashcards(prev => prev.filter(flashcard => flashcard.document_id !== docId));

      // Show success message
      toast({
        title: "Document deleted",
        description: `"${docTitle}" and all its study materials have been deleted.`,
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchUserData = async () => {
    try {
      // Fetch documents
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      setDocuments(docsData || []);

      // Fetch summaries
      const { data: summariesData } = await supabase
        .from("summaries")
        .select("*")
        .in("document_id", docsData?.map(d => d.id) || []);

      setSummaries(summariesData || []);

      // Fetch flashcards
      const { data: flashcardsData } = await supabase
        .from("flashcards")
        .select("*")
        .in("document_id", docsData?.map(d => d.id) || []);

      setFlashcards(flashcardsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (studyMode) {
    return (
      <FlashcardStudy
        flashcards={studyMode.flashcards}
        documentTitle={studyMode.documentTitle}
        onClose={() => setStudyMode(null)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Study Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your documents and study materials
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => {
        console.log('Tab changed to:', value);
        setActiveTab(value);
        setSearchParams({ tab: value });
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="add-content">
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="summaries">
            <Brain className="mr-2 h-4 w-4" />
            Summaries ({summaries.length})
          </TabsTrigger>
          <TabsTrigger value="flashcards">
            <CreditCard className="mr-2 h-4 w-4" />
            Flashcards ({flashcards.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="add-content" className="space-y-6">
          <FileUpload />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first content to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => {
                const docSummaries = summaries.filter(s => s.document_id === doc.id);
                const docFlashcards = flashcards.filter(f => f.document_id === doc.id);
                
                return (
                  <Card key={doc.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="truncate">{doc.title}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {doc.file_type?.split("/")[1]?.toUpperCase() || "TEXT"}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{doc.title}"? This will permanently remove the document and all its associated summaries, flashcards, and practice questions. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteDocument(doc.id, doc.title)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        Created {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mb-3">
                        <Badge variant="outline">{docSummaries.length} Summary</Badge>
                        <Badge variant="outline">{docFlashcards.length} Flashcards</Badge>
                      </div>
                      <div className="flex gap-2">
                         {docSummaries.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              console.log('View Summary clicked for doc:', doc.id);
                              e.preventDefault();
                              e.stopPropagation();
                              switchToTab("summaries", doc.id);
                            }}
                          >
                            <Brain className="mr-1 h-3 w-3" />
                            View Summary
                          </Button>
                        )}
                        {docFlashcards.length > 0 && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              console.log('Study Cards clicked for doc:', doc.id);
                              e.preventDefault();
                              e.stopPropagation();
                              switchToTab("flashcards", doc.id);
                            }}
                          >
                            <CreditCard className="mr-1 h-3 w-3" />
                            Study Cards
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="summaries" className="space-y-4">
          {summaries.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No summaries yet</h3>
                <p className="text-muted-foreground">
                  Add content to generate AI summaries
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {documents.filter(doc => summaries.some(s => s.document_id === doc.id)).map((doc) => {
                const docSummaries = summaries.filter(s => s.document_id === doc.id);
                
                return docSummaries.map((summary) => (
                  <Card key={summary.id} id={`doc-${doc.id}`} className="transition-all duration-300">
                    <CardHeader>
                      <CardTitle>{doc.title} - Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                          {summary.content}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ));
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-4">
          {flashcards.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No flashcards yet</h3>
                <p className="text-muted-foreground">
                  Add content to generate AI flashcards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {documents.filter(doc => flashcards.some(f => f.document_id === doc.id)).map((doc) => {
                const docFlashcards = flashcards.filter(f => f.document_id === doc.id);
                const isOpen = openDocuments.has(doc.id);
                
                return (
                  <Card key={doc.id} id={`doc-${doc.id}`} className="transition-all duration-300">
                    <Collapsible open={isOpen} onOpenChange={() => toggleDocumentOpen(doc.id)}>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50">
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isOpen ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                              <span>{doc.title}</span>
                            </div>
                            <Badge variant="secondary">{docFlashcards.length} Cards</Badge>
                          </CardTitle>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent>
                          <div className="space-y-3 mb-4">
                            {docFlashcards.slice(0, 3).map((card, index) => (
                              <div key={card.id} className="border rounded-lg p-3 bg-muted/30">
                                <p className="font-medium text-sm mb-1">Q{index + 1}: {card.question}</p>
                                <p className="text-sm text-muted-foreground">
                                  A: {card.answer.slice(0, 100)}{card.answer.length > 100 ? '...' : ''}
                                </p>
                              </div>
                            ))}
                            
                            {docFlashcards.length > 3 && (
                              <p className="text-sm text-muted-foreground text-center">
                                ...and {docFlashcards.length - 3} more cards
                              </p>
                            )}
                          </div>
                          
                          <Button 
                            className="w-full" 
                            onClick={() => {
                              setStudyMode({
                                flashcards: docFlashcards,
                                documentTitle: doc.title
                              });
                            }}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Study All {docFlashcards.length} Cards
                          </Button>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from "@/components/FileUpload";
import { FileText, Brain, CreditCard, Play, Plus } from "lucide-react";

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
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch documents
      const { data: docsData } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user?.id)
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

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const defaultTab = searchParams.get("tab") || "upload";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Study Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your documents and study materials
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload
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

        <TabsContent value="upload" className="space-y-6">
          <FileUpload />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No documents yet</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your first document to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{doc.title}</span>
                      <Badge variant="secondary">
                        {doc.file_type?.split("/")[1]?.toUpperCase() || "TEXT"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Created {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Play className="mr-1 h-3 w-3" />
                        Study
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  Upload documents to generate AI summaries
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {summaries.map((summary) => {
                const doc = documents.find(d => d.id === summary.document_id);
                return (
                  <Card key={summary.id}>
                    <CardHeader>
                      <CardTitle>{doc?.title} - Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-sm whitespace-pre-wrap">
                          {summary.content.slice(0, 200)}...
                        </p>
                      </div>
                      <Button size="sm" className="mt-3">
                        Read Full Summary
                      </Button>
                    </CardContent>
                  </Card>
                );
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
                  Upload documents to generate AI flashcards
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {flashcards.slice(0, 10).map((card) => {
                const doc = documents.find(d => d.id === card.document_id);
                return (
                  <Card key={card.id}>
                    <CardHeader>
                      <CardTitle className="text-sm">{doc?.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium text-sm">Q: {card.question}</p>
                        <p className="text-sm text-muted-foreground">
                          A: {card.answer.slice(0, 100)}...
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {flashcards.length > 10 && (
            <Card>
              <CardContent className="pt-6 text-center">
                <Button>View All {flashcards.length} Flashcards</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

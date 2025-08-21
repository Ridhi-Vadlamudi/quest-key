import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Type, Brain } from "lucide-react";

const UploadSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Create Study Materials in <span className="text-primary">2 Simple Steps</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Paste your study materials and let our AI transform them into powerful learning tools
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-card border-2 border-dashed border-border p-12 text-center mb-12 hover:border-primary/50 transition-colors group">
            <CardContent className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-card-foreground mb-3">
                  Paste Your Study Materials
                </h3>
                <p className="text-muted-foreground mb-6">
                  Copy text from PDFs, DOCX files, or any study material and paste it below.
                </p>
              </div>
              <div className="flex justify-center gap-4 mb-8">
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">PDF Text</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">DOCX Text</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border">
                  <Type className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Notes</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Syllabus</span>
                </div>
              </div>
              <Button variant="hero" size="lg" className="group">
                <Brain className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Get Started Below
              </Button>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                1
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Paste</h3>
              <p className="text-muted-foreground">Copy and paste your study content from any source</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                2
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Study</h3>
              <p className="text-muted-foreground">AI creates summaries, flashcards, and practice questions instantly</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UploadSection;
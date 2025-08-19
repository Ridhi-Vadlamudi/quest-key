import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FileUpload from "@/components/FileUpload";

const Index = () => {
  return (
    <>
      <Hero />
      <Features />
      <section id="upload" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 id="features" className="text-3xl font-bold mb-4">Start Creating Study Materials</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your documents or paste text to generate AI-powered summaries, flashcards, and practice questions.
          </p>
        </div>
          <FileUpload />
        </div>
      </section>
    </>
  );
};

export default Index;

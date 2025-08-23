import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Zap } from "lucide-react";
import heroImage from "@/assets/hero-study.jpg";

const Hero = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    // Navigate to dashboard documents tab
    navigate("/dashboard?tab=documents");
  };

  const handleLearnMoreClick = () => {
    const featuresSection = document.getElementById("features");
    featuresSection?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section className="bg-gradient-hero relative overflow-hidden">
      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                AI-Powered
                <br />
                <span className="text-white">Study Assistant</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 leading-relaxed max-w-lg">
                Transform your PDFs and notes into summaries, flashcards, and practice questions. 
                Study smarter with AI-generated content and spaced repetition.
              </p>
            </div>
            
          <div className="flex gap-4">
            <Button onClick={handleUploadClick} size="lg">
              Start Studying
            </Button>
            <Button onClick={() => navigate("/auth")} variant="outline" size="lg">
              Sign Up
            </Button>
          </div>

            <div className="flex items-center gap-6 text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-sm">PDF, DOCX, TXT</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span className="text-sm">AI-Generated</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="AI Study Assistant Interface"
                className="w-full h-auto rounded-2xl shadow-glow"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-2xl blur-3xl -z-10 transform scale-110"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
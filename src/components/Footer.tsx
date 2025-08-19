import { Brain, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gradient-subtle border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">StudyAI</h3>
              <p className="text-xs text-muted-foreground">Powered by AI</p>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform your study materials into powerful learning experiences with AI-generated summaries, flashcards, and practice questions.
          </p>
        </div>

        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 StudyAI. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm">
            Built with ❤️ for students worldwide
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
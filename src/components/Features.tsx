import { Card, CardContent } from "@/components/ui/card";
import { FileText, Brain, Repeat, BarChart3, Lightbulb, Download } from "lucide-react";
import flashcardImage from "@/assets/flashcard-feature.jpg";

const Features = () => {
  const features = [
    {
      icon: FileText,
      title: "Smart Document Processing",
      description: "Upload PDFs, DOCX, or paste text. Our AI intelligently chunks and cleans your content for optimal learning."
    },
    {
      icon: Brain,
      title: "AI-Generated Summaries",
      description: "Get concise, comprehensive chapter summaries that capture the key concepts and main ideas."
    },
    {
      icon: Repeat,
      title: "Interactive Flashcards",
      description: "Auto-generated flashcards with spaced repetition algorithm to maximize retention and recall."
    },
    {
      icon: BarChart3,
      title: "Practice Questions",
      description: "Multiple choice and short-answer questions with detailed explanations to test your understanding."
    },
    {
      icon: Lightbulb,
      title: "Personalized Learning",
      description: "Adaptive study plans that focus on your weak areas and optimize your learning path."
    },
    {
      icon: Download,
      title: "Export & Share",
      description: "Export flashcards to Anki, CSV, or share study sets with classmates and study groups."
    }
  ];

  return (
    <section className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need to <span className="text-primary">Study Smarter</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our AI-powered platform transforms your study materials into engaging, 
            personalized learning experiences that adapt to your pace and preferences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-accent rounded-xl group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-card rounded-3xl p-8 lg:p-12 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-card-foreground mb-6">
                See Your Flashcards in Action
              </h3>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Our AI doesn't just create flashcards – it creates smart, contextual study materials 
                that adapt to your learning style and help you retain information longer.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                  <span className="text-muted-foreground">Automatic difficulty adjustment based on your performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                  <span className="text-muted-foreground">Visual cues and memory techniques embedded in cards</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                  <span className="text-muted-foreground">Progress tracking with detailed analytics</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img 
                src={flashcardImage} 
                alt="AI-Generated Flashcard Interface"
                className="w-full h-auto rounded-2xl shadow-md"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
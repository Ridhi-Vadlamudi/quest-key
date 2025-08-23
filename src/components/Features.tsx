import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Brain, Repeat, BarChart3, Lightbulb, Download, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import flashcardImage from "@/assets/flashcard-feature.jpg";

const Features = () => {
  const navigate = useNavigate();
  const [expandedFeatures, setExpandedFeatures] = useState<Set<number>>(new Set());

  const toggleFeature = (index: number) => {
    setExpandedFeatures(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const navigateToFeature = (path: string) => {
    navigate(path);
  };

  const features = [
    {
      icon: FileText,
      title: "Smart Document Processing",
      description: "Upload PDFs, DOCX, or paste text. Our AI intelligently chunks and cleans your content for optimal learning.",
      action: "navigate",
      path: "/dashboard?tab=add-content"
    },
    {
      icon: Brain,
      title: "AI-Generated Summaries",
      description: "Get concise, comprehensive chapter summaries that capture the key concepts and main ideas.",
      action: "navigate", 
      path: "/dashboard?tab=summaries"
    },
    {
      icon: Repeat,
      title: "Interactive Flashcards",
      description: "Auto-generated flashcards with spaced repetition algorithm to maximize retention and recall.",
      action: "navigate",
      path: "/dashboard?tab=flashcards"
    },
    {
      icon: BarChart3,
      title: "Practice Questions",
      description: "Multiple choice and short-answer questions with detailed explanations to test your understanding.",
      action: "expand",
      expandedContent: "Coming soon! Our AI will generate personalized practice questions based on your study materials. Features will include multiple choice questions, short answers, and essay prompts with intelligent scoring and detailed feedback to help you master the material."
    },
    {
      icon: Lightbulb,
      title: "Personalized Learning",
      description: "Adaptive study plans that focus on your weak areas and optimize your learning path.",
      action: "expand",
      expandedContent: "Our AI analyzes your performance patterns and creates personalized study schedules. It identifies knowledge gaps, suggests review sessions, and adapts the difficulty based on your progress to maximize learning efficiency."
    },
    {
      icon: Download,
      title: "Export & Share",
      description: "Export flashcards to Anki, CSV, or share study sets with classmates and study groups.",
      action: "expand",
      expandedContent: "Export your generated study materials in various formats including Anki decks, CSV files, and PDF summaries. Share study sets with friends or create collaborative study groups with real-time sync capabilities."
    }
  ];

  const handleFeatureClick = (feature: any, index: number) => {
    if (feature.action === "navigate") {
      navigateToFeature(feature.path);
    } else {
      toggleFeature(index);
    }
  };

  return (
    <section id="features" className="py-24 bg-gradient-subtle">
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
          {features.map((feature, index) => {
            const isExpanded = expandedFeatures.has(index);
            const isNavigatable = feature.action === "navigate";
            
            return (
              <Card 
                key={index} 
                className={`bg-gradient-card border-0 shadow-md hover:shadow-lg transition-all duration-300 group ${
                  isNavigatable ? 'cursor-pointer hover:scale-105' : ''
                }`}
                onClick={() => handleFeatureClick(feature, index)}
              >
                {feature.action === "expand" ? (
                  <Collapsible open={isExpanded} onOpenChange={() => toggleFeature(index)}>
                    <CollapsibleTrigger asChild>
                      <CardContent className="p-8 cursor-pointer">
                        <div className="mb-4">
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
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-8 pb-8">
                        <div className="bg-accent/10 rounded-lg p-4 mt-4">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {feature.expandedContent}
                          </p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-accent rounded-xl group-hover:scale-110 transition-transform">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="mt-4">
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary">
                        Try it now →
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="bg-gradient-card rounded-3xl p-8 lg:p-12 shadow-lg">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-card-foreground mb-6">
              See Your Flashcards in Action
            </h3>
            <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
              Our AI doesn't just create flashcards – it creates smart, contextual study materials 
              that adapt to your learning style and help you retain information longer.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                <span className="text-muted-foreground">Automatic difficulty adjustment based on your performance</span>
              </li>
              <li className="flex items-start gap-3 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                <span className="text-muted-foreground">Visual cues and memory techniques embedded in cards</span>
              </li>
              <li className="flex items-start gap-3 justify-center">
                <div className="w-2 h-2 bg-primary rounded-full mt-3"></div>
                <span className="text-muted-foreground">Progress tracking with detailed analytics</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
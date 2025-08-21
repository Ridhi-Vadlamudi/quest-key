import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle } from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  document_id: string;
}

interface FlashcardStudyProps {
  flashcards: Flashcard[];
  documentTitle: string;
  onClose: () => void;
}

const FlashcardStudy = ({ flashcards, documentTitle, onClose }: FlashcardStudyProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const markAsCompleted = () => {
    setCompletedCards(prev => new Set(prev).add(currentIndex));
    if (currentIndex < flashcards.length - 1) {
      nextCard();
    }
  };

  const resetProgress = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setCompletedCards(new Set());
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Studying: {documentTitle}</h2>
          <Button variant="outline" onClick={onClose}>
            Back to Dashboard
          </Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Card {currentIndex + 1} of {flashcards.length}</span>
            <span>{completedCards.size} completed</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question</span>
            {completedCards.has(currentIndex) && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6">{currentCard?.question}</p>
          
          {!showAnswer ? (
            <Button 
              onClick={() => setShowAnswer(true)}
              className="w-full"
            >
              Show Answer
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Answer:</h4>
                <p>{currentCard?.answer}</p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={markAsCompleted}
                  variant="default"
                  className="flex-1"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Got it right!
                </Button>
                <Button 
                  onClick={nextCard}
                  variant="outline"
                  className="flex-1"
                >
                  Need more practice
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={prevCard}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={resetProgress}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Progress
          </Button>
        </div>

        <Button 
          variant="outline" 
          onClick={nextCard}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {currentIndex === flashcards.length - 1 && completedCards.size === flashcards.length && (
        <Card className="mt-6 bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-green-600">
              You've completed all {flashcards.length} flashcards for "{documentTitle}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FlashcardStudy;
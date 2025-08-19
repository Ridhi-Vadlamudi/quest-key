
import { Suspense } from "react";
import HeaderContent from "./HeaderContent";

const Header = () => {
  return (
    <Suspense fallback={
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <div className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">StudyHelp</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Learning</p>
              </div>
            </div>
          </div>
        </div>
      </header>
    }>
      <HeaderContent />
    </Suspense>
  );
};

export default Header;

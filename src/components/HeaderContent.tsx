import { Button } from "@/components/ui/button";
import { BookOpen, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

const HeaderContent = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <button 
            onClick={() => handleNavigation("/")} 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">StudyHelp</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Learning</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#upload" className="text-muted-foreground hover:text-foreground transition-colors">
              Upload
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation("/dashboard")} 
                  className="hidden md:inline-flex"
                >
                  Dashboard
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  className="hidden md:inline-flex"
                >
                  Sign Out
                </Button>
                <Button 
                  variant="hero" 
                  onClick={() => handleNavigation("/dashboard")}
                >
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  onClick={() => handleNavigation("/auth")} 
                  className="hidden md:inline-flex"
                >
                  Sign In
                </Button>
                <Button 
                  variant="hero" 
                  onClick={() => handleNavigation("/auth")}
                >
                  Get Started
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderContent;
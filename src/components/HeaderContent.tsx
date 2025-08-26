import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, Menu, Home, BookMarked, LogOut, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const HeaderContent = () => {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleChangeAccount = () => {
    navigate("/auth");
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
            <Button 
              variant="hero" 
              onClick={() => handleNavigation("/dashboard")}
            >
              My Documents
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-border/50 hover:bg-accent">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background border border-border shadow-md z-50">
                <DropdownMenuItem onClick={() => handleNavigation("/")} className="cursor-pointer hover:bg-accent">
                  <Home className="mr-2 h-4 w-4" />
                  Homepage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation("/dashboard")} className="cursor-pointer hover:bg-accent">
                  <BookMarked className="mr-2 h-4 w-4" />
                  Study Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleChangeAccount} className="cursor-pointer hover:bg-accent">
                  <UserX className="mr-2 h-4 w-4" />
                  Change Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive hover:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderContent;
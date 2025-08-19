import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building2,
  School,
  Users,
  Home,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
// Removed AuthContext
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  // Auth removed

  // Navigation is now static, showing all levels

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                BookTrack
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button size="sm" variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Link to="/admin/state">
              <Button size="sm" variant="outline">
                <Building2 className="h-4 w-4 mr-2" />
                State Level
              </Button>
            </Link>
            <Link to="/admin/district">
              <Button size="sm" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                District Level
              </Button>
            </Link>
            <Link to="/admin/block">
              <Button size="sm" variant="outline">
                <School className="h-4 w-4 mr-2" />
                Block Level
              </Button>
            </Link>
            <Link to="/admin/school">
              <Button size="sm" variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                School Level
              </Button>
            </Link>
            <Link to="/admin/private-school">
              <Button size="sm" variant="outline">
                <School className="h-4 w-4 mr-2" />
                Private School
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <Link to="/login">
              <Button size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

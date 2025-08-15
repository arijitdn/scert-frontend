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
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const { user, profile, signOut, getDashboardPath } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [{ path: "/", label: "Home", icon: Home }];

    if (!user || !profile) {
      return baseItems;
    }

    // Role-based navigation items
    const roleBasedItems = [];

    switch (profile.role) {
      case "STATE":
        roleBasedItems.push(
          { path: "/admin/state", label: "State Level", icon: Building2 },
          {
            path: "/admin/district",
            label: "District Level (DEO)",
            icon: Users,
          },
          { path: "/admin/block", label: "Block Level (IS)", icon: School },
          { path: "/admin/school", label: "School Level", icon: BookOpen },
          {
            path: "/admin/private-school",
            label: "Private Schools",
            icon: School,
          },
        );
        break;
      case "DISTRICT":
        roleBasedItems.push(
          {
            path: "/admin/district",
            label: "District Level (DEO)",
            icon: Users,
          },
          { path: "/admin/block", label: "Block Level (IS)", icon: School },
          { path: "/admin/school", label: "School Level", icon: BookOpen },
        );
        break;
      case "BLOCK":
        roleBasedItems.push(
          { path: "/admin/block", label: "Block Level (IS)", icon: School },
          { path: "/admin/school", label: "School Level", icon: BookOpen },
        );
        break;
      case "SCHOOL":
        roleBasedItems.push({
          path: "/admin/school",
          label: "School Level",
          icon: BookOpen,
        });
        break;
      case "PRIVATE_SCHOOL":
        roleBasedItems.push({
          path: "/admin/private-school",
          label: "Private School",
          icon: School,
        });
        break;
      default:
        roleBasedItems.push({
          path: "/admin/school",
          label: "School Level",
          icon: BookOpen,
        });
        break;
    }

    return [...baseItems, ...roleBasedItems];
  };

  const navigationItems = getNavigationItems();

  const handleSignOut = async () => {
    await signOut();
  };

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

          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "flex items-center space-x-2 h-9",
                      isActive && "bg-primary text-primary-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {profile?.name || profile?.user_id || "User"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardPath()}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardPath()}>
                      <Building2 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}

            <select
              value={location.pathname}
              onChange={(e) => (window.location.href = e.target.value)}
              className="border border-border rounded-md px-3 py-1 text-sm"
            >
              {navigationItems.map((item) => (
                <option key={item.path} value={item.path}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

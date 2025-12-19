import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  LayoutDashboard, 
  Users, 
  Menu, 
  X, 
  LogOut, 
  BrainCircuit,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Elder", path: "/elder", icon: BrainCircuit, roles: ["elder", "admin"] },
    { name: "Caregiver", path: "/caregiver", icon: LayoutDashboard, roles: ["caregiver", "admin"] },
    { name: "Family", path: "/family", icon: Users, roles: ["family", "admin"] },
  ].filter(link => !link.roles || (profile && link.roles.includes(profile.role)));

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all duration-300">
            MemoryFriend
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <div
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  isActive(link.path) 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <link.icon className={cn("w-4 h-4 relative z-10", isActive(link.path) ? "animate-pulse" : "")} />
                <span className="relative z-10">{link.name}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="icon" className="rounded-full md:flex hidden">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium md:block hidden">{profile?.full_name || user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </>
          ) : (
            <Link to="/auth">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Login
              </Button>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 overflow-hidden">
          <div className="bg-background/95 backdrop-blur-md border rounded-2xl p-4 shadow-xl flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                  isActive(link.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}>
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.name} Dashboard</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

import { useState, useEffect, useMemo } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { 
  BrainCircuit, 
  LayoutDashboard, 
  Users, 
  Heart, 
  Bell, 
  LogOut, 
  X, 
  Menu 
} from "lucide-react";
import { Button } from "./ui/button";

// Polyfill for process if it doesn't exist (primarily for Vite dev environment)
if (typeof process === 'undefined') {
  // @ts-ignore
  globalThis.process = { env: {} };
}

  export const Navbar = () => {
    const { user, profile, signOut } = useAuth();
  
    // Safe Link component that works in both Vite and Next.js
    const SafeLink = ({ href, children, ...props }: any) => {
      // If we're in Vite (local dev), use RouterLink
      const isVite = typeof window !== 'undefined' && 
                     !window.__NEXT_DATA__ && 
                     (window.location.port === '8080' || window.location.port === '5173');
      
      if (isVite) {
        return <RouterLink to={href} {...props}>{children}</RouterLink>;
      }
      // Otherwise use NextLink
      return <NextLink href={href} {...props}>{children}</NextLink>;
    };

  // Safe location/pathname access
  let pathname = "";
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const nextPathname = usePathname();
    pathname = nextPathname || "";
  } catch (e) {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const location = useLocation();
      pathname = location.pathname;
    } catch (e2) {
      pathname = "";
    }
  }

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

  const isActive = (path: string) => pathname === path;

  const Logo = () => (
    <div className="flex items-center gap-2 group">
      <div className="p-2 bg-primary rounded-xl text-primary-foreground shadow-lg shadow-primary/20">
        <Heart className="w-6 h-6 fill-current" />
      </div>
      <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all duration-300">
        MemoryFriend
      </span>
    </div>
  );

  const NavItem = ({ link }: { link: typeof navLinks[0] }) => (
    <div className={cn(
      "relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2",
      isActive(link.path) 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    )}>
      <link.icon className={cn("w-4 h-4 relative z-10", isActive(link.path) ? "animate-pulse" : "")} />
      <span className="relative z-10">{link.name}</span>
    </div>
  );

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 py-3",
        isScrolled ? "bg-background/80 backdrop-blur-md border-b" : "bg-transparent"
      )}
    >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <SafeLink href="/">
            <Logo />
          </SafeLink>
  
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border">
            {navLinks.map((link) => (
              <SafeLink key={link.path} href={link.path}>
                <NavItem link={link} />
              </SafeLink>
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
              <SafeLink href="/auth">
                <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                  Login
                </Button>
              </SafeLink>
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
                <SafeLink 
                  key={link.path} 
                  href={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    isActive(link.path) ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  )}>
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.name} Dashboard</span>
                  </div>
                </SafeLink>
              ))}
            </div>
          </div>
        )}

    </nav>
  );
};

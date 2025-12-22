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
      <div className="flex items-center gap-3 group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <div className="relative p-2 bg-white/40 backdrop-blur-md rounded-xl text-primary shadow-lg border border-white/20">
          <Heart className="w-6 h-6 fill-current" />
        </div>
        <span className="relative text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all duration-300">
          MemoryFriend
        </span>
      </div>
    );

    const NavItem = ({ link }: { link: typeof navLinks[0] }) => (
      <div className={cn(
        "relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden group/item",
        isActive(link.path) 
          ? "bg-primary text-white shadow-lg shadow-primary/20" 
          : "text-muted-foreground hover:text-foreground hover:bg-white/40"
      )}>
        {isActive(link.path) && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
        )}
        <link.icon className={cn("w-4 h-4 relative z-10", isActive(link.path) ? "animate-pulse" : "group-hover/item:scale-110 transition-transform")} />
        <span className="relative z-10 uppercase tracking-wider">{link.name}</span>
      </div>
    );

    return (
      <nav
        className={cn(
          "fixed top-4 left-0 right-0 z-50 transition-all duration-500 px-6",
          isScrolled ? "translate-y-0" : "-translate-y-2"
        )}
      >
          <div className={cn(
            "max-w-6xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500",
            isScrolled 
              ? "bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl shadow-black/5" 
              : "bg-transparent"
          )}>
            {/* Logo */}
            <SafeLink href="/">
              <Logo />
            </SafeLink>
    
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 px-1 py-1 rounded-2xl">
              {navLinks.map((link) => (
                <SafeLink key={link.path} href={link.path}>
                  <NavItem link={link} />
                </SafeLink>
              ))}
            </div>
    
            {/* Right Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end md:block hidden">
                    <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Connected User</p>
                    <p className="text-sm font-bold truncate max-w-[120px]">{profile?.full_name || user.email}</p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => signOut()} 
                    className="h-10 rounded-xl px-4 font-bold uppercase tracking-widest text-xs border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all shadow-sm"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <SafeLink href="/auth">
                  <Button className="h-11 rounded-xl px-8 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all bg-primary">
                    Join Collective
                  </Button>
                </SafeLink>
              )}
    
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl bg-white/40 backdrop-blur-sm border border-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </Button>
            </div>
          </div>
    
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-2xl p-4 shadow-2xl flex flex-col gap-2">
                {navLinks.map((link) => (
                  <SafeLink 
                    key={link.path} 
                    href={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                      isActive(link.path) 
                        ? "bg-primary text-white shadow-xl shadow-primary/30" 
                        : "bg-white/40 hover:bg-white/60"
                    )}>
                      <link.icon className="w-6 h-6" />
                      <span className="font-bold uppercase tracking-widest text-sm">{link.name} Interface</span>
                    </div>
                  </SafeLink>
                ))}
              </div>
            </div>
          )}

      </nav>
    );
  };

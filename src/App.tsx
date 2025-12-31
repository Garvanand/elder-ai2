import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { TourProvider } from "@/contexts/TourContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FuturisticBackground } from "@/components/ui/FuturisticBackground";
import { TourOverlay, GuestModeBadge } from "@/components/TourOverlay";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Elder from "./pages/Elder";
import Caregiver from "./pages/Caregiver";
import Clinician from "./pages/Clinician";
import Family from "./pages/Family";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DemoProvider>
        <TourProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <FuturisticBackground />
              <Navbar />
              <GuestModeBadge />
              <TourOverlay />
              <main className="pt-20 min-h-screen">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/elder" element={<Elder />} />
                  <Route path="/caregiver" element={<Caregiver />} />
                  <Route path="/clinician" element={<Clinician />} />
                  <Route path="/family" element={<Family />} />
                  <Route path="/support" element={<Support />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </BrowserRouter>
          </TooltipProvider>
        </TourProvider>
      </DemoProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

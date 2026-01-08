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
import { TourOverlay, GuestModeBadge } from "@/components/TourOverlay";
import { cn } from "@/lib/utils";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Elder from "./pages/Elder";
import Caregiver from "./pages/Caregiver";
import Clinician from "./pages/Clinician";
import Family from "./pages/Family";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SecurityLab from "./pages/SecurityLab";
import Status from "./pages/Status";
import UplinkDocs from "./pages/UplinkDocs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const isNativeMobile = typeof window !== 'undefined' && (window as any).isNativeMobile;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DemoProvider>
          <TourProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
                <BrowserRouter>
                  {!isNativeMobile && <Navbar />}
                  <GuestModeBadge />
                  <TourOverlay />
                <main className={cn("min-h-screen", !isNativeMobile && "pt-20")}>
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
                    <Route path="/security" element={<SecurityLab />} />
                    <Route path="/status" element={<Status />} />
                    <Route path="/docs" element={<UplinkDocs />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                {!isNativeMobile && <Footer />}
              </BrowserRouter>
            </TooltipProvider>
          </TourProvider>
        </DemoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

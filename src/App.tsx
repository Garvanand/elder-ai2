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
import Index from "./views/Index";
import Auth from "./views/Auth";
import Elder from "./views/Elder";
import Caregiver from "./views/Caregiver";
import Clinician from "./views/Clinician";
import Family from "./views/Family";
import Support from "./views/Support";
import TermsOfService from "./views/TermsOfService";
import PrivacyPolicy from "./views/PrivacyPolicy";
import SecurityLab from "./views/SecurityLab";
import Status from "./views/Status";
import UplinkDocs from "./views/UplinkDocs";
import NotFound from "./views/NotFound";

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

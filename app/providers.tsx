"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { DemoProvider } from "@/contexts/DemoContext";
import { TourProvider } from "@/contexts/TourContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DemoProvider>
          <TourProvider>
            <TooltipProvider>
              <Navbar />
              <main className="pt-16 min-h-screen">
                {children}
              </main>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </TourProvider>
        </DemoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

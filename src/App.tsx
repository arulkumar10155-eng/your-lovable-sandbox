import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TrackProblem from "./pages/TrackProblem";
import LiveMap from "./pages/LiveMap";
import SocialFeed from "./pages/SocialFeed";
import CadreRegister from "./pages/CadreRegister";
import CadreLogin from "./pages/CadreLogin";
import CadreDashboard from "./pages/CadreDashboard";
import KnowYourCadresPage from "./pages/KnowYourCadresPage";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import CompletedWorks from "./pages/CompletedWorks";
import MobileAuth from "./pages/MobileAuth";
import InstallApp from "./pages/InstallApp";
import GroundIntelligence from "./pages/GroundIntelligence";

// Aggressive caching cuts redundant fetches under high concurrency.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 300_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/track" element={<TrackProblem />} />
            <Route path="/map" element={<LiveMap />} />
            <Route path="/feed" element={<SocialFeed />} />
            <Route path="/know-your-cadres" element={<KnowYourCadresPage />} />
            <Route path="/cadre/register" element={<CadreRegister />} />
            <Route path="/cadre/login" element={<CadreLogin />} />
            <Route path="/cadre" element={<CadreDashboard />} />
            <Route path="/department" element={<DepartmentDashboard />} />
            <Route path="/completed-works" element={<CompletedWorks />} />
            <Route path="/mobile-auth" element={<MobileAuth />} />
            <Route path="/install" element={<InstallApp />} />
            <Route path="/ground-intelligence" element={<GroundIntelligence />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

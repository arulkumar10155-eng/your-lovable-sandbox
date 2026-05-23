import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-load every non-landing route so the initial bundle stays tiny.
// Heavy chunks (Recharts, Leaflet, admin tooling) only load when needed.
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const TrackProblem = lazy(() => import("./pages/TrackProblem"));
const LiveMap = lazy(() => import("./pages/LiveMap"));
const SocialFeed = lazy(() => import("./pages/SocialFeed"));
const CadreRegister = lazy(() => import("./pages/CadreRegister"));
const CadreLogin = lazy(() => import("./pages/CadreLogin"));
const CadreDashboard = lazy(() => import("./pages/CadreDashboard"));
const KnowYourCadresPage = lazy(() => import("./pages/KnowYourCadresPage"));
const DepartmentDashboard = lazy(() => import("./pages/DepartmentDashboard"));
const CompletedWorks = lazy(() => import("./pages/CompletedWorks"));
const MobileAuth = lazy(() => import("./pages/MobileAuth"));
const InstallApp = lazy(() => import("./pages/InstallApp"));
const GroundIntelligence = lazy(() => import("./pages/GroundIntelligence"));

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

// Lightweight non-blocking top-bar avoids full-screen white flash between routes.
const RouteFallback = () => (
  <div className="fixed top-0 left-0 right-0 h-0.5 bg-primary/70 z-[200] animate-pulse" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
